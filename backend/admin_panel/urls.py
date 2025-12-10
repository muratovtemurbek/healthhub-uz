# admin_panel/urls.py - TO'LIQ ISHLAYDIGAN VERSIYA
from django.urls import path
from . import views

urlpatterns = [
    # ============== DASHBOARD ==============
    path('dashboard/stats/', views.admin_dashboard_stats, name='admin-dashboard-stats'),
    path('dashboard/activity/', views.admin_recent_activity, name='admin-recent-activity'),
    path('dashboard/top-doctors/', views.admin_top_doctors, name='admin-top-doctors'),

    # ============== DOCTORS ==============
    path('doctors/', views.admin_doctors_list, name='admin-doctors-list'),
    path('doctors/create/', views.admin_doctor_create, name='admin-doctor-create'),
    path('doctors/stats/', views.admin_doctors_stats, name='admin-doctors-stats'),
    path('doctors/<uuid:pk>/', views.admin_doctor_detail, name='admin-doctor-detail'),
    path('doctors/<uuid:pk>/activate/', views.admin_doctor_activate, name='admin-doctor-activate'),
    path('doctors/<uuid:pk>/deactivate/', views.admin_doctor_deactivate, name='admin-doctor-deactivate'),

    # ============== DROPDOWNS ==============
    path('specializations/', views.admin_specializations_list, name='admin-specializations'),
    path('hospitals/dropdown/', views.admin_hospitals_dropdown, name='admin-hospitals-dropdown'),

    # ============== PATIENTS ==============
    path('patients/', views.admin_patients_list, name='admin-patients-list'),
    path('patients/stats/', views.admin_patients_stats, name='admin-patients-stats'),
    path('patients/<uuid:pk>/', views.admin_patient_detail, name='admin-patient-detail'),
    path('patients/<uuid:pk>/activate/', views.admin_patient_activate, name='admin-patient-activate'),
    path('patients/<uuid:pk>/deactivate/', views.admin_patient_deactivate, name='admin-patient-deactivate'),

    # ============== APPOINTMENTS ==============
    path('appointments/', views.admin_appointments_list, name='admin-appointments-list'),
    path('appointments/stats/', views.admin_appointments_stats, name='admin-appointments-stats'),
    path('appointments/<uuid:pk>/confirm/', views.admin_appointment_confirm, name='admin-appointment-confirm'),
    path('appointments/<uuid:pk>/cancel/', views.admin_appointment_cancel, name='admin-appointment-cancel'),

    # ============== HOSPITALS ==============
    path('hospitals/', views.admin_hospitals_list, name='admin-hospitals-list'),

    # ============== SETTINGS ==============
    path('settings/', views.admin_settings, name='admin-settings'),
    path('settings/update/', views.admin_settings_update, name='admin-settings-update'),
]