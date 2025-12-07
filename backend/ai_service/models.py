# ai_service/models.py
from django.db import models
from django.conf import settings
import uuid


class SymptomCheck(models.Model):
    """Alomatlar tekshiruvi"""
    SEVERITY_CHOICES = [
        ('mild', 'Yengil'),
        ('moderate', "O'rtacha"),
        ('severe', "Og'ir"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='symptom_checks',
        null=True,
        blank=True
    )

    # Foydalanuvchi kiritgan ma'lumotlar
    symptoms = models.JSONField(default=list, verbose_name='Alomatlar')
    age = models.PositiveIntegerField(null=True, blank=True, verbose_name='Yosh')
    gender = models.CharField(max_length=10, blank=True, verbose_name='Jins')
    duration = models.CharField(max_length=50, blank=True, verbose_name='Davomiyligi')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='moderate', verbose_name='Darajasi')
    additional_info = models.TextField(blank=True, verbose_name='Qo\'shimcha ma\'lumot')

    # AI natijasi
    ai_response = models.JSONField(default=dict, verbose_name='AI javobi')

    # Metadata
    is_emergency = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Alomatlar tekshiruvi'
        verbose_name_plural = 'Alomatlar tekshiruvlari'

    def __str__(self):
        symptoms_str = ', '.join(self.symptoms[:3]) if self.symptoms else 'No symptoms'
        return f"{symptoms_str} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class Symptom(models.Model):
    """Alomatlar bazasi"""
    CATEGORY_CHOICES = [
        ('bosh', 'Bosh'),
        ('kokrak', "Ko'krak"),
        ('qorin', 'Qorin'),
        ('oyoq_qol', "Oyoq-Qo'l"),
        ('teri', 'Teri'),
        ('umumiy', 'Umumiy'),
        ('ruhiy', 'Ruhiy'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name_uz = models.CharField(max_length=255, verbose_name='Nomi (O\'zbekcha)')
    name_ru = models.CharField(max_length=255, blank=True, verbose_name='Nomi (Ruscha)')
    name_en = models.CharField(max_length=255, blank=True, verbose_name='Nomi (Inglizcha)')

    icon = models.CharField(max_length=10, default='🩺', verbose_name='Emoji')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name='Kategoriya')
    body_part = models.CharField(max_length=100, blank=True, verbose_name='Tana qismi')
    description = models.TextField(blank=True, verbose_name='Tavsif')

    related_conditions = models.JSONField(default=list, verbose_name='Bog\'liq kasalliklar')
    related_specializations = models.JSONField(default=list, verbose_name='Bog\'liq mutaxassisliklar')

    is_emergency = models.BooleanField(default=False, verbose_name='Shoshilinch')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'name_uz']
        verbose_name = 'Alomat'
        verbose_name_plural = 'Alomatlar'

    def __str__(self):
        return f"{self.icon} {self.name_uz}"


class MedicalCondition(models.Model):
    """Kasalliklar bazasi"""
    URGENCY_CHOICES = [
        ('low', 'Past'),
        ('normal', 'Normal'),
        ('high', 'Yuqori'),
        ('emergency', 'Shoshilinch'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name_uz = models.CharField(max_length=255, verbose_name='Nomi (O\'zbekcha)')
    name_ru = models.CharField(max_length=255, blank=True)
    name_en = models.CharField(max_length=255, blank=True)

    icd_code = models.CharField(max_length=20, blank=True, verbose_name='ICD-10 kodi')
    category = models.CharField(max_length=100, verbose_name='Kategoriya')

    description = models.TextField(blank=True, verbose_name='Tavsif')
    common_symptoms = models.JSONField(default=list, verbose_name='Umumiy alomatlar')

    recommended_specialization = models.CharField(max_length=100, verbose_name='Tavsiya etilgan mutaxassis')
    urgency_level = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='normal')

    treatment_overview = models.TextField(blank=True, verbose_name='Davolash haqida')
    prevention_tips = models.JSONField(default=list, verbose_name='Oldini olish maslahatlari')

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'name_uz']
        verbose_name = 'Kasallik'
        verbose_name_plural = 'Kasalliklar'

    def __str__(self):
        return self.name_uz


class AIConsultation(models.Model):
    """AI bilan konsultatsiya tarixi"""
    URGENCY_CHOICES = [
        ('past', 'Past'),
        ('o\'rta', "O'rtacha"),
        ('yuqori', 'Yuqori'),
        ('jiddiy', 'Jiddiy'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_consultations',
        null=True,
        blank=True
    )
    symptom_check = models.ForeignKey(
        SymptomCheck,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='consultations'
    )

    # Kirish ma'lumotlari
    symptoms = models.TextField(verbose_name='Alomatlar')
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    medical_history = models.JSONField(default=list, blank=True)

    # AI tahlil natijasi
    ai_analysis = models.TextField(blank=True, verbose_name='AI tahlili')
    possible_conditions = models.JSONField(default=list, verbose_name='Ehtimoliy kasalliklar')
    urgency_level = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='o\'rta')
    recommended_specialist = models.CharField(max_length=100, blank=True)

    first_aid_tips = models.JSONField(default=list, verbose_name='Birinchi yordam')
    home_treatment = models.JSONField(default=list, verbose_name='Uy sharoitida davolash')
    warnings = models.JSONField(default=list, verbose_name='Ogohlantirishlar')

    # Chat tarixi (agar chat rejimi bo'lsa)
    messages = models.JSONField(default=list)

    # Yakuniy natija
    final_recommendation = models.TextField(blank=True)
    suggested_doctor_id = models.UUIDField(null=True, blank=True)
    appointment_created = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Konsultatsiya'
        verbose_name_plural = 'AI Konsultatsiyalar'

    def __str__(self):
        return f"Consultation - {self.symptoms[:50]}... ({self.created_at.strftime('%Y-%m-%d')})"