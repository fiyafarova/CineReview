from django.contrib import admin
from .models import UserProfile, WishlistItem

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'city', 'bonusBalance']
    search_fields = ['user__username', 'user__email']

@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']