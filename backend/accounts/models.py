# accounts/models.py
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


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