# payments/admin.py
from django.contrib import admin
from .models import Payment, PaymeTransaction, ClickTransaction

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'provider', 'status', 'created_at', 'paid_at']
    list_filter = ['status', 'provider', 'payment_type']
    search_fields = ['user__email', 'transaction_id']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(PaymeTransaction)
class PaymeTransactionAdmin(admin.ModelAdmin):
    list_display = ['payme_id', 'payment', 'state', 'created_at']
    list_filter = ['state']

@admin.register(ClickTransaction)
class ClickTransactionAdmin(admin.ModelAdmin):
    list_display = ['click_trans_id', 'payment', 'amount', 'action', 'created_at']