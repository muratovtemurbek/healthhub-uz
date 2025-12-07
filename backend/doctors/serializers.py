# doctors/serializers.py - TO'LIQ ISHLAYDIGAN VERSIYA
from rest_framework import serializers
from .models import Doctor, DoctorReview, Specialization, Hospital


class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = ['id', 'name', 'name_uz', 'description', 'icon']


class HospitalSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = Hospital
        fields = [
            'id', 'name', 'type', 'type_display', 'address', 'city',
            'phone', 'email', 'website', 'rating', 'is_24_7',
            'has_emergency', 'image'
        ]


class DoctorSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    specialization_name = serializers.CharField(source='specialization.name_uz', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'name', 'email', 'phone', 'avatar',
            'specialization', 'specialization_name',
            'hospital', 'hospital_name',
            'experience_years', 'consultation_price',
            'rating', 'total_reviews', 'is_available',
            'languages'
        ]

    def get_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"


class DoctorDetailSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    specialization = SpecializationSerializer(read_only=True)
    hospital = HospitalSerializer(read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    schedule = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = [
            'id', 'name', 'email', 'phone', 'avatar',
            'specialization', 'hospital',
            'experience_years', 'education', 'bio',
            'consultation_price', 'rating', 'total_reviews',
            'is_available', 'languages', 'license_number',
            'schedule'
        ]

    def get_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"

    def get_schedule(self, obj):
        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        day_names = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']

        schedule = []
        for i, day in enumerate(days):
            hours = getattr(obj, day, {})
            if hours.get('start'):
                schedule.append({
                    'day': day_names[i],
                    'start': hours.get('start'),
                    'end': hours.get('end'),
                })
        return schedule


class DoctorReviewSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = DoctorReview
        fields = ['id', 'patient_name', 'rating', 'comment', 'created_at']

    def get_patient_name(self, obj):
        return obj.patient.get_full_name()


class DoctorReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorReview
        fields = ['doctor', 'rating', 'comment']

    def create(self, validated_data):
        validated_data['patient'] = self.context['request'].user
        return super().create(validated_data)