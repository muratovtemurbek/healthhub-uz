# accounts/models.py
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('patient', 'Bemor'),
        ('doctor', 'Shifokor'),
        ('admin', 'Administrator'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)  # unique=True olib tashlandi
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='patient')

    # Patient fields
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True, default='')
    blood_type = models.CharField(max_length=5, blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    address = models.TextField(blank=True, default='')

    # Health info
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    allergies = models.JSONField(default=list, blank=True)
    chronic_diseases = models.JSONField(default=list, blank=True)

    # Emergency
    emergency_contact = models.TextField(blank=True, default='')
    insurance_number = models.CharField(max_length=50, blank=True, default='')

    # Status
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'Foydalanuvchi'
        verbose_name_plural = 'Foydalanuvchilar'

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email

class FamilyMember(models.Model):
    """Oila a'zolari"""
    RELATIONSHIP_CHOICES = [
        ('child', 'Farzand'),
        ('spouse', 'Turmush o\'rtog\'i'),
        ('parent', 'Ota-ona'),
        ('sibling', 'Aka-uka/opa-singil'),
        ('other', 'Boshqa'),
    ]
    GENDER_CHOICES = [
        ('male', 'Erkak'),
        ('female', 'Ayol'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='family_members')
    name = models.CharField(max_length=100, verbose_name='Ismi')
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES, verbose_name='Qarindoshlik')
    birth_date = models.DateField(verbose_name='Tug\'ilgan sana')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, verbose_name='Jinsi')
    blood_type = models.CharField(max_length=5, blank=True, default='', verbose_name='Qon guruhi')
    allergies = models.JSONField(default=list, blank=True, verbose_name='Allergiyalar')
    chronic_conditions = models.JSONField(default=list, blank=True, verbose_name='Surunkali kasalliklar')
    notes = models.TextField(blank=True, default='', verbose_name='Izohlar')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Oila a\'zosi'
        verbose_name_plural = 'Oila a\'zolari'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_relationship_display()})"


class EmergencyContact(models.Model):
    """Favqulodda aloqa kontaktlari"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emergency_contacts')
    name = models.CharField(max_length=100, verbose_name='Ismi')
    phone = models.CharField(max_length=20, verbose_name='Telefon')
    relationship = models.CharField(max_length=50, verbose_name='Qarindoshlik')
    is_primary = models.BooleanField(default=False, verbose_name='Asosiy kontakt')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Favqulodda kontakt'
        verbose_name_plural = 'Favqulodda kontaktlar'
        ordering = ['-is_primary', '-created_at']

    def __str__(self):
        return f"{self.name} - {self.phone}"


class EmergencySOS(models.Model):
    """Favqulodda yordam so'rovlari"""
    STATUS_CHOICES = [
        ('active', 'Faol'),
        ('responded', 'Javob berildi'),
        ('resolved', 'Hal qilindi'),
        ('cancelled', 'Bekor qilindi'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sos_requests')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    address = models.TextField(blank=True, default='', verbose_name='Manzil')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    notes = models.TextField(blank=True, default='', verbose_name='Izoh')
    notified_contacts = models.JSONField(default=list, blank=True)
    triggered_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'SOS so\'rov'
        verbose_name_plural = 'SOS so\'rovlar'
        ordering = ['-triggered_at']

    def __str__(self):
        return f"SOS - {self.user.get_full_name()} ({self.triggered_at})"
