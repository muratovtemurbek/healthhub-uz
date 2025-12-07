# hospitals/urls.py
from django.urls import path
from . import views

app_name = 'hospitals'

urlpatterns = [
    path('', views.hospitals_list, name='list'),
    path('nearby/', views.nearby_hospitals, name='nearby'),
    path('<int:pk>/', views.hospital_detail, name='detail'),
    path('<int:pk>/review/', views.hospital_review, name='review'),
]