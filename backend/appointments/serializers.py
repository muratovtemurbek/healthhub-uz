# appointments/serializers.py
from rest_framework import serializers
from .models import Appointment, Prescription, MedicalRecord, Allergy, ChronicCondition


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'doctor', 'date', 'time', 'status', 'status_display',
            'reason', 'symptoms', 'notes', 'is_paid', 'payment_amount',
            'doctor_name', 'patient_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_doctor_name(self, obj):
        if obj.doctor and obj.doctor.user:
            return f"Dr. {obj.doctor.user.get_full_name()}"
        return None

    def get_patient_name(self, obj):
        if obj.patient:
            return obj.patient.get_full_name() or obj.patient.email
        return None


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['doctor', 'date', 'time', 'reason', 'symptoms']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['patient'] = request.user
        return super().create(validated_data)


class PrescriptionSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = [
            'id', 'appointment', 'doctor', 'patient',
            'doctor_name', 'patient_name',
            'diagnosis', 'medications', 'instructions', 'notes',
            'is_active', 'valid_until', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'doctor', 'created_at', 'updated_at']

    def get_doctor_name(self, obj):
        if obj.doctor:
            return obj.doctor.get_full_name()
        return None

    def get_patient_name(self, obj):
        if obj.patient:
            return obj.patient.get_full_name()
        return None


class PrescriptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ['appointment', 'patient', 'diagnosis', 'medications', 'instructions', 'notes', 'valid_until']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['doctor'] = request.user
        return super().create(validated_data)


class MedicalRecordSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    record_type_display = serializers.CharField(source='get_record_type_display', read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'patient', 'doctor', 'appointment',
            'doctor_name', 'record_type', 'record_type_display',
            'title', 'description', 'vitals', 'attachments',
            'is_confidential', 'record_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_doctor_name(self, obj):
        if obj.doctor:
            return obj.doctor.get_full_name()
        return None


class MedicalRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = ['patient', 'appointment', 'record_type', 'title', 'description', 'vitals', 'record_date']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['doctor'] = request.user
        return super().create(validated_data)


class AllergySerializer(serializers.ModelSerializer):
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)

    class Meta:
        model = Allergy
        fields = [
            'id', 'patient', 'allergen', 'reaction',
            'severity', 'severity_display', 'diagnosed_date',
            'notes', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ChronicConditionSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_current_status_display', read_only=True)

    class Meta:
        model = ChronicCondition
        fields = [
            'id', 'patient', 'condition_name', 'diagnosed_date',
            'current_status', 'status_display', 'medications',
            'notes', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PatientMedicalHistorySerializer(serializers.Serializer):
    """Bemorning to'liq tibbiy tarixi"""
    prescriptions = PrescriptionSerializer(many=True)
    medical_records = MedicalRecordSerializer(many=True)
    allergies = AllergySerializer(many=True)
    chronic_conditions = ChronicConditionSerializer(many=True)
    recent_appointments = AppointmentSerializer(many=True)
    summary = serializers.DictField()