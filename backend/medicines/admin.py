# medicines/admin.py
from django.contrib import admin
from .models import Category, Pharmacy, Medicine, PharmacyPrice


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'icon']
    search_fields = ['name']


@admin.register(Pharmacy)
class PharmacyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'address', 'phone', 'is_24_7']
    list_filter = ['is_24_7']
    search_fields = ['name', 'address']


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'generic_name', 'category', 'manufacturer', 'price', 'requires_prescription', 'in_stock']
    list_filter = ['category', 'requires_prescription', 'in_stock']
    search_fields = ['name', 'generic_name', 'manufacturer']
    list_editable = ['price', 'in_stock']


@admin.register(PharmacyPrice)
class PharmacyPriceAdmin(admin.ModelAdmin):
    list_display = ['id', 'medicine', 'pharmacy', 'price', 'in_stock', 'updated_at']
    list_filter = ['pharmacy', 'in_stock']
    search_fields = ['medicine__name', 'pharmacy__name']
    list_editable = ['price', 'in_stock']
    autocomplete_fields = ['medicine', 'pharmacy']