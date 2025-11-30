# accounts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('me/', views.current_user, name='current-user'),

    # Admin API
    path('admin/stats/', views.admin_stats, name='admin-stats'),
    path('admin/users/', views.admin_users, name='admin-users'),
    path('admin/users/<int:user_id>/', views.admin_user_delete, name='admin-user-delete'),
    path('admin/payments/', views.admin_payments, name='admin-payments'),
    path('admin/appointments/', views.admin_appointments, name='admin-appointments'),
]