# ai_service/admin.py
from django.contrib import admin
from .models import SymptomCheck, Symptom, MedicalCondition, AIConsultation


@admin.register(SymptomCheck)
class SymptomCheckAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'get_symptoms', 'get_urgency', 'is_emergency', 'created_at']
    list_filter = ['is_emergency', 'severity', 'created_at']
    search_fields = ['user__email', 'symptoms']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'ai_response']

    def get_symptoms(self, obj):
        if obj.symptoms:
            return ', '.join(obj.symptoms[:3])
        return '-'

    get_symptoms.short_description = 'Alomatlar'

    def get_urgency(self, obj):
        return obj.ai_response.get('urgency_level', 'N/A')

    get_urgency.short_description = 'Urgency'


@admin.register(Symptom)
class SymptomAdmin(admin.ModelAdmin):
    list_display = ['icon', 'name_uz', 'category', 'is_emergency', 'is_active']
    list_filter = ['category', 'is_emergency', 'is_active']
    search_fields = ['name_uz', 'name_ru', 'name_en']
    ordering = ['category', 'name_uz']
    list_editable = ['is_active']


@admin.register(MedicalCondition)
class MedicalConditionAdmin(admin.ModelAdmin):
    list_display = ['name_uz', 'icd_code', 'category', 'recommended_specialization', 'urgency_level', 'is_active']
    list_filter = ['category', 'urgency_level', 'is_active']
    search_fields = ['name_uz', 'name_ru', 'name_en', 'icd_code']
    ordering = ['category', 'name_uz']


@admin.register(AIConsultation)
class AIConsultationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'get_symptoms_short', 'urgency_level', 'recommended_specialist',
                    'appointment_created', 'created_at']
    list_filter = ['urgency_level', 'appointment_created', 'created_at']
    search_fields = ['user__email', 'symptoms', 'recommended_specialist']
    ordering = ['-created_at']
    readonly_fields = ['id', 'messages', 'created_at', 'updated_at']

    def get_symptoms_short(self, obj):
        if obj.symptoms:
            return obj.symptoms[:50] + '...' if len(obj.symptoms) > 50 else obj.symptoms
        return '-'

    get_symptoms_short.short_description = 'Alomatlar'