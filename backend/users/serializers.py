from decimal import Decimal

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, WishlistItem

class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует.')
        return value

    def validate_name(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Это имя уже занято.')
        return value

    def create(self, validated_data):
        # Создаём базового пользователя.
        user = User.objects.create_user(
            username=validated_data['name'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['name'],
        )

        # Сразу создаём профиль, чтобы в дальнейшем код мог безопасно
        # читать bonusBalance без дополнительных проверок на этапе регистрации.
        UserProfile.objects.get_or_create(user=user)

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Неверный email или пароль.')

        user = authenticate(username=user.username, password=password)
        if not user:
            raise serializers.ValidationError('Неверный email или пароль.')

        if not user.is_active:
            raise serializers.ValidationError('Аккаунт отключён.')

        data['user'] = user
        return data


class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField(source='first_name')
    email = serializers.EmailField()

    # Возвращаем бонусный баланс в ответах auth/me.
    bonusBalance = serializers.SerializerMethodField()

    def get_bonusBalance(self, user):
        # Старые пользователи могли появиться раньше, чем UserProfile.
        # Поэтому не падаем, а безопасно возвращаем 0.
        profile = getattr(user, 'profile', None)
        if not profile:
            return float(Decimal('0.00'))
        return float(profile.bonusBalance)


class ProfileSerializer(serializers.ModelSerializer):
    # данные модели User
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    bonus_balance = serializers.DecimalField(
        source='bonusBalance',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'phone', 'city', 'address', 'bonus_balance']


class WishlistItemSerializer(serializers.ModelSerializer):
    # Для избранного сразу пробрасываем данные карточки товара, чтобы клиент не делал лишние запросы.
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)
    product_category = serializers.CharField(source='product.category.name', read_only=True)
    product_price = serializers.DecimalField(
        source='product.price', max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = WishlistItem
        fields = ['id', 'product_id', 'product_name', 'product_image', 'product_category', 'product_price', 'created_at']