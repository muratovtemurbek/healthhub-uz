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

    def validate(self, data):
        """Race condition dan himoya - ikki marta bir vaqtga yozilishni oldini olish"""
        from django.db import transaction

        doctor = data.get('doctor')
        date = data.get('date')
        time = data.get('time')

        # Atomic transaction ichida tekshirish
        with transaction.atomic():
            # select_for_update bilan lock qilish
            existing = Appointment.objects.select_for_update().filter(
                doctor=doctor,
                date=date,
                time=time,
                status__in=['pending', 'confirmed']
            ).exists()

            if existing:
                raise serializers.ValidationError({
                    'time': 'Bu vaqt allaqachon band qilingan. Boshqa vaqtni tanlang.'
                })

        return data

    def create(self, validated_data):
        from django.db import transaction

        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['patient'] = request.user

        # Atomic transaction bilan yaratish
        with transaction.atomic():
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

# ============== LAB TEST SERIALIZERS ==============

class LabTestSerializer(serializers.ModelSerializer):
    """Laboratoriya tahlili serializeri"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    test_type_display = serializers.CharField(source='get_test_type_display', read_only=True)
    hospital_name = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    result_file_url = serializers.SerializerMethodField()

    class Meta:
        from .models import LabTest
        model = LabTest
        fields = [
            'id', 'user_name', 'hospital', 'hospital_name',
            'test_type', 'test_type_display', 'test_name', 'description',
            'date', 'time', 'price', 'status', 'status_display',
            'results', 'result_file', 'result_file_url', 'result_summary',
            'notes', 'doctor_notes', 'is_paid', 'is_urgent',
            'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'completed_at']

    def get_hospital_name(self, obj):
        return obj.hospital.name if obj.hospital else None

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email

    def get_result_file_url(self, obj):
        if obj.result_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.result_file.url)
            return obj.result_file.url
        return None


class LabTestCreateSerializer(serializers.ModelSerializer):
    """Laboratoriya tahlili yaratish"""

    class Meta:
        from .models import LabTest
        model = LabTest
        fields = [
            'hospital', 'test_type', 'test_name', 'description',
            'date', 'time', 'price', 'notes', 'is_urgent'
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)


class LabTestResultUploadSerializer(serializers.ModelSerializer):
    """Tahlil natijasi yuklash"""

    class Meta:
        from .models import LabTest
        model = LabTest
        fields = ['results', 'result_file', 'result_summary', 'doctor_notes']


class LabTestTypeSerializer(serializers.Serializer):
    """Tahlil turlari"""
    value = serializers.CharField()
    label = serializers.CharField()
