# ai_service/serializers.py
from rest_framework import serializers
from .models import SymptomCheck, Symptom, MedicalCondition, AIConsultation


class SymptomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Symptom
        fields = [
            'id', 'name_uz', 'name_ru', 'name_en', 'icon',
            'category', 'body_part', 'description',
            'related_conditions', 'related_specializations',
            'is_emergency'
        ]


class MedicalConditionSerializer(serializers.ModelSerializer):
    urgency_display = serializers.CharField(source='get_urgency_level_display', read_only=True)

    class Meta:
        model = MedicalCondition
        fields = [
            'id', 'name_uz', 'name_ru', 'name_en',
            'icd_code', 'category', 'description',
            'common_symptoms', 'recommended_specialization',
            'urgency_level', 'urgency_display',
            'treatment_overview', 'prevention_tips'
        ]


class SymptomCheckSerializer(serializers.ModelSerializer):
    urgency_level = serializers.SerializerMethodField()
    possible_conditions = serializers.SerializerMethodField()

    class Meta:
        model = SymptomCheck
        fields = [
            'id', 'symptoms', 'age', 'gender', 'duration',
            'severity', 'additional_info', 'ai_response',
            'urgency_level', 'possible_conditions',
            'is_emergency', 'created_at'
        ]
        read_only_fields = ['id', 'ai_response', 'is_emergency', 'created_at']

    def get_urgency_level(self, obj):
        return obj.ai_response.get('urgency_level', 'normal')

    def get_possible_conditions(self, obj):
        conditions = obj.ai_response.get('possible_conditions', [])
        return [c['name'] for c in conditions[:3]]


class SymptomCheckCreateSerializer(serializers.Serializer):
    """Symptom check uchun input"""
    symptoms = serializers.ListField(
        child=serializers.CharField(max_length=255),
        min_length=1
    )
    age = serializers.IntegerField(required=False, allow_null=True)
    gender = serializers.CharField(max_length=10, required=False, allow_blank=True)
    severity = serializers.ChoiceField(
        choices=['mild', 'moderate', 'severe'],
        default='moderate'
    )
    duration = serializers.CharField(max_length=50, required=False, allow_blank=True)
    additional_info = serializers.CharField(required=False, allow_blank=True)


class AIConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIConsultation
        fields = [
            'id', 'user', 'symptom_check', 'symptoms',
            'age', 'gender', 'medical_history',
            'ai_analysis', 'possible_conditions',
            'urgency_level', 'recommended_specialist',
            'first_aid_tips', 'home_treatment', 'warnings',
            'messages', 'final_recommendation',
            'suggested_doctor_id', 'appointment_created',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class AISymptomAnalysisSerializer(serializers.Serializer):
    """AI tahlil uchun input (text)"""
    symptoms = serializers.CharField(max_length=2000)
    age = serializers.IntegerField(min_value=0, max_value=150, required=False)
    gender = serializers.ChoiceField(choices=['male', 'female'], required=False)
    medical_history = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )


class SymptomCheckHistorySerializer(serializers.ModelSerializer):
    """Qisqacha tarix"""
    possible_conditions = serializers.SerializerMethodField()
    urgency_level = serializers.SerializerMethodField()

    class Meta:
        model = SymptomCheck
        fields = ['id', 'symptoms', 'possible_conditions', 'urgency_level', 'created_at']

    def get_possible_conditions(self, obj):
        conditions = obj.ai_response.get('possible_conditions', [])
        return [c['name'] for c in conditions[:2]]

    def get_urgency_level(self, obj):
        return obj.ai_response.get('urgency_level', 'normal')