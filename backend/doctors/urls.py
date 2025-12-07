# doctors/urls.py - TO'LIQ ISHLAYDIGAN VERSIYA
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'specializations', views.SpecializationViewSet, basename='specialization')
router.register(r'list', views.PublicDoctorViewSet, basename='public-doctors')

urlpatterns = [
    # Router URLs (Public)
    path('', include(router.urls)),

    # ============== DOCTOR PANEL ==============

    # Shifokor profili
    path('me/', views.doctor_me, name='doctor-me'),
    path('me/update/', views.doctor_update_profile, name='doctor-update-profile'),
    path('me/stats/', views.doctor_dashboard_stats, name='doctor-stats'),
    path('me/today/', views.doctor_today_schedule, name='doctor-today'),
    path('me/recent-patients/', views.doctor_recent_patients, name='doctor-recent-patients'),

    # Qabullar
    path('my-appointments/', views.doctor_appointments, name='doctor-appointments'),
    path('my-appointments/<uuid:pk>/', views.doctor_appointment_detail, name='doctor-appointment-detail'),
    path('my-appointments/<uuid:pk>/confirm/', views.doctor_appointment_confirm, name='doctor-appointment-confirm'),
    path('my-appointments/<uuid:pk>/complete/', views.doctor_appointment_complete, name='doctor-appointment-complete'),
    path('my-appointments/<uuid:pk>/cancel/', views.doctor_appointment_cancel, name='doctor-appointment-cancel'),

    # Bemorlar
    path('my-patients/', views.doctor_patients, name='doctor-patients'),
    path('my-patients/<uuid:pk>/', views.doctor_patient_detail, name='doctor-patient-detail'),

    # Jadval
    path('my-schedule/', views.doctor_schedule, name='doctor-schedule'),
    path('my-schedule/update/', views.doctor_schedule_update, name='doctor-schedule-update'),

    # Tibbiy yozuvlar
    path('my-records/', views.doctor_records, name='doctor-records'),
    path('my-records/create/', views.doctor_record_create, name='doctor-record-create'),

    # Sharhlar
    path('my-reviews/', views.doctor_reviews, name='doctor-reviews'),
]