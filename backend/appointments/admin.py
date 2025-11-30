# appointments/admin.py
from django.contrib import admin
from .models import Appointment, MedicalRecord, Prescription


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'date', 'time', 'status', 'created_at']
    list_filter = ['status', 'date', 'doctor']
    search_fields = ['patient__first_name', 'patient__last_name', 'doctor__user__first_name']
    date_hierarchy = 'date'
    ordering = ['-date', '-time']


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'diagnosis', 'created_at']
    list_filter = ['created_at', 'doctor']
    search_fields = ['patient__first_name', 'patient__last_name', 'diagnosis']
    date_hierarchy = 'created_at'


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'medication_name', 'dosage', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at', 'doctor']
    search_fields = ['patient__first_name', 'medication_name']
    date_hierarchy = 'created_at'