# medicines/hospitals_urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.hospitals_list, name='hospitals-list'),
    path('nearby/', views.nearby_hospitals, name='hospitals-nearby'),
    path('<int:pk>/', views.hospital_detail, name='hospital-detail'),
    path('<int:pk>/review/', views.hospital_review, name='hospital-review'),
]