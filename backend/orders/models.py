from django.db import models


class Order(models.Model):
    customerName = models.CharField(max_length=100)
    customerAddress = models.CharField(max_length=100)
    customerPhone = models.CharField(max_length=20)
    items = models.JSONField()
    total = models.DecimalField(max_digits=10, decimal_places=2)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Order #{self.id} - {self.customerName}'
