# chat/admin.py
from django.contrib import admin

try:
    from .models import ChatRoom, Message, ChatNotification


    @admin.register(ChatRoom)
    class ChatRoomAdmin(admin.ModelAdmin):
        list_display = ['id', 'patient', 'doctor', 'is_active', 'last_message_at', 'created_at']
        list_filter = ['is_active', 'created_at']
        search_fields = ['patient__email', 'doctor__email', 'patient__first_name', 'doctor__first_name']
        ordering = ['-updated_at']
        readonly_fields = ['id', 'created_at', 'updated_at']


    @admin.register(Message)
    class MessageAdmin(admin.ModelAdmin):
        list_display = ['id', 'room', 'sender', 'message_type', 'content_short', 'is_read', 'created_at']
        list_filter = ['message_type', 'is_read', 'is_deleted', 'created_at']
        search_fields = ['content', 'sender__email']
        ordering = ['-created_at']
        readonly_fields = ['id', 'created_at', 'updated_at']

        def content_short(self, obj):
            return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content

        content_short.short_description = 'Xabar'


    @admin.register(ChatNotification)
    class ChatNotificationAdmin(admin.ModelAdmin):
        list_display = ['user', 'room', 'unread_count', 'last_notified_at']
        list_filter = ['last_notified_at']

except ImportError:
    pass