# doctors/serializers.py
from rest_framework import serializers
from .models import Specialization, Hospital, Doctor, DoctorReview
from accounts.serializers import UserSerializer


class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = ['id', 'name', 'name_uz', 'description', 'icon']


class HospitalSerializer(serializers.ModelSerializer):
    doctors_count = serializers.SerializerMethodField()

    class Meta:
        model = Hospital
        fields = [
            'id', 'name', 'type', 'address', 'city',
            'latitude', 'longitude', 'phone', 'email',
            'website', 'rating', 'is_24_7', 'has_emergency',
            'image', 'doctors_count', 'created_at'
        ]

    def get_doctors_count(self, obj):
        return obj.doctors.count() if hasattr(obj, 'doctors') else 0


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialization = SpecializationSerializer(read_only=True)
    hospital = HospitalSerializer(read_only=True)
    specialization_id = serializers.UUIDField(write_only=True, required=False)
    hospital_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'specialization', 'specialization_id',
            'hospital', 'hospital_id', 'license_number',
            'experience_years', 'education', 'bio',
            'consultation_price', 'rating', 'total_reviews',
            'is_available', 'languages', 'created_at',
            'monday', 'tuesday', 'wednesday', 'thursday',
            'friday', 'saturday', 'sunday'
        ]
        read_only_fields = ['id', 'rating', 'total_reviews', 'created_at']


class DoctorDetailSerializer(serializers.ModelSerializer):
    """Shifokor tafsilotlari uchun serializer"""
    user = UserSerializer(read_only=True)
    specialization = SpecializationSerializer(read_only=True)
    hospital = HospitalSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    specialty_display = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'full_name', 'specialization', 'specialty_display',
            'hospital', 'license_number', 'experience_years', 'education',
            'bio', 'consultation_price', 'rating', 'total_reviews',
            'is_available', 'languages', 'created_at',
            'monday', 'tuesday', 'wednesday', 'thursday',
            'friday', 'saturday', 'sunday'
        ]

    def get_full_name(self, obj):
        if obj.user:
            return f"Dr. {obj.user.first_name or ''} {obj.user.last_name or ''}".strip()
        return "Dr."

    def get_specialty_display(self, obj):
        if obj.specialization:
            return obj.specialization.name_uz or obj.specialization.name
        return ''


class DoctorListSerializer(serializers.ModelSerializer):
    """Doctors ro'yxati uchun sodda serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    specialization_name = serializers.CharField(source='specialization.name_uz', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'user_name', 'specialization_name', 'hospital_name',
            'consultation_price', 'rating', 'experience_years',
            'is_available'
        ]


class DoctorReviewSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)

    class Meta:
        model = DoctorReview
        fields = [
            'id', 'doctor', 'patient', 'patient_name',
            'rating', 'comment', 'created_at'
        ]
        read_only_fields = ['id', 'patient', 'created_at']