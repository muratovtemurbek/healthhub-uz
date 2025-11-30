from django.db import models
from django.conf import settings
import uuid


class Payment(models.Model):
    PAYMENT_STATUS = (
        ('pending', 'Kutilmoqda'),
        ('processing', 'Jarayonda'),
        ('completed', 'Tolangan'),
        ('cancelled', 'Bekor qilingan'),
        ('failed', 'Xatolik'),
        ('refunded', 'Qaytarilgan'),
    )

    PAYMENT_PROVIDER = (
        ('payme', 'Payme'),
        ('click', 'Click'),
    )

    PAYMENT_TYPE = (
        ('appointment', 'Qabulga yozilish'),
        ('consultation', 'Online konsultatsiya'),
        ('subscription', 'Obuna'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')

    # To'lov ma'lumotlari
    amount = models.DecimalField(max_digits=12, decimal_places=2)  # UZS
    provider = models.CharField(max_length=20, choices=PAYMENT_PROVIDER)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE, default='appointment')

    # Bog'liq model (appointment, consultation, etc.)
    appointment = models.ForeignKey('appointments.Appointment', on_delete=models.SET_NULL, null=True, blank=True)

    # Provider transaction IDs
    transaction_id = models.CharField(max_length=255, blank=True, null=True)  # Bizning ID
    provider_transaction_id = models.CharField(max_length=255, blank=True, null=True)  # Payme/Click ID

    # Qo'shimcha ma'lumotlar
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    # Vaqtlar
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Tolov'
        verbose_name_plural = 'Tolovlar'

    def __str__(self):
        return f"{self.user.email} - {self.amount} UZS - {self.status}"

    @property
    def amount_in_tiyin(self):
        """Payme uchun tiyin formatda"""
        return int(self.amount * 100)


class PaymeTransaction(models.Model):
    """Payme transaksiyalari"""
    STATES = (
        (1, 'Yaratilgan'),
        (2, 'Tasdiqlangan'),
        (-1, 'Bekor qilingan (timeout)'),
        (-2, 'Bekor qilingan (admin)'),
    )

    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='payme_transactions')
    payme_id = models.CharField(max_length=255, unique=True)  # Payme transaction ID
    state = models.IntegerField(choices=STATES, default=1)

    create_time = models.BigIntegerField()  # Payme timestamp
    perform_time = models.BigIntegerField(default=0)
    cancel_time = models.BigIntegerField(default=0)
    reason = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Payme Transaksiya'
        verbose_name_plural = 'Payme Transaksiyalar'


class ClickTransaction(models.Model):
    """Click transaksiyalari"""
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='click_transactions')
    click_trans_id = models.CharField(max_length=255)
    service_id = models.CharField(max_length=255)
    merchant_trans_id = models.CharField(max_length=255)

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    action = models.IntegerField()  # 0=prepare, 1=complete
    error = models.IntegerField(default=0)
    error_note = models.CharField(max_length=255, blank=True)
    sign_time = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Click Transaksiya'
        verbose_name_plural = 'Click Transaksiyalar'