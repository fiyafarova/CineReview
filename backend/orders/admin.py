from django.contrib import admin

from .models import Order, PromoCode


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


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percent', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('code',)
