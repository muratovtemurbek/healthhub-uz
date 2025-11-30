# config/urls.py
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, FileResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import os


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'ok',
        'message': 'HealthHub API is running!'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'message': 'HealthHub UZ API',
        'version': '1.0',
        'endpoints': {
            'auth': '/api/auth/',
            'doctors': '/api/doctors/',
            'appointments': '/api/appointments/',
            'medicines': '/api/medicines/',
            'ai': '/api/ai/',
            'notifications': '/api/notifications/',
            'payments': '/api/payments/',
        }
    })


# Frontend serve qilish
def serve_frontend(request):
    """Frontend index.html serve qilish"""
    frontend_path = os.path.join(settings.BASE_DIR, 'frontend_dist', 'index.html')
    if os.path.exists(frontend_path):
        with open(frontend_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    return HttpResponse("<h1>Frontend not found</h1><p>Run: npm run build</p>", status=404)


def serve_frontend_assets(request, path):
    """Frontend static fayllarni serve qilish"""
    file_path = os.path.join(settings.BASE_DIR, 'frontend_dist', 'assets', path)
    if os.path.exists(file_path):
        # Content type aniqlash
        if path.endswith('.js'):
            content_type = 'application/javascript'
        elif path.endswith('.css'):
            content_type = 'text/css'
        elif path.endswith('.svg'):
            content_type = 'image/svg+xml'
        elif path.endswith('.png'):
            content_type = 'image/png'
        elif path.endswith('.jpg') or path.endswith('.jpeg'):
            content_type = 'image/jpeg'
        elif path.endswith('.woff2'):
            content_type = 'font/woff2'
        elif path.endswith('.woff'):
            content_type = 'font/woff'
        else:
            content_type = 'application/octet-stream'

        return FileResponse(open(file_path, 'rb'), content_type=content_type)
    return HttpResponse("Asset not found", status=404)


def serve_static_file(request, path):
    """Root static fayllarni serve qilish (vite.svg, favicon, etc.)"""
    file_path = os.path.join(settings.BASE_DIR, 'frontend_dist', path)
    if os.path.exists(file_path):
        if path.endswith('.svg'):
            content_type = 'image/svg+xml'
        elif path.endswith('.ico'):
            content_type = 'image/x-icon'
        elif path.endswith('.png'):
            content_type = 'image/png'
        else:
            content_type = 'application/octet-stream'
        return FileResponse(open(file_path, 'rb'), content_type=content_type)
    return HttpResponse("File not found", status=404)


# API URLs
urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health-check'),
    path('api/', api_root, name='api-root'),
    path('api/auth/', include('accounts.urls')),
    path('api/doctors/', include('doctors.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/medicines/', include('medicines.urls')),
    path('api/ai/', include('ai_service.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/telegram/', include('telegram_bot.urls')),
    path('api/payments/', include('payments.urls')),
]

# Static va Media (Development)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Frontend assets
urlpatterns += [
    re_path(r'^assets/(?P<path>.*)$', serve_frontend_assets, name='frontend-assets'),
    re_path(r'^(?P<path>vite\.svg|favicon\.ico|robots\.txt)$', serve_static_file, name='static-files'),
]

# Catch-all - Frontend SPA uchun (OXIRIDA bo'lishi kerak!)
urlpatterns += [
    re_path(r'^(?!api/|admin/|health/|static/|media/|assets/).*$', serve_frontend, name='frontend'),
]