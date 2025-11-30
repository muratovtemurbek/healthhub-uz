# notifications/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """Bildirishnomalar API"""
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]  # Keyinchalik IsAuthenticated qilish

    def get_queryset(self):
        # Hozircha barcha notifications, keyinchalik user filter
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Notification.objects.filter(user_id=user_id)
        return Notification.objects.all()

    def list(self, request, *args, **kwargs):
        """Bildirishnomalar ro'yxati"""
        queryset = self.get_queryset()

        # Filter by read status
        is_read = request.query_params.get('is_read')
        if is_read == 'true':
            queryset = queryset.filter(is_read=True)
        elif is_read == 'false':
            queryset = queryset.filter(is_read=False)

        # Filter by type
        notif_type = request.query_params.get('type')
        if notif_type:
            queryset = queryset.filter(type=notif_type)

        serializer = self.get_serializer(queryset[:50], many=True)

        # Statistika
        user_id = request.query_params.get('user_id')
        if user_id:
            all_notifs = Notification.objects.filter(user_id=user_id)
        else:
            all_notifs = Notification.objects.all()

        return Response({
            'notifications': serializer.data,
            'stats': {
                'total': all_notifs.count(),
                'unread': all_notifs.filter(is_read=False).count(),
            }
        })

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Bildirishnomani o'qilgan deb belgilash"""
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()

        return Response({
            'success': True,
            'message': 'O\'qilgan deb belgilandi'
        })

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Barcha bildirishnomalarni o'qilgan deb belgilash"""
        user_id = request.data.get('user_id')

        if user_id:
            notifications = Notification.objects.filter(user_id=user_id, is_read=False)
        else:
            notifications = Notification.objects.filter(is_read=False)

        count = notifications.count()
        notifications.update(is_read=True, read_at=timezone.now())

        return Response({
            'success': True,
            'message': f'{count} ta bildirishnoma o\'qilgan deb belgilandi'
        })

    @action(detail=False, methods=['post'])
    def send(self, request):
        """Yangi bildirishnoma yuborish"""
        user_id = request.data.get('user_id')
        title = request.data.get('title', '')
        message = request.data.get('message', '')
        notif_type = request.data.get('type', 'system')

        if not user_id or not title:
            return Response({
                'error': 'user_id va title kerak'
            }, status=status.HTTP_400_BAD_REQUEST)

        notification = Notification.objects.create(
            user_id=user_id,
            type=notif_type,
            title=title,
            message=message,
            appointment_id=request.data.get('appointment_id'),
            doctor_id=request.data.get('doctor_id'),
        )

        return Response({
            'success': True,
            'notification': NotificationSerializer(notification).data
        }, status=status.HTTP_201_CREATED)


# Utility function - boshqa app lardan chaqirish uchun
def create_notification(user_id, title, message, notif_type='system', **kwargs):
    """Bildirishnoma yaratish"""
    return Notification.objects.create(
        user_id=user_id,
        type=notif_type,
        title=title,
        message=message,
        **kwargs
    )