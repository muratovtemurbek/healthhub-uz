from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, FileResponse
from django.views.static import serve
import os
import mimetypes

# Frontend fayllarini serve qilish
def serve_frontend_file(request, path=''):
    frontend_dir = os.path.join(settings.STATIC_ROOT, 'frontend')

    # Agar path bo'sh yoki '/' bilan tugasa, index.html qaytarish
    if not path or path.endswith('/') or '.' not in os.path.basename(path):
        file_path = os.path.join(frontend_dir, 'index.html')
    else:
        file_path = os.path.join(frontend_dir, path)

    if os.path.exists(file_path) and os.path.isfile(file_path):
        content_type, _ = mimetypes.guess_type(file_path)
        return FileResponse(open(file_path, 'rb'), content_type=content_type or 'application/octet-stream')

    # Fayl topilmasa, index.html qaytarish (SPA uchun)
    index_path = os.path.join(frontend_dir, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(open(index_path, 'rb'), content_type='text/html')

    return HttpResponse('Frontend not found', status=404)

urlpatterns = [
    path('admin/', admin.site.urls),

    # /api/ bilan (v1 olib tashlandi)
    path('api/', include([
        path('auth/', include('accounts.urls')),
        path('accounts/', include('accounts.urls')),  # /api/accounts/ ham ishlaydi
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

    # Frontend assets
    re_path(r'^assets/(?P<path>.*)$', lambda request, path: serve_frontend_file(request, f'assets/{path}')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Frontend - barcha boshqa URL'lar uchun (SPA)
urlpatterns += [
    re_path(r'^(?!api/|admin/|static/|media/|assets/).*$', serve_frontend_file),
]