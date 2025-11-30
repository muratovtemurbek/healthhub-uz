# doctors/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Public API
    path('', views.DoctorListView.as_view(), name='doctor-list'),
    path('specialties/', views.specialties_list, name='specialties'),
    path('<uuid:pk>/', views.DoctorDetailView.as_view(), name='doctor-detail'),

    # Doctor Panel API
    path('stats/', views.doctor_stats, name='doctor-stats'),
    path('my-appointments/', views.doctor_appointments_list, name='doctor-appointments'),
    path('appointments/today/', views.doctor_today_appointments, name='doctor-today-appointments'),
    path('appointments/<uuid:appointment_id>/', views.doctor_update_appointment, name='doctor-update-appointment'),
    path('patients/', views.doctor_patients_list, name='doctor-patients'),
    path('profile/', views.doctor_profile, name='doctor-profile'),
    path('profile/update/', views.doctor_profile_update, name='doctor-profile-update'),
]