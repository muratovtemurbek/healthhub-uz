# accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'accounts'

urlpatterns = [
    # Auth (Class-based views)
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Profile
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/detail/', views.profile_detail, name='profile-detail'),
    path('me/', views.current_user, name='current-user'),

    # Medical Card
    path('medical-card/', views.medical_card, name='medical-card'),

    # Password
    path('change-password/', views.change_password, name='change-password'),

    # Health Alerts (Air Quality)
    path('health-alerts/', views.health_alerts, name='health-alerts'),

    # Documents
    path('documents/', views.medical_documents, name='documents-list'),
    path('documents/<int:pk>/', views.medical_document_detail, name='document-detail'),

    # Analytics
    path('analytics/health/', views.health_statistics, name='health-statistics'),
    path('analytics/appointments/', views.appointments_chart, name='appointments-chart'),
    path('analytics/spending/', views.spending_chart, name='spending-chart'),
    path('analytics/air-quality/', views.air_quality_history_chart, name='air-quality-chart'),
    path('analytics/medicine-adherence/', views.medicine_adherence_chart, name='medicine-adherence'),
    path('analytics/weekly-report/', views.weekly_report, name='weekly-report'),

    # Dashboard Widgets
    path('dashboard/widgets/', views.dashboard_widgets, name='dashboard-widgets'),

    # Admin (agar admin bo'lsa)
    path('admin/stats/', views.admin_stats, name='admin-stats'),
    path('admin/users/', views.admin_users, name='admin-users'),
    path('admin/users/<uuid:user_id>/', views.admin_user_delete, name='admin-user-delete'),
    path('admin/payments/', views.admin_payments, name='admin-payments'),
    path('admin/appointments/', views.admin_appointments, name='admin-appointments'),

    # Users ViewSet (admin uchun)
    path('users/', views.UserViewSet.as_view({'get': 'list', 'post': 'create'}), name='users-list'),
    path('users/<uuid:pk>/', views.UserViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='users-detail'),
]