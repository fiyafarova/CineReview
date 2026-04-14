from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    # Отдельный профиль нужен, потому что стандартную Django-модель User
    # мы не расширяем напрямую полями магазина.

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    # Здесь храним бонусный баланс пользователя.
    bonusBalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Добавляем новые поля из подсказки Claude в твою модель
    phone = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f'Profile for {self.user.username}'

class WishlistItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    # ВАЖНО: убедись, что приложение 'products' и модель 'Product' существуют
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username} → {self.product.name}"