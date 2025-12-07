from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import HttpResponse
import os

# Frontend index.html ni serve qilish uchun
def serve_frontend(request):
    frontend_path = os.path.join(settings.STATIC_ROOT, 'frontend', 'index.html')
    if os.path.exists(frontend_path):
        with open(frontend_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    return HttpResponse('Frontend not found', status=404)

urlpatterns = [
    path('admin/', admin.site.urls),

    # /api/ bilan (v1 olib tashlandi)
    path('api/', include([
        path('auth/', include('accounts.urls')),
        path('doctors/', include('doctors.urls')),
        path('appointments/', include('appointments.urls')),
        path('admin-panel/', include('admin_panel.urls')),
        path('ai/', include('ai_service.urls')),
        path('chat/', include('chat.urls')),
        path('medicines/', include('medicines.urls')),
        path('air-quality/', include('air_quality.urls')),
        path('notifications/', include('notifications.urls')),
        path('payments/', include('payments.urls')),
        path('telegram/', include('telegram_bot.urls')),
    ])),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Frontend - barcha boshqa URL'lar uchun (SPA)
urlpatterns += [
    re_path(r'^(?!api/|admin/|static/|media/).*$', serve_frontend),
]