# ai_service/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .views import (
    AIConsultationViewSet,
    check_symptoms,
    get_symptoms_list,
    get_specializations,
    get_check_history,
    ai_chat
)


@api_view(['GET'])
@permission_classes([AllowAny])
def ai_root(request):
    return Response({
        'message': 'AI Service API',
        'version': '2.0',
        'endpoints': {
            'consultations': '/api/ai/consultations/',
            'analyze': '/api/ai/consultations/analyze/',
            'symptoms_check': '/api/ai/symptoms/check/',
            'symptoms_list': '/api/ai/symptoms/list/',
            'specializations': '/api/ai/specializations/',
            'history': '/api/ai/history/',
            'chat': '/api/ai/chat/',
        }
    })


router = DefaultRouter()
router.register(r'consultations', AIConsultationViewSet, basename='consultations')

urlpatterns = [
    # Root
    path('', ai_root, name='ai-root'),

    # Symptom Checker (yangi)
    path('symptoms/check/', check_symptoms, name='check-symptoms'),
    path('symptoms/list/', get_symptoms_list, name='symptoms-list'),

    # Specializations
    path('specializations/', get_specializations, name='specializations'),

    # History
    path('history/', get_check_history, name='check-history'),

    # Chat
    path('chat/', ai_chat, name='ai-chat'),

    # Router (consultations ViewSet)
    path('', include(router.urls)),
]