# ai_service/admin.py
from django.contrib import admin
from .models import AIConsultation

@admin.register(AIConsultation)
class AIConsultationAdmin(admin.ModelAdmin):
    list_display = ['user', 'urgency_level', 'recommended_specialist', 'created_at']
    list_filter = ['urgency_level', 'created_at']
    search_fields = ['user__first_name', 'symptoms']