# air_quality/admin.py
from django.contrib import admin

try:
    from .models import AirQualityRecord, UserAirQualityAlert

    @admin.register(AirQualityRecord)
    class AirQualityRecordAdmin(admin.ModelAdmin):
        list_display = ['city', 'aqi', 'main_pollutant', 'temperature', 'recorded_at']
        list_filter = ['city', 'recorded_at']
        search_fields = ['city']
        ordering = ['-recorded_at']
        readonly_fields = ['id', 'recorded_at']


    @admin.register(UserAirQualityAlert)
    class UserAirQualityAlertAdmin(admin.ModelAdmin):
        list_display = ['user', 'city', 'alert_threshold', 'is_enabled', 'has_asthma', 'created_at']
        list_filter = ['is_enabled', 'has_asthma', 'has_heart_disease', 'city']
        search_fields = ['user__email', 'city']
        readonly_fields = ['id', 'created_at', 'updated_at']

except ImportError:
    pass