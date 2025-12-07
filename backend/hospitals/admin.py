# hospitals/admin.py
from django.contrib import admin
from .models import Hospital, HospitalReview


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ['name', 'hospital_type', 'city', 'rating', 'is_24_hours', 'is_active']
    list_filter = ['hospital_type', 'city', 'is_24_hours', 'is_active', 'is_verified']
    search_fields = ['name', 'address', 'phone']
    ordering = ['-rating', 'name']


@admin.register(HospitalReview)
class HospitalReviewAdmin(admin.ModelAdmin):
    list_display = ['hospital', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['hospital__name', 'user__phone', 'comment']