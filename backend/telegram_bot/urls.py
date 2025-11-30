# telegram_bot/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.generate_code, name='telegram-generate'),
    path('resend/', views.resend_code, name='telegram-resend'),
    path('check/', views.check_verification, name='telegram-check'),
    path('verify/', views.verify_code, name='telegram-verify'),
    path('webhook/', views.telegram_webhook, name='telegram-webhook'),
    path('send/', views.send_notification, name='telegram-send'),
]