# appointments/models.py
from django.db import models
from django.conf import settings
import uuid


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Kutilmoqda'),
        ('confirmed', 'Tasdiqlangan'),
        ('completed', 'Yakunlangan'),
        ('cancelled', 'Bekor qilingan'),
        ('no_show', 'Kelmadi'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_appointments',
        null=True,
        blank=True
    )
    doctor = models.ForeignKey(
        'doctors.Doctor',
        on_delete=models.CASCADE,
        related_name='doctor_appointments'
    )
    date = models.DateField()
    time = models.TimeField()
    reason = models.TextField(blank=True, default='Konsultatsiya')
    symptoms = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # To'lov ma'lumotlari
    is_paid = models.BooleanField(default=False)
    payment_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Vaqt belgilari
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-time']

    def __str__(self):
        patient_name = self.patient.get_full_name() if self.patient else 'Noma\'lum'
        return f"{patient_name} - Dr. {self.doctor} ({self.date} {self.time})"

    @property
    def doctor_name(self):
        if self.doctor and self.doctor.user:
            return self.doctor.user.get_full_name()
        return str(self.doctor) if self.doctor else ''

    @property
    def patient_name(self):
        if self.patient:
            return self.patient.get_full_name() or self.patient.email
        return 'Noma\'lum'


class Prescription(models.Model):
    """Retseptlar"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointment_prescriptions'
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='written_prescriptions'
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_prescriptions'
    )

    diagnosis = models.TextField(verbose_name='Tashxis')
    medications = models.JSONField(default=list, verbose_name='Dorilar')
    instructions = models.TextField(blank=True, verbose_name='Ko\'rsatmalar')
    notes = models.TextField(blank=True, verbose_name='Izohlar')

    is_active = models.BooleanField(default=True)
    valid_until = models.DateField(null=True, blank=True, verbose_name='Amal qilish muddati')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Retsept'
        verbose_name_plural = 'Retseptlar'

    def __str__(self):
        return f"{self.patient} - {self.diagnosis[:50]}"


class MedicalRecord(models.Model):
    """Tibbiy yozuvlar"""
    RECORD_TYPES = [
        ('consultation', 'Konsultatsiya'),
        ('diagnosis', 'Tashxis'),
        ('lab_result', 'Laboratoriya natijasi'),
        ('imaging', 'Tasvir (rentgen, MRT)'),
        ('surgery', 'Jarrohlik'),
        ('vaccination', 'Emlash'),
        ('procedure', 'Protsedura'),
        ('follow_up', 'Kuzatuv'),
        ('other', 'Boshqa'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_medical_records'
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='doctor_medical_records'
    )
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointment_medical_records'
    )

    record_type = models.CharField(max_length=20, choices=RECORD_TYPES, default='consultation')
    title = models.CharField(max_length=255, verbose_name='Sarlavha')
    description = models.TextField(verbose_name='Tavsif')

    vitals = models.JSONField(default=dict, blank=True)
    attachments = models.JSONField(default=list, blank=True)

    is_confidential = models.BooleanField(default=False)
    record_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-record_date', '-created_at']
        verbose_name = 'Tibbiy yozuv'
        verbose_name_plural = 'Tibbiy yozuvlar'

    def __str__(self):
        return f"{self.patient} - {self.title}"


class Allergy(models.Model):
    """Allergiyalar"""
    SEVERITY_CHOICES = [
        ('mild', 'Yengil'),
        ('moderate', 'O\'rtacha'),
        ('severe', 'Og\'ir'),
        ('life_threatening', 'Hayotga xavfli'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_allergies'  # O'zgartirildi
    )

    allergen = models.CharField(max_length=255, verbose_name='Allergen')
    reaction = models.TextField(verbose_name='Reaktsiya')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='moderate')

    diagnosed_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-severity', '-created_at']
        verbose_name = 'Allergiya'
        verbose_name_plural = 'Allergiyalar'

    def __str__(self):
        return f"{self.patient} - {self.allergen}"


class ChronicCondition(models.Model):
    """Surunkali kasalliklar"""
    STATUS_CHOICES = [
        ('active', 'Faol'),
        ('managed', 'Nazorat ostida'),
        ('resolved', 'Davolangan'),
        ('remission', 'Remissiyada'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_chronic_conditions'  # O'zgartirildi
    )

    condition_name = models.CharField(max_length=255, verbose_name='Kasallik nomi')
    diagnosed_date = models.DateField(null=True, blank=True, verbose_name='Tashxis qo\'yilgan sana')
    current_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    medications = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Surunkali kasallik'
        verbose_name_plural = 'Surunkali kasalliklar'

    def __str__(self):
        return f"{self.patient} - {self.condition_name}"