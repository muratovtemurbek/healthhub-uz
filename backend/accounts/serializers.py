# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'user_type',
            'first_name', 'last_name', 'full_name', 'birth_date',
            'gender', 'blood_type', 'avatar', 'address',
            'height', 'weight', 'allergies', 'chronic_diseases',
            'emergency_contact', 'insurance_number', 'is_verified', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'is_verified']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


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
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'birth_date',
            'gender', 'blood_type', 'address', 'height', 'weight',
            'allergies', 'chronic_diseases', 'emergency_contact',
            'insurance_number', 'avatar'
        ]
        extra_kwargs = {
            'phone': {'required': False, 'allow_blank': True, 'allow_null': True},
        }