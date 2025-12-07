# medicines/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'medicines'

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'pharmacies', views.PharmacyViewSet, basename='pharmacy')
router.register(r'medicines', views.MedicineViewSet, basename='medicine')  # items -> medicines
router.register(r'prices', views.PharmacyPriceViewSet, basename='price')

urlpatterns = [
    # ViewSet router
    path('', include(router.urls)),

    # Reminders
    path('reminders/', views.medicine_reminders, name='reminders-list'),
    path('reminders/today/', views.today_schedule, name='today-schedule'),
    path('reminders/<int:pk>/', views.medicine_reminder_detail, name='reminder-detail'),
    path('reminders/<int:pk>/log/', views.log_medicine_taken, name='reminder-log'),

    # Hospitals (medicines app ichida)
    path('hospitals/', views.hospitals_list, name='hospitals-list'),
    path('hospitals/nearby/', views.nearby_hospitals, name='hospitals-nearby'),
    path('hospitals/<int:pk>/', views.hospital_detail, name='hospital-detail'),
    path('hospitals/<int:pk>/review/', views.hospital_review, name='hospital-review'),
]