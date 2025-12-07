# air_quality/serializers.py
from rest_framework import serializers

try:
    from .models import AirQualityRecord, UserAirQualityAlert

    class AirQualityRecordSerializer(serializers.ModelSerializer):
        class Meta:
            model = AirQualityRecord
            fields = '__all__'
            read_only_fields = ['id', 'recorded_at']


    class UserAirQualityAlertSerializer(serializers.ModelSerializer):
        class Meta:
            model = UserAirQualityAlert
            fields = '__all__'
            read_only_fields = ['id', 'user', 'created_at', 'updated_at']

except ImportError:
    pass


class AirQualityResponseSerializer(serializers.Serializer):
    """API response uchun serializer"""
    aqi = serializers.IntegerField()
    level = serializers.CharField()
    level_en = serializers.CharField()
    level_color = serializers.CharField()
    recommendation = serializers.CharField()
    diseases = serializers.ListField(child=serializers.CharField())
    icon = serializers.CharField()
    main_pollutant = serializers.CharField()
    main_pollutant_name = serializers.CharField()
    city = serializers.CharField()
    country = serializers.CharField()
    is_demo = serializers.BooleanField()
    timestamp = serializers.CharField()