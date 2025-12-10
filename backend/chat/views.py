# chat/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q, Count, Max
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import ChatRoom, Message, ChatNotification, VideoCall


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


# ============== VIDEO CALL ==============

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_video_call(request, room_id):
    """Video qo'ng'iroq boshlash"""
    room = get_object_or_404(ChatRoom, id=room_id)

    if request.user not in [room.patient, room.doctor]:
        return Response({'error': 'Ruxsat yo\'q'}, status=403)

    # Faol qo'ng'iroq bor-yo'qligini tekshirish
    active_call = VideoCall.objects.filter(
        room=room,
        status__in=['pending', 'ringing', 'active']
    ).first()

    if active_call:
        return Response({
            'error': 'Bu xonada faol qo\'ng\'iroq mavjud',
            'call_id': str(active_call.id),
            'status': active_call.status
        }, status=400)

    receiver = room.doctor if request.user == room.patient else room.patient
    is_video = request.data.get('is_video', True)

    call = VideoCall.objects.create(
        room=room,
        caller=request.user,
        receiver=receiver,
        is_video=is_video,
        status='ringing'
    )

    # Notifikatsiya yuborish
    try:
        from notifications.views import create_notification
        create_notification(
            user=receiver,
            title='Kiruvchi qo\'ng\'iroq',
            message=f'{request.user.first_name} {"video" if is_video else "audio"} qo\'ng\'iroq qilmoqda',
            notif_type='incoming_call'
        )
    except:
        pass

    return Response({
        'call_id': str(call.id),
        'room_id': str(room.id),
        'caller': {
            'id': str(request.user.id),
            'name': request.user.get_full_name()
        },
        'receiver': {
            'id': str(receiver.id),
            'name': receiver.get_full_name()
        },
        'is_video': is_video,
        'status': 'ringing'
    }, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def answer_call(request, call_id):
    """Qo'ng'iroqqa javob berish"""
    call = get_object_or_404(VideoCall, id=call_id)

    if request.user != call.receiver:
        return Response({'error': 'Siz bu qo\'ng\'iroqni qabul qila olmaysiz'}, status=403)

    if call.status not in ['pending', 'ringing']:
        return Response({'error': 'Qo\'ng\'iroq holati mos emas'}, status=400)

    call.status = 'active'
    call.started_at = timezone.now()
    call.save()

    return Response({
        'call_id': str(call.id),
        'status': 'active',
        'started_at': call.started_at.isoformat()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def decline_call(request, call_id):
    """Qo'ng'iroqni rad etish"""
    call = get_object_or_404(VideoCall, id=call_id)

    if request.user not in [call.caller, call.receiver]:
        return Response({'error': 'Ruxsat yo\'q'}, status=403)

    if call.status in ['ended', 'missed', 'declined']:
        return Response({'error': 'Qo\'ng\'iroq allaqachon tugagan'}, status=400)

    if request.user == call.receiver:
        call.status = 'declined'
    else:
        call.status = 'ended'

    call.ended_at = timezone.now()
    call.save()

    return Response({
        'call_id': str(call.id),
        'status': call.status
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_call(request, call_id):
    """Qo'ng'iroqni tugatish"""
    call = get_object_or_404(VideoCall, id=call_id)

    if request.user not in [call.caller, call.receiver]:
        return Response({'error': 'Ruxsat yo\'q'}, status=403)

    if call.status == 'ended':
        return Response({'error': 'Qo\'ng\'iroq allaqachon tugagan'}, status=400)

    call.status = 'ended'
    call.ended_at = timezone.now()

    if call.started_at:
        call.duration = int((call.ended_at - call.started_at).total_seconds())

    call.save()

    # Chat xabariga qo'shish
    Message.objects.create(
        room=call.room,
        sender=request.user,
        message_type='system',
        content=f'{"Video" if call.is_video else "Audio"} qo\'ng\'iroq: {call.duration_formatted}'
    )

    return Response({
        'call_id': str(call.id),
        'status': 'ended',
        'duration': call.duration,
        'duration_formatted': call.duration_formatted
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_call_status(request, call_id):
    """Qo'ng'iroq holatini olish"""
    call = get_object_or_404(VideoCall, id=call_id)

    if request.user not in [call.caller, call.receiver]:
        return Response({'error': 'Ruxsat yo\'q'}, status=403)

    return Response({
        'call_id': str(call.id),
        'room_id': str(call.room.id),
        'caller': {
            'id': str(call.caller.id),
            'name': call.caller.get_full_name()
        },
        'receiver': {
            'id': str(call.receiver.id),
            'name': call.receiver.get_full_name()
        },
        'status': call.status,
        'is_video': call.is_video,
        'started_at': call.started_at.isoformat() if call.started_at else None,
        'duration': call.duration
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_incoming_call(request):
    """Kiruvchi qo'ng'iroqni tekshirish"""
    call = VideoCall.objects.filter(
        receiver=request.user,
        status='ringing'
    ).order_by('-created_at').first()

    if not call:
        return Response({'has_incoming_call': False})

    return Response({
        'has_incoming_call': True,
        'call': {
            'call_id': str(call.id),
            'room_id': str(call.room.id),
            'caller': {
                'id': str(call.caller.id),
                'name': call.caller.get_full_name(),
                'avatar': call.caller.avatar.url if call.caller.avatar else None
            },
            'is_video': call.is_video,
            'created_at': call.created_at.isoformat()
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_call_history(request, room_id):
    """Qo'ng'iroqlar tarixi"""
    room = get_object_or_404(ChatRoom, id=room_id)

    if request.user not in [room.patient, room.doctor]:
        return Response({'error': 'Ruxsat yo\'q'}, status=403)

    calls = VideoCall.objects.filter(room=room).order_by('-created_at')[:20]

    result = [{
        'id': str(call.id),
        'caller': call.caller.get_full_name(),
        'is_outgoing': call.caller == request.user,
        'status': call.status,
        'is_video': call.is_video,
        'duration': call.duration,
        'duration_formatted': call.duration_formatted,
        'created_at': call.created_at.isoformat()
    } for call in calls]

    return Response(result)