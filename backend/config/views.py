# config/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection
from django.conf import settings
from drf_spectacular.utils import extend_schema
import sys
import django


@extend_schema(
    summary="Health Check",
    description="Server holatini tekshirish",
    tags=['System']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Server health check endpoint
    """
    # Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return Response({
        'status': 'healthy',
        'service': 'HealthHub UZ API',
        'version': '1.0.0',
        'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        'django_version': django.get_version(),
        'database': db_status,
        'debug_mode': settings.DEBUG,
        'ai_configured': bool(settings.ANTHROPIC_API_KEY),
    })


@extend_schema(
    summary="API Information",
    description="API haqida umumiy ma'lumot va barcha endpoint'lar ro'yxati",
    tags=['System']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def api_info(request):
    """
    API ma'lumotlari va endpoint'lar ro'yxati
    """
    base_url = request.build_absolute_uri('/')

    return Response({
        'name': 'HealthHub UZ API',
        'version': '1.0.0',
        'description': 'AI-powered healthcare platform for Uzbekistan',
        'features': [
            '🤖 AI-powered symptom analysis',
            '💊 Medicine price comparison',
            '📅 Real-time appointments',
            '📋 Digital prescriptions',
            '🏥 Multi-hospital support',
            '💉 Pharmacy integration'
        ],
        'documentation': {
            'swagger': f"{base_url}api/docs/",
            'redoc': f"{base_url}api/redoc/",
            'schema': f"{base_url}api/schema/",
        },
        'endpoints': {
            'authentication': {
                'register': f"{base_url}api/auth/register/",
                'login': f"{base_url}api/auth/login/",
                'profile': f"{base_url}api/auth/profile/",
                'me': f"{base_url}api/auth/me/",
            },
            'doctors': {
                'list': f"{base_url}api/doctors/",
                'specializations': f"{base_url}api/specializations/",
                'hospitals': f"{base_url}api/hospitals/",
            },
            'appointments': {
                'list': f"{base_url}api/appointments/",
                'upcoming': f"{base_url}api/appointments/upcoming/",
                'history': f"{base_url}api/appointments/history/",
            },
            'medicines': {
                'list': f"{base_url}api/medicines/",
                'pharmacies': f"{base_url}api/pharmacies/",
            },
            'ai': {
                'analyze': f"{base_url}api/ai/consultations/analyze_symptoms/",
                'recent': f"{base_url}api/ai/consultations/recent/",
            }
        },
        'test_credentials': {
            'patient': {
                'username': 'patient',
                'password': 'patient123'
            },
            'doctor': {
                'username': 'dr_karimov',
                'password': 'doctor123'
            }
        },
        'support': {
            'email': 'support@healthhub.uz',
            'telegram': '@healthhub_uz'
        }
    })