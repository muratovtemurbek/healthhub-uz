# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    bmi = serializers.SerializerMethodField()
    bmi_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'user_type',
            'first_name', 'last_name', 'full_name', 'birth_date',
            'gender', 'blood_type', 'avatar', 'address',
            'height', 'weight', 'bmi', 'bmi_status',
            'allergies', 'chronic_diseases',
            'emergency_contact', 'insurance_number', 'is_verified', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'is_verified']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email

    def get_bmi(self, obj):
        """BMI hisoblash"""
        if obj.height and obj.weight and obj.height > 0:
            height_m = obj.height / 100  # sm dan m ga
            bmi = obj.weight / (height_m ** 2)
            return round(bmi, 1)
        return None

    def get_bmi_status(self, obj):
        """BMI holati"""
        bmi = self.get_bmi(obj)
        if bmi is None:
            return None
        if bmi < 18.5:
            return {'status': 'underweight', 'label': 'Kam vazn', 'color': 'yellow'}
        elif bmi < 25:
            return {'status': 'normal', 'label': 'Normal', 'color': 'green'}
        elif bmi < 30:
            return {'status': 'overweight', 'label': 'Ortiqcha vazn', 'color': 'orange'}
        else:
            return {'status': 'obese', 'label': 'Semizlik', 'color': 'red'}


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'phone', 'password', 'password_confirm',
            'first_name', 'last_name', 'user_type'
        ]
        extra_kwargs = {
            'username': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True, 'allow_null': True},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'user_type': {'required': False},
        }

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Parollar mos kelmadi'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')

        # Set defaults
        validated_data.setdefault('user_type', 'patient')

        # Agar username berilmagan bo'lsa, email'dan yaratish
        if not validated_data.get('username'):
            email = validated_data.get('email', '')
            base_username = email.split('@')[0] if email else 'user'
            # Unique username yaratish
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            validated_data['username'] = username

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    """Login - email YOKI username bilan"""
    username = serializers.CharField(required=False, allow_blank=True, default='')
    email = serializers.EmailField(required=False, allow_blank=True, default='')
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')

        # Kamida bittasi bo'lishi kerak
        if not username and not email:
            raise serializers.ValidationError({
                'error': 'Username yoki email kiritilishi kerak'
            })

        if not password:
            raise serializers.ValidationError({
                'error': 'Parol kiritilishi kerak'
            })

        # Foydalanuvchini topish
        user = None

        if email:
            # Email orqali qidirish
            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'error': 'Bunday email topilmadi'
                })
        elif username:
            # Username orqali qidirish
            try:
                user = User.objects.get(username__iexact=username)
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'error': 'Bunday foydalanuvchi topilmadi'
                })

        if not user:
            raise serializers.ValidationError({
                'error': 'Foydalanuvchi topilmadi'
            })

        # Parolni tekshirish
        if not user.check_password(password):
            raise serializers.ValidationError({
                'error': 'Parol noto\'g\'ri'
            })

        # Faolligini tekshirish
        if not user.is_active:
            raise serializers.ValidationError({
                'error': 'Hisob faol emas'
            })

        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Profil ma'lumotlarini yangilash"""

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'birth_date',
            'gender', 'address', 'avatar'
        ]
        extra_kwargs = {
            'phone': {'required': False, 'allow_blank': True, 'allow_null': True},
        }


class MedicalCardSerializer(serializers.ModelSerializer):
    """Tibbiy karta ma'lumotlari"""
    bmi = serializers.SerializerMethodField()
    bmi_status = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'blood_type', 'height', 'weight', 'bmi', 'bmi_status',
            'allergies', 'chronic_diseases', 'emergency_contact',
            'insurance_number', 'birth_date', 'age', 'gender'
        ]

    def get_bmi(self, obj):
        if obj.height and obj.weight and obj.height > 0:
            height_m = obj.height / 100
            bmi = obj.weight / (height_m ** 2)
            return round(bmi, 1)
        return None

    def get_bmi_status(self, obj):
        bmi = self.get_bmi(obj)
        if bmi is None:
            return None
        if bmi < 18.5:
            return {'status': 'underweight', 'label': 'Kam vazn', 'color': 'yellow'}
        elif bmi < 25:
            return {'status': 'normal', 'label': 'Normal', 'color': 'green'}
        elif bmi < 30:
            return {'status': 'overweight', 'label': 'Ortiqcha vazn', 'color': 'orange'}
        else:
            return {'status': 'obese', 'label': 'Semizlik', 'color': 'red'}

    def get_age(self, obj):
        if obj.birth_date:
            from datetime import date
            today = date.today()
            age = today.year - obj.birth_date.year - (
                    (today.month, today.day) < (obj.birth_date.month, obj.birth_date.day)
            )
            return age
        return None


class MedicalCardUpdateSerializer(serializers.ModelSerializer):
    """Tibbiy kartani yangilash"""

    class Meta:
        model = User
        fields = [
            'blood_type', 'height', 'weight',
            'allergies', 'chronic_diseases',
            'emergency_contact', 'insurance_number'
        ]

    def validate_height(self, value):
        if value and (value < 50 or value > 250):
            raise serializers.ValidationError("Bo'y 50-250 sm oralig'ida bo'lishi kerak")
        return value

    def validate_weight(self, value):
        if value and (value < 20 or value > 300):
            raise serializers.ValidationError("Vazn 20-300 kg oralig'ida bo'lishi kerak")
        return value

    def validate_blood_type(self, value):
        valid_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
        if value and value not in valid_types:
            raise serializers.ValidationError("Noto'g'ri qon guruhi")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Parol o'zgartirish"""
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=6)
    new_password_confirm = serializers.CharField(required=True, write_only=True, min_length=6)

    def validate_current_password(self, value):
        user = self.context.get('request').user
        if not user.check_password(value):
            raise serializers.ValidationError("Joriy parol noto'g'ri")
        return value

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Yangi parollar mos kelmadi'
            })

        # Yangi parol eskisi bilan bir xil bo'lmasligi kerak
        if data['current_password'] == data['new_password']:
            raise serializers.ValidationError({
                'new_password': 'Yangi parol eskisidan farq qilishi kerak'
            })

        return data

    def save(self):
        user = self.context.get('request').user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user