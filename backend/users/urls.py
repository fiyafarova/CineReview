from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_view, name='auth-register'),
    path('login/',    views.login_view,    name='auth-login'),
    path('logout/',   views.logout_view,   name='auth-logout'),
    path('me/',       views.me_view,       name='auth-me'),
    path('profile/',  views.profile_view,  name='user-profile'),
    path('wishlist/', views.wishlist_view, name='wishlist-list-create'),
    path('wishlist/<int:product_id>/', views.wishlist_delete_view, name='wishlist-delete'),
]