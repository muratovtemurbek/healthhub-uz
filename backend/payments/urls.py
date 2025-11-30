# payments/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # API
    path('create/', views.create_payment, name='create-payment'),
    path('status/<uuid:payment_id>/', views.payment_status, name='payment-status'),
    path('history/', views.payment_history, name='payment-history'),

    # Payme webhook
    path('payme/webhook/', views.payme_webhook, name='payme-webhook'),

    # Click webhooks
    path('click/prepare/', views.click_prepare, name='click-prepare'),
    path('click/complete/', views.click_complete, name='click-complete'),
]