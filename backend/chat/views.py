# chat/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q, Count, Max
from django.utils import timezone
from django.shortcuts import get_object_or_404

try:
    from .models import ChatRoom, Message, ChatNotification

    MODELS_AVAILABLE = True
except:
    MODELS_AVAILABLE = False

try:
    from doctors.models import Doctor

    DOCTOR_MODEL = True
except:
    DOCTOR_MODEL = False

# ==================== DEMO DATA ====================
DEMO_CHAT_ROOMS = [
    {
        "id": "room-1",
        "doctor_id": "doc-1",
        "doctor_name": "Dr. Akbar Karimov",
        "doctor_specialty": "Kardiolog",
        "doctor_avatar": None,
        "last_message": "Yaxshi, ertaga soat 10:00 da kutaman",
        "last_message_at": "2024-01-15T14:30:00Z",
        "unread_count": 2,
        "is_online": True
    },
    {
        "id": "room-2",
        "doctor_id": "doc-2",
        "doctor_name": "Dr. Malika Rahimova",
        "doctor_specialty": "Terapevt",
        "doctor_avatar": None,
        "last_message": "Tahlil natijalarini ko'rib chiqdim, hammasi yaxshi",
        "last_message_at": "2024-01-14T16:45:00Z",
        "unread_count": 0,
        "is_online": False
    },
    {
        "id": "room-3",
        "doctor_id": "doc-3",
        "doctor_name": "Dr. Bobur Alimov",
        "doctor_specialty": "Nevrolog",
        "doctor_avatar": None,
        "last_message": "Dori retseptini yubordim",
        "last_message_at": "2024-01-13T09:20:00Z",
        "unread_count": 0,
        "is_online": True
    },
]

