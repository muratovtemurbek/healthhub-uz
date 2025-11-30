# doctors/models.py
from django.db import models
from accounts.models import User
import uuid


class Specialization(models.Model):
    """Shifokor mutaxassisliklari"""
    name = models.CharField(max_length=100, unique=True)
    name_uz = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # emoji yoki icon name

    class Meta:
        verbose_name = 'Mutaxassislik'
        verbose_name_plural = 'Mutaxassisliklar'

    def __str__(self):
        return self.name_uz


class Hospital(models.Model):
    """Shifoxonalar va klinikalar"""
    TYPES = [
        ('public', 'Davlat'),
        ('private', 'Xususiy'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPES)
    address = models.TextField()
    city = models.CharField(max_length=100, default='Toshkent')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    phone = models.CharField(max_length=13)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    is_24_7 = models.BooleanField(default=False)
    has_emergency = models.BooleanField(default=False)
    image = models.ImageField(upload_to='hospitals/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-rating', 'name']
        verbose_name = 'Shifoxona'
        verbose_name_plural = 'Shifoxonalar'

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Doctor(models.Model):
    """Shifokor profillari"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.ForeignKey(Specialization, on_delete=models.PROTECT)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='doctors')
    license_number = models.CharField(max_length=50, unique=True)
    experience_years = models.IntegerField(default=0)
    education = models.TextField(blank=True)
    bio = models.TextField(blank=True)
    consultation_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)
    languages = models.JSONField(default=list)  # ['uz', 'ru', 'en']

    # Working hours
    monday = models.JSONField(default=dict)  # {"start": "09:00", "end": "18:00"}
    tuesday = models.JSONField(default=dict)
    wednesday = models.JSONField(default=dict)
    thursday = models.JSONField(default=dict)
    friday = models.JSONField(default=dict)
    saturday = models.JSONField(default=dict)
    sunday = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-rating', '-experience_years']
        verbose_name = 'Shifokor'
        verbose_name_plural = 'Shifokorlar'

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.specialization.name_uz}"


class DoctorReview(models.Model):
    """Shifokor sharhlari"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='reviews')
    patient = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['doctor', 'patient']  # Bir bemor bir shifokorga bir marta sharh
        verbose_name = 'Sharh'
        verbose_name_plural = 'Sharhlar'

    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.doctor} ({self.rating}⭐)"