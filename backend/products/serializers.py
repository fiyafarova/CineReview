#st
from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from .models import Category, Product, ProductImage, ProductSpecification, Review


class CategorySerializer(serializers.ModelSerializer):
    # Возвращает минимальные данные категории для выпадающего фильтра на клиенте.
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ProductImageSerializer(serializers.ModelSerializer):
    # Отдаёт галерею товара без лишней логики.
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'sort_order']


class ProductSpecificationSerializer(serializers.ModelSerializer):
    # Отдельный сериализатор для строки характеристики.
    class Meta:
        model = ProductSpecification
        fields = ['id', 'name', 'value', 'sort_order']


class ReviewSerializer(serializers.ModelSerializer):
    # Готовит отзыв в формате, который удобно сразу выводить на странице товара.
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    # Используется только для создания нового review от авторизованного пользователя.
    class Meta:
        model = Review
        fields = ['rating', 'comment']

    def validate(self, attrs):
        # Запрещаем одному пользователю оставлять несколько отзывов на один товар.
        request = self.context['request']
        product = self.context['product']
        if Review.objects.filter(user=request.user, product=product).exists():
            raise serializers.ValidationError('You have already left a review for this product.')
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        product = self.context['product']
        return Review.objects.create(user=request.user, product=product, **validated_data)


class ProductListSerializer(serializers.ModelSerializer):
    # Короткая версия товара для карточек каталога.
    category = CategorySerializer(read_only=True)
    inStock = serializers.SerializerMethodField()
    oldPrice = serializers.DecimalField(source='old_price', max_digits=10, decimal_places=2, read_only=True)
    reviewCount = serializers.IntegerField(source='review_count', read_only=True)
    rating = serializers.FloatField(source='average_rating', read_only=True)
    isOnSale = serializers.SerializerMethodField()
    isNew = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'brand',
            'price',
            'oldPrice',
            'image',
            'category',
            'inStock',
            'stock',
            'rating',
            'reviewCount',
            'isOnSale',
            'isNew',
        ]

    def get_inStock(self, obj):
        # Раз товар активен и доступен в каталоге, клиент может считать его доступным к покупке.
        return obj.is_active

    def get_isOnSale(self, obj):
        # Скидка считается только если old_price реально выше текущей цены.
        return obj.old_price is not None and obj.old_price > obj.price

    def get_isNew(self, obj):
        # Новинки считаются по дате создания, чтобы badge появлялся автоматически.
        return obj.created_at >= timezone.now() - timedelta(days=21)


class ProductDetailSerializer(ProductListSerializer):
    # Полная версия товара для страницы товара: галерея, характеристики и отзывы.
    gallery = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ['gallery', 'specifications', 'reviews']