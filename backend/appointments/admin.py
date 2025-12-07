# appointments/admin.py
from django.contrib import admin
from .models import Appointment, Prescription, MedicalRecord, Allergy, ChronicCondition


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'date', 'time', 'status', 'is_paid', 'created_at']
    list_filter = ['status', 'is_paid', 'date', 'created_at']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__email', 'doctor__user__first_name']
    ordering = ['-date', '-time']
    date_hierarchy = 'date'


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'diagnosis', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['patient__first_name', 'patient__last_name', 'diagnosis']
    ordering = ['-created_at']

    def get_medications_count(self, obj):
        return len(obj.medications) if obj.medications else 0

    get_medications_count.short_description = 'Dorilar soni'


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'record_type', 'title', 'record_date', 'is_confidential', 'created_at']
    list_filter = ['record_type', 'is_confidential', 'record_date', 'created_at']
    search_fields = ['patient__first_name', 'patient__last_name', 'title', 'description']
    ordering = ['-record_date', '-created_at']
    date_hierarchy = 'record_date'


@admin.register(Allergy)
class AllergyAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'allergen', 'severity', 'is_active', 'created_at']
    list_filter = ['severity', 'is_active', 'created_at']
    search_fields = ['patient__first_name', 'patient__last_name', 'allergen', 'reaction']
    ordering = ['-created_at']


@admin.register(ChronicCondition)
class ChronicConditionAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'condition_name', 'current_status', 'is_active', 'diagnosed_date']
    list_filter = ['current_status', 'is_active', 'created_at']
    search_fields = ['patient__first_name', 'patient__last_name', 'condition_name']
    ordering = ['-created_at']