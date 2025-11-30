# medicines/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicineViewSet, PharmacyViewSet, CategoryViewSet, PharmacyPriceViewSet

router = DefaultRouter()
router.register(r'medicines', MedicineViewSet, basename='medicines')
router.register(r'pharmacies', PharmacyViewSet, basename='pharmacies')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'prices', PharmacyPriceViewSet, basename='prices')

urlpatterns = [
    path('', include(router.urls)),
]