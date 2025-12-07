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
]