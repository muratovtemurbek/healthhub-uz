# air_quality/urls.py
from django.urls import path
from . import views

app_name = 'air_quality'

urlpatterns = [
    path('', views.get_air_quality, name='current'),
    path('history/', views.get_air_quality_history, name='history'),
    path('cities/', views.get_cities, name='cities'),
    path('recommendations/', views.health_recommendations, name='recommendations'),
    path('test/', views.test_iqair_api, name='test'),
    path('clear-cache/', views.clear_cache, name='clear_cache'),
]