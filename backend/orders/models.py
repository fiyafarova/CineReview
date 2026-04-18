from django.contrib.auth.models import User
from django.db import models


class OrderStatus(models.TextChoices):
    # Используем именно те строки, которые указаны в ТЗ.
    NEW = 'new', 'NEW'
    PAID = 'paid', 'PAID'
    SHIPPED = 'shipped', 'SHIPPED'
    DELIVERED = 'delivered', 'DELIVERED'
    CANCELLED = 'cancelled', 'CANCELLED'


class PromoCode(models.Model):
    code = models.CharField(max_length=50, unique=True)

    # Храним размер скидки в процентах.
    # Например, 10 означает скидку 10%.
    discount_percent = models.PositiveSmallIntegerField(default=10)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.code


class Order(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders',
        null=True,
        blank=True,
    )

    customerName = models.CharField(max_length=255)
    customerAddress = models.CharField(max_length=500)
    customerPhone = models.CharField(max_length=50)

    # Состав заказа сохраняем как JSON-снимок корзины на момент оформления.
    items = models.JSONField()

    # Текущий статус заказа.
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.NEW,
    )

    # Сохраняем промокод строкой, чтобы история заказа оставалась неизменной,
    # даже если PromoCode позже отключат или удалят.
    promoCode = models.CharField(max_length=50, blank=True, default='')

    # subtotal = сумма товаров без скидки
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # discountAmount = сколько денег списали скидкой
    discountAmount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # earnedBonus = сколько бонусов начислили за этот заказ
    earnedBonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    spentBonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # Флаг нужен, чтобы понимать: бонус уже добавлен пользователю или нет.
    # Это помогает корректно откатывать его при отмене заказа.
    bonusAwarded = models.BooleanField(default=False)

    # Финальная сумма к оплате после скидок.
    total = models.DecimalField(max_digits=10, decimal_places=2)

    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Order #{self.id} - {self.customerName}'

    class Meta:
        ordering = ['-createdAt']
