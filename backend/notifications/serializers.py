# notifications/serializers.py

from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'type_display', 'title', 'message',
            'appointment_id', 'doctor_id', 'is_read',
            'created_at', 'read_at', 'time_ago'
        ]
        read_only_fields = ['id', 'created_at']

    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        diff = now - obj.created_at

        if diff < timedelta(minutes=1):
            return "Hozirgina"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} daqiqa oldin"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} soat oldin"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days} kun oldin"
        else:
            return obj.created_at.strftime("%d.%m.%Y")