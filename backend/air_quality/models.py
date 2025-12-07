# air_quality/models.py
from django.db import models
from django.conf import settings
import uuid


class AirQualityRecord(models.Model):
    """Havo sifati yozuvlari (cache uchun)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='Uzbekistan')

    aqi = models.IntegerField()
    main_pollutant = models.CharField(max_length=10, default='pm25')

    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    wind_speed = models.FloatField(null=True, blank=True)

    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at']
        verbose_name = 'Havo sifati yozuvi'
        verbose_name_plural = 'Havo sifati yozuvlari'

    def __str__(self):
        return f"{self.city} - AQI: {self.aqi} ({self.recorded_at.strftime('%Y-%m-%d %H:%M')})"


class UserAirQualityAlert(models.Model):
    """Foydalanuvchi havo sifati ogohlantirishlari"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='air_quality_alerts'
    )
    city = models.CharField(max_length=100, default='Tashkent')

    # Ogohlantirish sozlamalari
    alert_threshold = models.IntegerField(default=100)  # AQI qachon ogohlantirsin
    is_enabled = models.BooleanField(default=True)

    # Kasalliklar (foydalanuvchi tanlagan)
    has_asthma = models.BooleanField(default=False)
    has_heart_disease = models.BooleanField(default=False)
    has_allergies = models.BooleanField(default=False)
    has_lung_disease = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Foydalanuvchi ogohlantirishi'
        verbose_name_plural = 'Foydalanuvchi ogohlantirishlari'

    def __str__(self):
        return f"{self.user.email} - {self.city}"