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
        """BMI hisoblash - validation bilan"""
        # Height va weight validatsiyasi
        if not obj.height or not obj.weight:
            return None
        if obj.height < 50 or obj.height > 250:  # 50-250 sm oralig'ida
            return None
        if obj.weight < 20 or obj.weight > 300:  # 20-300 kg oralig'ida
            return None

        height_m = obj.height / 100  # sm dan m ga
        bmi = obj.weight / (height_m ** 2)
        return round(bmi, 1)

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
    email = serializers.CharField(required=False, allow_blank=True, default='')  # CharField ishlatamiz
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
    emergency_contact = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'blood_type', 'height', 'weight', 'bmi', 'bmi_status',
            'allergies', 'chronic_diseases', 'emergency_contact',
            'insurance_number', 'birth_date', 'age', 'gender'
        ]

    def get_bmi(self, obj):
        """BMI hisoblash - validation bilan"""
        if not obj.height or not obj.weight:
            return None
        if obj.height < 50 or obj.height > 250:
            return None
        if obj.weight < 20 or obj.weight > 300:
            return None

        height_m = obj.height / 100
        bmi = obj.weight / (height_m ** 2)
        return round(bmi, 1)

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

    def get_emergency_contact(self, obj):
        """emergency_contact ni JSON sifatida qaytarish"""
        import json
        if obj.emergency_contact:
            try:
                return json.loads(obj.emergency_contact)
            except (json.JSONDecodeError, TypeError):
                return {'name': obj.emergency_contact, 'phone': '', 'relation': ''}
        return {'name': '', 'phone': '', 'relation': ''}


class MedicalCardUpdateSerializer(serializers.ModelSerializer):
    """Tibbiy kartani yangilash"""
    emergency_contact = serializers.JSONField(required=False)

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

    def validate_emergency_contact(self, value):
        """emergency_contact ni JSON string ga convert qilish"""
        import json
        if isinstance(value, dict):
            return json.dumps(value)
        return value or ''


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


class MedicalDocumentSerializer(serializers.ModelSerializer):
    """Tibbiy hujjatlar serializeri"""
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size_display = serializers.SerializerMethodField()

    class Meta:
        from medicines.models import MedicalDocument
        model = MedicalDocument
        fields = [
            'id', 'title', 'document_type', 'document_type_display',
            'file', 'file_url', 'file_type', 'file_size', 'file_size_display',
            'description', 'doctor_name', 'hospital_name',
            'document_date', 'is_important', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'file_size', 'file_type']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_file_size_display(self, obj):
        """Fayl hajmini o'qiladigan formatda"""
        size = obj.file_size or 0
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size // 1024} KB"
        else:
            return f"{size // (1024 * 1024)} MB"


class MedicalDocumentCreateSerializer(serializers.ModelSerializer):
    """Tibbiy hujjat yaratish serializeri"""

    class Meta:
        from medicines.models import MedicalDocument
        model = MedicalDocument
        fields = [
            'title', 'document_type', 'file', 'description',
            'doctor_name', 'hospital_name', 'document_date', 'is_important'
        ]

    def validate_file(self, value):
        """Fayl validatsiyasi"""
        # Fayl hajmi 10 MB dan oshmasligi kerak
        max_size = 10 * 1024 * 1024  # 10 MB
        if value.size > max_size:
            raise serializers.ValidationError("Fayl hajmi 10 MB dan oshmasligi kerak")

        # Ruxsat etilgan formatlar
        allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
        ext = '.' + value.name.split('.')[-1].lower() if '.' in value.name else ''
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Faqat quyidagi formatlar ruxsat etilgan: {', '.join(allowed_extensions)}"
            )

        return value

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)

# ============== FAMILY MEMBER SERIALIZERS ==============

class FamilyMemberSerializer(serializers.ModelSerializer):
    """Oila a'zolari serializeri"""
    relationship_display = serializers.CharField(source='get_relationship_display', read_only=True)
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    age = serializers.SerializerMethodField()

    class Meta:
        from .models import FamilyMember
        model = FamilyMember
        fields = [
            'id', 'name', 'relationship', 'relationship_display',
            'birth_date', 'age', 'gender', 'gender_display',
            'blood_type', 'allergies', 'chronic_conditions',
            'notes', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_age(self, obj):
        if obj.birth_date:
            from datetime import date
            today = date.today()
            age = today.year - obj.birth_date.year - (
                (today.month, today.day) < (obj.birth_date.month, obj.birth_date.day)
            )
            return age
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)


# ============== EMERGENCY CONTACT SERIALIZERS ==============

class EmergencyContactSerializer(serializers.ModelSerializer):
    """Favqulodda kontakt serializeri"""

    class Meta:
        from .models import EmergencyContact
        model = EmergencyContact
        fields = ['id', 'name', 'phone', 'relationship', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)


# ============== EMERGENCY SOS SERIALIZERS ==============

class EmergencySOSSerializer(serializers.ModelSerializer):
    """SOS serializeri"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        from .models import EmergencySOS
        model = EmergencySOS
        fields = [
            'id', 'user_name', 'latitude', 'longitude', 'address',
            'status', 'status_display', 'notes', 'notified_contacts',
            'triggered_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'triggered_at', 'resolved_at', 'notified_contacts']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email


class EmergencySOSTriggerSerializer(serializers.ModelSerializer):
    """SOS trigger serializeri"""

    class Meta:
        from .models import EmergencySOS
        model = EmergencySOS
        fields = ['latitude', 'longitude', 'address', 'notes']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)
