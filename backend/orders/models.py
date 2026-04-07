from django.db import models
from django.contrib.auth.models import User


class Order(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders',
        null=True,
        blank=True
    )

    customerName    = models.CharField(max_length=255)
    customerAddress = models.CharField(max_length=500)
    customerPhone   = models.CharField(max_length=50)
    items           = models.JSONField()
    total           = models.DecimalField(max_digits=10, decimal_places=2)
    createdAt       = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Заказ #{self.id} — {self.customerName}"

    class Meta:
        ordering = ['-createdAt']