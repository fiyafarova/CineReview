from django.db.models import Avg, Count, F, Q, Value
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Category, Product, Review
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ReviewCreateSerializer,
    ReviewSerializer,
)


class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 48


class CategoryListView(generics.ListAPIView):
    # Публичный список категорий для фильтра на клиенте.
    authentication_classes = []
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductListView(generics.ListAPIView):
    # Каталог товаров поддерживает поиск, фильтры и сортировку через параметры запроса.
    authentication_classes = []
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    pagination_class = ProductPagination

    def get_queryset(self):
        # Сразу аннотируем рейтинг и число отзывов, чтобы не считать это на клиенте.
        queryset = Product.objects.filter(is_active=True).select_related('category')
        queryset = queryset.annotate(
            average_rating=Coalesce(Avg('reviews__rating'), Value(0.0)),
            review_count=Count('reviews', distinct=True),
        )

        search = self.request.query_params.get('search', '').strip()
        category = self.request.query_params.get('category', '').strip()
        min_price = self.request.query_params.get('min_price', '').strip()
        max_price = self.request.query_params.get('max_price', '').strip()
        on_sale = self.request.query_params.get('on_sale', '').strip().lower()
        ordering = self.request.query_params.get('ordering', '').strip()

        if search:
            # Поиск идёт по названию, описанию и бренду.
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(brand__icontains=search)
            )

        if category:
            queryset = queryset.filter(category_id=category)

        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        if on_sale == 'true':
            queryset = queryset.filter(old_price__isnull=False, old_price__gt=F('price'))

        # Карта сортировок нужна, чтобы клиент передавал короткий ключ вместо имени поля.
        ordering_map = {
            'price': 'price',
            '-price': '-price',
            'name': 'name',
            '-name': '-name',
            'rating': '-average_rating',
            '-rating': 'average_rating',
            'newest': '-created_at',
            'oldest': 'created_at',
        }
        queryset = queryset.order_by(ordering_map.get(ordering, '-created_at'))
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    # Публичная страница одного товара.
    authentication_classes = []
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Предзагрузка нужна, чтобы галерея, характеристики и отзывы не запрашивались по отдельности.
        queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related(
            'gallery', 'specifications', 'reviews__user'
        )
        queryset = queryset.annotate(
            average_rating=Coalesce(Avg('reviews__rating'), Value(0.0)),
            review_count=Count('reviews', distinct=True),
        )
        return queryset


class ProductReviewCreateView(generics.CreateAPIView):
    # Добавление отзывов доступно только авторизованным пользователям.
    serializer_class = ReviewCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        # В сериализатор передаём текущий товар для проверки уникальности отзыва.
        context = super().get_serializer_context()
        context['product'] = get_object_or_404(Product, pk=self.kwargs['pk'], is_active=True)
        return context

    def create(self, request, *args, **kwargs):
        # После сохранения сразу возвращаем отзыв в формате для клиентского списка.
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        response_serializer = ReviewSerializer(review)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=201, headers=headers)