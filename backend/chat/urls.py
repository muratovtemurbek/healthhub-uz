# chat/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Root
    path('', views.chat_root, name='chat-root'),

    # Rooms
    path('rooms/', views.get_chat_rooms, name='chat-rooms'),

    # Messages
    path('rooms/<str:room_id>/messages/', views.get_messages, name='chat-messages'),
    path('rooms/<str:room_id>/send/', views.send_message, name='send-message'),
    path('rooms/<str:room_id>/read/', views.mark_as_read, name='mark-as-read'),

    # Start chat
    path('start/<str:doctor_id>/', views.start_chat, name='start-chat'),

    # Unread
    path('unread/', views.get_unread_count, name='unread-count'),

    # Delete
    path('messages/<str:message_id>/delete/', views.delete_message, name='delete-message'),

    # ============== VIDEO CALL ==============
    path('call/start/<str:room_id>/', views.start_video_call, name='start-video-call'),
    path('call/<str:call_id>/answer/', views.answer_call, name='answer-call'),
    path('call/<str:call_id>/decline/', views.decline_call, name='decline-call'),
    path('call/<str:call_id>/end/', views.end_call, name='end-call'),
    path('call/<str:call_id>/status/', views.get_call_status, name='call-status'),
    path('call/incoming/', views.get_incoming_call, name='incoming-call'),
    path('call/history/<str:room_id>/', views.get_call_history, name='call-history'),
]