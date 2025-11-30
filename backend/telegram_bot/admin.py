# telegram_bot/admin.py
from django.contrib import admin
from .models import TelegramVerification, TelegramNotification


@admin.register(TelegramVerification)
class TelegramVerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'telegram_username', 'is_verified', 'created_at']
    list_filter = ['is_verified']
    search_fields = ['user__email', 'telegram_username']


@admin.register(TelegramNotification)
class TelegramNotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_sent', 'sent_at', 'created_at']
    list_filter = ['is_sent']