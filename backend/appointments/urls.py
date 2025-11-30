# appointments/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, appointment_update

router = DefaultRouter()
router.register(r'', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('<uuid:pk>/update/', appointment_update, name='appointment-update'),
    path('', include(router.urls)),
]