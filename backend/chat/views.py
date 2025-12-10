# chat/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q, Count, Max
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import ChatRoom, Message, ChatNotification


@api_view(['GET'])
@permission_classes([AllowAny])
def chat_root(request):
    """Chat API root"""
    return Response({
        'message': 'Chat API',
        'endpoints': {
            'rooms': '/api/chat/rooms/',
            'messages': '/api/chat/rooms/{room_id}/messages/',
            'send': '/api/chat/rooms/{room_id}/send/',
            'start': '/api/chat/start/{doctor_id}/',
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_rooms(request):
    """Foydalanuvchining barcha chat xonalari"""

    user = request.user
    rooms = ChatRoom.objects.filter(
        Q(patient=user) | Q(doctor=user),
        is_active=True
    ).select_related('patient', 'doctor').order_by('-updated_at')

    result = []
    for room in rooms:
        is_patient = room.patient == user
        other_user = room.doctor if is_patient else room.patient

        # Unread count
        unread = Message.objects.filter(
            room=room,
            is_read=False
        ).exclude(sender=user).count()

        # Specialty olish
        specialty = 'Shifokor'
        try:
            from doctors.models import Doctor
            doctor_profile = Doctor.objects.filter(user=other_user).first()
            if doctor_profile:
                specialty = doctor_profile.specialty
        except:
            pass

        result.append({
            'id': str(room.id),
            'doctor_id': str(other_user.id),
            'doctor_name': f"Dr. {other_user.first_name} {other_user.last_name}".strip() or other_user.email,
            'doctor_specialty': specialty,
            'doctor_avatar': other_user.avatar.url if other_user.avatar else None,
            'last_message': room.last_message,
            'last_message_at': room.last_message_at.isoformat() if room.last_message_at else None,
            'unread_count': unread,
            'is_online': True  # TODO: implement online status
        })

    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, room_id):
    """Chat xonasidagi xabarlar"""

    room = get_object_or_404(ChatRoom, id=room_id)

    # Foydalanuvchi bu xonada borligini tekshirish
    if request.user not in [room.patient, room.doctor]:
        return Response({'error': 'Ruxsat yo\'q'}, status=403)

    messages = Message.objects.filter(
        room=room,
        is_deleted=False
    ).select_related('sender').order_by('created_at')

    # Xabarlarni o'qilgan deb belgilash
    messages.filter(is_read=False).exclude(sender=request.user).update(
        is_read=True,
        read_at=timezone.now()
    )

    result = [{
        'id': str(msg.id),
        'sender': 'patient' if msg.sender == room.patient else 'doctor',
        'sender_name': msg.sender_name,
        'content': msg.content,
        'message_type': msg.message_type,
        'file_url': msg.file.url if msg.file else None,
        'is_read': msg.is_read,
        'created_at': msg.created_at.isoformat()
    } for msg in messages]

    return Response(result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, room_id):
    """Xabar yuborish"""
    content = request.data.get('content', '').strip()
    message_type = request.data.get('message_type', 'text')

    if not content:
        return Response({'error': 'Xabar bo\'sh bo\'lmasligi kerak'}, status=400)

    room = get_object_or_404(ChatRoom, id=room_id)

    if request.user not in [room.patient, room.doctor]:
        return Response({'error': 'Ruxsat yo\'q'}, status=403)

    # Xabar yaratish
    message = Message.objects.create(
        room=room,
        sender=request.user,
        content=content,
        message_type=message_type
    )

    # Room ni yangilash
    room.last_message = content[:100]
    room.last_message_at = timezone.now()
    room.save()

    # Notifikatsiya yuborish
    try:
        from notifications.views import create_notification
        other_user = room.doctor if request.user == room.patient else room.patient
        create_notification(
            user=other_user,
            title='Yangi xabar',
            message=f'{request.user.first_name}: {content[:50]}...' if len(content) > 50 else f'{request.user.first_name}: {content}',
            notif_type='new_message'
        )
    except:
        pass

    return Response({
        'id': str(message.id),
        'sender': 'patient' if message.sender == room.patient else 'doctor',
        'sender_name': message.sender_name,
        'content': message.content,
        'message_type': message.message_type,
        'is_read': False,
        'created_at': message.created_at.isoformat()
    }, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_chat(request, doctor_id):
    """Shifokor bilan yangi chat boshlash"""

    from django.contrib.auth import get_user_model
    User = get_user_model()

    doctor_user = get_object_or_404(User, id=doctor_id)

    # Mavjud chat bormi tekshirish
    room, created = ChatRoom.objects.get_or_create(
        patient=request.user,
        doctor=doctor_user,
        defaults={'is_active': True}
    )

    return Response({
        'room_id': str(room.id),
        'created': created,
        'doctor_name': f"Dr. {doctor_user.first_name} {doctor_user.last_name}".strip() or doctor_user.email
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_as_read(request, room_id):
    """Barcha xabarlarni o'qilgan deb belgilash"""

    room = get_object_or_404(ChatRoom, id=room_id)

    if request.user not in [room.patient, room.doctor]:
        return Response({'error': 'Ruxsat yo\'q'}, status=403)

    Message.objects.filter(
        room=room,
        is_read=False
    ).exclude(sender=request.user).update(
        is_read=True,
        read_at=timezone.now()
    )

    return Response({'success': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_count(request):
    """Jami o'qilmagan xabarlar soni"""

    user = request.user
    rooms = ChatRoom.objects.filter(
        Q(patient=user) | Q(doctor=user),
        is_active=True
    )

    total_unread = Message.objects.filter(
        room__in=rooms,
        is_read=False
    ).exclude(sender=user).count()

    return Response({'unread_count': total_unread})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_message(request, message_id):
    """Xabarni o'chirish"""

    message = get_object_or_404(Message, id=message_id)

    if message.sender != request.user:
        return Response({'error': 'Faqat o\'z xabaringizni o\'chira olasiz'}, status=403)

    message.is_deleted = True
    message.content = "Bu xabar o'chirildi"
    message.save()

    return Response({'success': True})