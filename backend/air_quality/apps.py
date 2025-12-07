# air_quality/apps.py
from django.apps import AppConfig


class AirQualityConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'air_quality'
    verbose_name = 'Havo sifati'