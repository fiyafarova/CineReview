#st
from django.apps import AppConfig


class ProductsConfig(AppConfig):
    # Общая конфигурация Django-приложения products.
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'products'