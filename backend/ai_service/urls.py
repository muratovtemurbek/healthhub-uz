# ai_service/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .views import AIConsultationViewSet


@api_view(['GET'])
@permission_classes([AllowAny])
def ai_root(request):
    return Response({
        'message': 'AI Service API',
        'endpoints': {
            'consultations': '/api/ai/consultations/',
            'analyze': '/api/ai/consultations/analyze/',
        }
    })


router = DefaultRouter()
router.register(r'consultations', AIConsultationViewSet, basename='consultations')

urlpatterns = [
    path('', ai_root, name='ai-root'),
    path('', include(router.urls)),
]