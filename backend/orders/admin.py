from django.contrib import admin
from decimal import Decimal
from users.models import UserProfile
from .models import Order, PromoCode, OrderStatus


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # Это поможет менеджеру или разработчику быстро менять статусы заказа
    # через Django Admin без ручной правки в базе.
    list_display = (
        'id',
        'user',
        'customerName',
        'status',
        'promoCode',
        'subtotal',
        'discountAmount',
        'earnedBonus',
        'total',
        'createdAt',
    )
    list_filter = ('status', 'createdAt')
    search_fields = ('id', 'customerName', 'customerPhone', 'promoCode', 'user__username')

    def save_model(self, request, obj, form, change):
        # Логика начисления бонусов перенесена в admin-обновление статуса заказа:
        # бонусы начисляются не в момент создания заказа, а только когда
        # менеджер переводит заказ в статус delivered.
        previous_status = None
        previous_bonus_awarded = False

        if change:
            previous = Order.objects.get(pk=obj.pk)
            previous_status = previous.status
            previous_bonus_awarded = previous.bonusAwarded

        super().save_model(request, obj, form, change)

        if not obj.user or obj.earnedBonus <= 0:
            return

        profile, _ = UserProfile.objects.get_or_create(user=obj.user)
        # Начисляем бонусы только один раз при первом переходе заказа в delivered.
        if obj.status == OrderStatus.DELIVERED and not previous_bonus_awarded and not obj.bonusAwarded:
            profile.bonusBalance = (
                profile.bonusBalance + obj.earnedBonus
            ).quantize(Decimal('0.01'))
            profile.save(update_fields=['bonusBalance'])

            obj.bonusAwarded = True
            obj.save(update_fields=['bonusAwarded'])
            return
        # Если заказ раньше был delivered, а потом статус изменили назад,
        # нужно откатить начисленные бонусы, чтобы баланс оставался корректным.
        if previous_status == OrderStatus.DELIVERED and obj.status != OrderStatus.DELIVERED and obj.bonusAwarded:
            profile.bonusBalance = max(
                Decimal('0.00'),
                (profile.bonusBalance - obj.earnedBonus).quantize(Decimal('0.01')),
            )
            profile.save(update_fields=['bonusBalance'])

            obj.bonusAwarded = False
            obj.save(update_fields=['bonusAwarded'])

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percent', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('code',)
