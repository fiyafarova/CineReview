#st
from django.urls import path

from .views import CategoryListView, ProductDetailView, ProductListView, ProductReviewCreateView


# Маршруты товаров вынесены отдельно, чтобы корневой файл маршрутов оставался чистым.
urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('<int:pk>/reviews/', ProductReviewCreateView.as_view(), name='product-review-create'),
]