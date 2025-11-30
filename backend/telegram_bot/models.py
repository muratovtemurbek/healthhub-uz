# telegram_bot/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import uuid
import random


class TelegramVerification(models.Model):
    """Telegram orqali tasdiqlash"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='telegram_verification'
    )
    telegram_id = models.BigIntegerField(null=True, blank=True, unique=True)
    telegram_username = models.CharField(max_length=100, blank=True)

    # 5 xonali kod
    verification_code = models.CharField(max_length=5)
    code_created_at = models.DateTimeField(auto_now=True)
    code_expires_at = models.DateTimeField()

    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    # Urinishlar soni (brute force himoya)
    attempts = models.IntegerField(default=0)
    last_attempt_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Telegram Tasdiqlash'
        verbose_name_plural = 'Telegram Tasdiqlashlar'

    def __str__(self):
        return f"{self.user.email} - {'✅' if self.is_verified else '❌'}"

    @classmethod
    def generate_code(cls):
        """5 xonali tasodifiy kod"""
        return str(random.randint(10000, 99999))

    def is_code_valid(self):
        """Kod hali amal qiladimi?"""
        return timezone.now() < self.code_expires_at

    def get_remaining_seconds(self):
        """Qolgan soniyalar"""
        if not self.is_code_valid():
            return 0
        delta = self.code_expires_at - timezone.now()
        return max(0, int(delta.total_seconds()))

    def refresh_code(self):
        """Yangi kod generatsiya qilish"""
        self.verification_code = self.generate_code()
        self.code_created_at = timezone.now()
        self.code_expires_at = timezone.now() + timedelta(seconds=70)
        self.attempts = 0
        self.save()
        return self.verification_code


class TelegramNotification(models.Model):
    """Telegram xabarnomalar"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='telegram_notifications'
    )
    message = models.TextField()
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    error = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']