#st
from django.contrib import admin
from django import forms

from .models import Category, Product, ProductImage, ProductSpecification, Review


class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 1


class ProductAdminForm(forms.ModelForm):
    class Meta:
        model = Product
        exclude = ['stock']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name in ('price', 'old_price'):
            field = self.fields.get(field_name)
            if field:
                field.widget.attrs['min'] = '0'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # Здесь менеджер видит ключевые поля товара и его связанные блоки.
    form = ProductAdminForm
    list_display = ('name', 'category', 'brand', 'price', 'is_active', 'created_at')
    list_filter = ('category', 'brand', 'is_active', 'created_at')
    search_fields = ('name', 'brand', 'description')
    inlines = [ProductSpecificationInline]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at', 'product')
    search_fields = ('product__name', 'user__username', 'comment')