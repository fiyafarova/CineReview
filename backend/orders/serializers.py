from decimal import Decimal

from rest_framework import serializers

from users.models import UserProfile

from .models import Order, PromoCode


def calculate_checkout(items, promo_code=''):
    """
    Единая функция расчёта checkout.
    Используется и в preview, и при реальном создании заказа.

    Почему это важно:
    - не дублируем логику скидки в нескольких местах
    - backend всегда остаётся источником истины по total/bonus
    """
    subtotal = sum(
        Decimal(str(item['price'])) * item['qty']
        for item in items
    ).quantize(Decimal('0.01'))

    promo_code = (promo_code or '').strip().upper()
    discount = Decimal('0.00')

    if promo_code:
        promo = PromoCode.objects.filter(code__iexact=promo_code).first()

        if not promo:
            raise ValueError('Такого промокода не существует.')

        if not promo.is_active:
            raise ValueError('Этот промокод сейчас не работает.')

        discount = (
            subtotal * Decimal(promo.discount_percent) / Decimal('100')
        ).quantize(Decimal('0.01'))

        # Сохраняем код в каноничном виде из базы.
        promo_code = promo.code

    total = (subtotal - discount).quantize(Decimal('0.01'))

    # По задаче начисляем 1% бонусами после заказа.
    earned_bonus = (total * Decimal('0.01')).quantize(Decimal('0.01'))

    return {
        'promoCode': promo_code,
        'subtotal': subtotal,
        'discountAmount': discount,
        'total': total,
        'earnedBonus': earned_bonus,
    }


class CartItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField(max_length=255)
    price = serializers.FloatField(min_value=0)
    qty = serializers.IntegerField(min_value=1)


class CheckoutPreviewSerializer(serializers.Serializer):
    # Входные данные для preview checkout.
    items = CartItemSerializer(many=True)
    promoCode = serializers.CharField(max_length=50, required=False, allow_blank=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('Корзина не должна быть пустой.')
        return value

    def get_summary(self):
        """
        Вызывается из view.
        Возвращает уже посчитанную backend-сводку для checkout.
        """
        try:
            return calculate_checkout(
                self.validated_data['items'],
                self.validated_data.get('promoCode', ''),
            )
        except ValueError as exc:
            raise serializers.ValidationError({'promoCode': str(exc)})


class CheckoutSummarySerializer(serializers.Serializer):
    # Выходной формат preview checkout.
    promoCode = serializers.CharField(allow_blank=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    discountAmount = serializers.DecimalField(max_digits=10, decimal_places=2)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    earnedBonus = serializers.DecimalField(max_digits=10, decimal_places=2)


class OrderSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True)

    # total приходит с frontend, но backend всё равно пересчитывает его сам.
    # Мы используем присланный total только как контроль согласованности.
    total = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))

    promoCode = serializers.CharField(max_length=50, required=False, allow_blank=True)

    # Эти поля заполняются backend автоматически.
    status = serializers.CharField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discountAmount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    earnedBonus = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = (
            'id',
            'customerName',
            'customerAddress',
            'customerPhone',
            'items',
            'status',
            'promoCode',
            'subtotal',
            'discountAmount',
            'earnedBonus',
            'total',
            'createdAt',
        )
        read_only_fields = (
            'id',
            'status',
            'subtotal',
            'discountAmount',
            'earnedBonus',
            'createdAt',
        )

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('Корзина не должна быть пустой.')
        return value

    def validate(self, attrs):
        """
        Здесь backend:
        1. проверяет промокод
        2. пересчитывает subtotal / discount / total / bonus
        3. сравнивает frontend total с backend total
        4. кладёт рассчитанные поля в validated_data
        """
        try:
            summary = calculate_checkout(
                attrs['items'],
                attrs.get('promoCode', ''),
            )
        except ValueError as exc:
            raise serializers.ValidationError({'promoCode': str(exc)})

        incoming_total = Decimal(str(attrs['total'])).quantize(Decimal('0.01'))

        if summary['total'] != incoming_total:
            raise serializers.ValidationError({
                'total': 'Total does not match backend checkout calculation.',
            })

        attrs['promoCode'] = summary['promoCode']
        attrs['subtotal'] = summary['subtotal']
        attrs['discountAmount'] = summary['discountAmount']
        attrs['earnedBonus'] = summary['earnedBonus']
        attrs['total'] = summary['total']

        return attrs

    def create(self, validated_data):
        # JSONField ожидает обычный список словарей.
        validated_data['items'] = [dict(item) for item in validated_data['items']]

        order = Order.objects.create(**validated_data)

        # Начисляем бонусы сразу после создания заказа.
        # Важно делать это на backend, а не на frontend:
        # клиент не должен сам решать, сколько бонусов ему начислить.
        if order.user and not order.bonusAwarded and order.earnedBonus > 0:
            profile, _ = UserProfile.objects.get_or_create(user=order.user)
            profile.bonusBalance = (profile.bonusBalance + order.earnedBonus).quantize(Decimal('0.01'))
            profile.save(update_fields=['bonusBalance'])

            order.bonusAwarded = True
            order.save(update_fields=['bonusAwarded'])

        return order


class OrderSummarySerializer(serializers.Serializer):
    ordersCount = serializers.IntegerField()
    totalSpent = serializers.FloatField()
