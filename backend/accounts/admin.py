# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'phone', 'user_type', 'is_verified', 'created_at']
    list_filter = ['user_type', 'is_verified', 'created_at']
    search_fields = ['username', 'phone', 'first_name', 'last_name']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Qo\'shimcha ma\'lumotlar', {
            'fields': ('user_type', 'phone', 'birth_date', 'gender', 'blood_type', 
                      'avatar', 'address', 'is_verified')
        }),
        ('Sog\'liq ma\'lumotlari', {
            'fields': ('height', 'weight', 'allergies', 'chronic_diseases', 
                      'emergency_contact', 'insurance_number')
        }),
    )