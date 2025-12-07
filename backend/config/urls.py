from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

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