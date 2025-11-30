# ai_service/serializers.py
from rest_framework import serializers
from .models import AIConsultation

class AIConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIConsultation
        fields = [
            'id', 'user', 'symptoms', 'age', 'gender',
            'medical_history', 'ai_analysis', 'possible_conditions',
            'urgency_level', 'recommended_specialist', 'first_aid_tips',
            'warnings', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'ai_analysis', 'created_at']

class AISymptomAnalysisSerializer(serializers.Serializer):
    """AI tahlil uchun input serializer"""
    symptoms = serializers.CharField(max_length=2000)
    age = serializers.IntegerField(min_value=0, max_value=150, required=False)
    gender = serializers.ChoiceField(choices=['male', 'female'], required=False)
    medical_history = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )