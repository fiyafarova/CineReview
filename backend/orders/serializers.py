from decimal import Decimal

from rest_framework import serializers

from users.models import UserProfile

from .models import Order, PromoCode


def calculate_checkout(items, promo_code='', user=None, bonus_to_spend=Decimal('0.00')):
    """
    Единый backend-расчет checkout.

    Здесь backend сам считает:
    - subtotal
    - скидку по промокоду
    - сколько бонусов можно списать
    - итоговую сумму заказа
    - сколько бонусов будет начислено потом

    Важно:
    начисление бонусов здесь только рассчитывается,
    но фактически бонусы падают пользователю позже,
    когда заказ получает статус delivered.
    """
    subtotal = sum(
        (Decimal(str(item['price'])) * item['qty'] for item in items),
        Decimal('0.00'),
    ).quantize(Decimal('0.01'))

    promo_code = (promo_code or '').strip().upper()
    discount_amount = Decimal('0.00')

    if promo_code:
        promo = PromoCode.objects.filter(code__iexact=promo_code).first()

        if not promo:
            raise serializers.ValidationError({
                'promoCode': 'This promo code does not exist.',
            })

        if not promo.is_active:
            raise serializers.ValidationError({
                'promoCode': 'This promo code is currently inactive.',
            })

        discount_amount = (
            subtotal * Decimal(promo.discount_percent) / Decimal('100')
        ).quantize(Decimal('0.01'))

        # Сохраняем промокод в том виде, как он лежит в базе.
        promo_code = promo.code

    requested_bonus = Decimal(str(bonus_to_spend or 0)).quantize(Decimal('0.01'))

    if requested_bonus < 0:
        raise serializers.ValidationError({
            'bonusToSpend': 'Bonuses cannot be negative.',
        })

    available_bonus = Decimal('0.00')

    if user and getattr(user, 'is_authenticated', False):
        profile, _ = UserProfile.objects.get_or_create(user=user)
        available_bonus = Decimal(profile.bonusBalance).quantize(Decimal('0.01'))

        if requested_bonus > available_bonus:
            raise serializers.ValidationError({
                'bonusToSpend': 'There are not enough bonuses on the balance.',
            })

    # Нельзя списать бонусов больше, чем остается к оплате после скидки.
    max_bonus_applicable = max(
        Decimal('0.00'),
        (subtotal - discount_amount).quantize(Decimal('0.01')),
    )

    spent_bonus = min(requested_bonus, max_bonus_applicable).quantize(Decimal('0.01'))
    total = (subtotal - discount_amount - spent_bonus).quantize(Decimal('0.01'))

    # По задаче бонусы начисляются в размере 1% от итоговой суммы заказа.
    earned_bonus = (total * Decimal('0.01')).quantize(Decimal('0.01'))

    return {
        'promoCode': promo_code,
        'subtotal': subtotal,
        'discountAmount': discount_amount,
        'spentBonus': spent_bonus,
        'total': total,
        'earnedBonus': earned_bonus,
    }


class CartItemSerializer(serializers.Serializer):
    # Снимок одного товара из корзины, который попадет в заказ.
    id = serializers.IntegerField()
    name = serializers.CharField(max_length=255)
    price = serializers.FloatField(min_value=0)
    qty = serializers.IntegerField(min_value=1)


class CheckoutPreviewSerializer(serializers.Serializer):
    # Входные данные для preview checkout до создания заказа.
    items = CartItemSerializer(many=True)
    promoCode = serializers.CharField(max_length=50, required=False, allow_blank=True)
    bonusToSpend = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        min_value=Decimal('0.00'),
    )

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('The basket must not be empty.')
        return value

    def get_summary(self):
        # Возвращаем уже готовую backend-сводку для checkout.
        request = self.context.get('request')
        user = request.user if request else None

        return calculate_checkout(
            self.validated_data['items'],
            self.validated_data.get('promoCode', ''),
            user=user,
            bonus_to_spend=self.validated_data.get('bonusToSpend', Decimal('0.00')),
        )


class CheckoutSummarySerializer(serializers.Serializer):
    # Выходной формат preview checkout.
    promoCode = serializers.CharField(allow_blank=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    discountAmount = serializers.DecimalField(max_digits=10, decimal_places=2)
    spentBonus = serializers.DecimalField(max_digits=10, decimal_places=2)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    earnedBonus = serializers.DecimalField(max_digits=10, decimal_places=2)


class OrderSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True)

    # Frontend присылает total, но backend все равно пересчитывает его сам.
    # Это нужно, чтобы не доверять расчетам на клиенте.
    total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal('0.00'),
    )

    promoCode = serializers.CharField(max_length=50, required=False, allow_blank=True)
    bonusToSpend = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        write_only=True,
        min_value=Decimal('0.00'),
    )

    # Эти поля считаются только backend-логикой.
    status = serializers.CharField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discountAmount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    spentBonus = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
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
            'bonusToSpend',
            'subtotal',
            'discountAmount',
            'spentBonus',
            'earnedBonus',
            'total',
            'createdAt',
        )
        read_only_fields = (
            'id',
            'status',
            'subtotal',
            'discountAmount',
            'spentBonus',
            'earnedBonus',
            'createdAt',
        )

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('The basket must not be empty.')
        return value

    def validate(self, attrs):
        # Backend заново пересчитывает весь checkout и не доверяет frontend:
        # промокод, списание бонусов и итоговая сумма должны совпадать
        # с серверной логикой.
        request = self.context.get('request')
        user = request.user if request else None

        summary = calculate_checkout(
            attrs['items'],
            attrs.get('promoCode', ''),
            user=user,
            bonus_to_spend=attrs.get('bonusToSpend', Decimal('0.00')),
        )

        incoming_total = Decimal(str(attrs['total'])).quantize(Decimal('0.01'))

        if summary['total'] != incoming_total:
            raise serializers.ValidationError({
                'total': 'The final amount does not match the backend calculation.',
            })

        attrs['promoCode'] = summary['promoCode']
        attrs['subtotal'] = summary['subtotal']
        attrs['discountAmount'] = summary['discountAmount']
        attrs['spentBonus'] = summary['spentBonus']
        attrs['earnedBonus'] = summary['earnedBonus']
        attrs['total'] = summary['total']

        return attrs

    def create(self, validated_data):
        # JSONField ожидает обычный список словарей.
        validated_data['items'] = [dict(item) for item in validated_data['items']]
        validated_data.pop('bonusToSpend', None)

        user = validated_data.get('user')
        spent_bonus = Decimal(str(validated_data.get('spentBonus', 0))).quantize(Decimal('0.01'))

        # Если пользователь тратит бонусы при оформлении,
        # списываем их сразу при создании заказа.
        if user and spent_bonus > 0:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            current_balance = Decimal(profile.bonusBalance).quantize(Decimal('0.01'))

            if current_balance < spent_bonus:
                raise serializers.ValidationError({
                    'bonusToSpend': 'На балансе недостаточно бонусов.',
                })

            profile.bonusBalance = (current_balance - spent_bonus).quantize(Decimal('0.01'))
            profile.save(update_fields=['bonusBalance'])

        # Новые бонусы здесь не начисляем.
        # Они должны начисляться только после доставки заказа.
        return Order.objects.create(**validated_data)


class OrderSummarySerializer(serializers.Serializer):
    # Этот serializer оставлен, потому что его сейчас использует summary() во views.py.
    ordersCount = serializers.IntegerField()
    totalSpent = serializers.FloatField()
