# doctors/admin.py
from django.contrib import admin
from .models import Specialization, Hospital, Doctor, DoctorReview

@admin.register(Specialization)
class SpecializationAdmin(admin.ModelAdmin):
    list_display = ['name_uz', 'name']
    search_fields = ['name', 'name_uz']

@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'city', 'rating', 'is_24_7']
    list_filter = ['type', 'city', 'is_24_7']
    search_fields = ['name', 'address']

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['user', 'specialization', 'hospital', 'rating', 'experience_years']
    list_filter = ['specialization', 'hospital', 'is_available']
    search_fields = ['user__first_name', 'user__last_name', 'license_number']

@admin.register(DoctorReview)
class DoctorReviewAdmin(admin.ModelAdmin):
    list_display = ['doctor', 'patient', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']