DEMO_MESSAGES = {
    "room-1": [
        {"id": "msg-1", "sender": "doctor", "sender_name": "Dr. Akbar Karimov",
         "content": "Assalomu alaykum! Qanday yordam bera olaman?", "created_at": "2024-01-15T10:00:00Z",
         "is_read": True},
        {"id": "msg-2", "sender": "patient", "sender_name": "Bemor",
         "content": "Vaalaykum assalom! Ko'krak sohasida og'riq bor", "created_at": "2024-01-15T10:05:00Z",
         "is_read": True},
        {"id": "msg-3", "sender": "doctor", "sender_name": "Dr. Akbar Karimov",
         "content": "Qachondan beri og'riyapti? Qanday og'riq - keskin yoki o'tmas?",
         "created_at": "2024-01-15T10:10:00Z", "is_read": True},
        {"id": "msg-4", "sender": "patient", "sender_name": "Bemor",
         "content": "2-3 kundan beri. O'tmas og'riq, ba'zan kuchayadi", "created_at": "2024-01-15T10:15:00Z",
         "is_read": True},
        {"id": "msg-5", "sender": "doctor", "sender_name": "Dr. Akbar Karimov",
         "content": "Tushundim. EKG va qon tahlili qilish kerak bo'ladi. Klinikaga kelishingiz mumkinmi?",
         "created_at": "2024-01-15T10:20:00Z", "is_read": True},
        {"id": "msg-6", "sender": "patient", "sender_name": "Bemor", "content": "Ha, ertaga kela olaman",
         "created_at": "2024-01-15T14:00:00Z", "is_read": True},
        {"id": "msg-7", "sender": "doctor", "sender_name": "Dr. Akbar Karimov",
         "content": "Yaxshi, ertaga soat 10:00 da kutaman", "created_at": "2024-01-15T14:30:00Z", "is_read": False},
    ],
    "room-2": [
        {"id": "msg-10", "sender": "patient", "sender_name": "Bemor",
         "content": "Salom doktor, tahlil natijalari tayyor bo'ldimi?", "created_at": "2024-01-14T15:00:00Z",
         "is_read": True},
        {"id": "msg-11", "sender": "doctor", "sender_name": "Dr. Malika Rahimova",
         "content": "Salom! Ha, hozir ko'rib chiqaman", "created_at": "2024-01-14T16:00:00Z", "is_read": True},
        {"id": "msg-12", "sender": "doctor", "sender_name": "Dr. Malika Rahimova",
         "content": "Tahlil natijalarini ko'rib chiqdim, hammasi yaxshi", "created_at": "2024-01-14T16:45:00Z",
         "is_read": True},
    ],
    "room-3": [
        {"id": "msg-20", "sender": "doctor", "sender_name": "Dr. Bobur Alimov",
         "content": "Salom! Bosh og'rig'i qanday?", "created_at": "2024-01-13T09:00:00Z", "is_read": True},
        {"id": "msg-21", "sender": "patient", "sender_name": "Bemor", "content": "Yaxshiroq, lekin hali to'liq o'tmadi",
         "created_at": "2024-01-13T09:10:00Z", "is_read": True},
        {"id": "msg-22", "sender": "doctor", "sender_name": "Dr. Bobur Alimov", "content": "Dori retseptini yubordim",
         "created_at": "2024-01-13T09:20:00Z", "is_read": True},
    ],
}


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
@permission_classes([AllowAny])
def get_chat_rooms(request):
    """Foydalanuvchining barcha chat xonalari"""

    if MODELS_AVAILABLE and request.user.is_authenticated:
        try:
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

                result.append({
                    'id': str(room.id),
                    'doctor_id': str(room.doctor.id) if is_patient else str(room.patient.id),
                    'doctor_name': f"Dr. {other_user.first_name} {other_user.last_name}",
                    'doctor_specialty': getattr(other_user, 'specialty', 'Shifokor'),
                    'doctor_avatar': None,
                    'last_message': room.last_message,
                    'last_message_at': room.last_message_at.isoformat() if room.last_message_at else None,
                    'unread_count': unread,
                    'is_online': True  # TODO: implement online status
                })

            return Response(result)
        except Exception as e:
            print(f"Chat rooms error: {e}")

    # Demo data
    return Response(DEMO_CHAT_ROOMS)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_messages(request, room_id):
    """Chat xonasidagi xabarlar"""

    if MODELS_AVAILABLE and request.user.is_authenticated:
        try:
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
        except Exception as e:
            print(f"Messages error: {e}")

    # Demo data
    messages = DEMO_MESSAGES.get(room_id, [])
    return Response(messages)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_message(request, room_id):
    """Xabar yuborish"""
    content = request.data.get('content', '').strip()
    message_type = request.data.get('message_type', 'text')

    if not content:
        return Response({'error': 'Xabar bo\'sh bo\'lmasligi kerak'}, status=400)

    if MODELS_AVAILABLE and request.user.is_authenticated:
        try:
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

            return Response({
                'id': str(message.id),
                'sender': 'patient' if message.sender == room.patient else 'doctor',
                'sender_name': message.sender_name,
                'content': message.content,
                'message_type': message.message_type,
                'is_read': False,
                'created_at': message.created_at.isoformat()
            }, status=201)
        except Exception as e:
            print(f"Send message error: {e}")

    # Demo response
    import uuid
    return Response({
        'id': str(uuid.uuid4()),
        'sender': 'patient',
        'sender_name': 'Bemor',
        'content': content,
        'message_type': message_type,
        'is_read': False,
        'created_at': timezone.now().isoformat()
    }, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def start_chat(request, doctor_id):
    """Shifokor bilan yangi chat boshlash"""

    if MODELS_AVAILABLE and request.user.is_authenticated:
        try:
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
                'doctor_name': f"Dr. {doctor_user.first_name} {doctor_user.last_name}"
            })
        except Exception as e:
            print(f"Start chat error: {e}")

    # Demo response
    import uuid
    return Response({
        'room_id': f"room-new-{doctor_id}",
        'created': True,
        'doctor_name': 'Dr. Shifokor'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def mark_as_read(request, room_id):
    """Barcha xabarlarni o'qilgan deb belgilash"""

    if MODELS_AVAILABLE and request.user.is_authenticated:
        try:
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
        except Exception as e:
            print(f"Mark as read error: {e}")

    return Response({'success': True})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_unread_count(request):
    """Jami o'qilmagan xabarlar soni"""

    if MODELS_AVAILABLE and request.user.is_authenticated:
        try:
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
        except Exception as e:
            print(f"Unread count error: {e}")

    return Response({'unread_count': 2})


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_message(request, message_id):
    """Xabarni o'chirish"""

    if MODELS_AVAILABLE and request.user.is_authenticated:
        try:
            message = get_object_or_404(Message, id=message_id)

            if message.sender != request.user:
                return Response({'error': 'Faqat o\'z xabaringizni o\'chira olasiz'}, status=403)

            message.is_deleted = True
            message.content = "Bu xabar o'chirildi"
            message.save()

            return Response({'success': True})
        except Exception as e:
            print(f"Delete message error: {e}")

    return Response({'success': True})