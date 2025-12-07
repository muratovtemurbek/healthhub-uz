# chat/serializers.py
from rest_framework import serializers

try:
    from .models import ChatRoom, Message, ChatNotification

    MODELS_AVAILABLE = True
except:
    MODELS_AVAILABLE = False

if MODELS_AVAILABLE:
    class ChatRoomSerializer(serializers.ModelSerializer):
        patient_name = serializers.CharField(read_only=True)
        doctor_name = serializers.CharField(read_only=True)
        unread_count = serializers.SerializerMethodField()

        class Meta:
            model = ChatRoom
            fields = [
                'id', 'patient', 'doctor', 'patient_name', 'doctor_name',
                'appointment', 'is_active', 'last_message', 'last_message_at',
                'unread_count', 'created_at', 'updated_at'
            ]
            read_only_fields = ['id', 'created_at', 'updated_at']

        def get_unread_count(self, obj):
            request = self.context.get('request')
            if request and request.user.is_authenticated:
                return Message.objects.filter(
                    room=obj,
                    is_read=False
                ).exclude(sender=request.user).count()
            return 0


    class MessageSerializer(serializers.ModelSerializer):
        sender_name = serializers.CharField(read_only=True)
        sender_type = serializers.SerializerMethodField()

        class Meta:
            model = Message
            fields = [
                'id', 'room', 'sender', 'sender_name', 'sender_type',
                'message_type', 'content', 'file', 'file_name', 'file_size',
                'is_read', 'read_at', 'reply_to', 'created_at', 'is_deleted'
            ]
            read_only_fields = ['id', 'sender', 'created_at']

        def get_sender_type(self, obj):
            if obj.room.patient == obj.sender:
                return 'patient'
            return 'doctor'


    class MessageCreateSerializer(serializers.Serializer):
        content = serializers.CharField(max_length=5000)
        message_type = serializers.ChoiceField(
            choices=['text', 'image', 'file', 'voice'],
            default='text'
        )
        reply_to = serializers.UUIDField(required=False, allow_null=True)


    class ChatNotificationSerializer(serializers.ModelSerializer):
        class Meta:
            model = ChatNotification
            fields = ['id', 'user', 'room', 'unread_count', 'last_notified_at']

else:
    # Placeholder serializers
    class ChatRoomSerializer(serializers.Serializer):
        id = serializers.CharField()
        doctor_name = serializers.CharField()
        last_message = serializers.CharField()


    class MessageSerializer(serializers.Serializer):
        id = serializers.CharField()
        content = serializers.CharField()
        sender = serializers.CharField()


    class MessageCreateSerializer(serializers.Serializer):
        content = serializers.CharField()
        message_type = serializers.CharField(default='text')