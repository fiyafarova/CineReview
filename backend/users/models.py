from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    # Отдельный профиль нужен, потому что стандартную Django-модель User
    # мы не расширяем напрямую полями магазина.
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    # Здесь храним бонусный баланс пользователя.
    bonusBalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f'Profile for {self.user.username}'
