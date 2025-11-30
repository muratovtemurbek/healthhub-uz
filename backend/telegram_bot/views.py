# telegram_bot/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import TelegramVerification, TelegramNotification
import requests

TELEGRAM_BOT_TOKEN = getattr(settings, 'TELEGRAM_BOT_TOKEN', '')
TELEGRAM_BOT_USERNAME = getattr(settings, 'TELEGRAM_BOT_USERNAME', 'healthhub_uz_bot')
CODE_EXPIRY_SECONDS = 70


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_code(request):
    """5 xonali tasdiqlash kodi yaratish"""
    user_id = request.data.get('user_id')

    if not user_id:
        return Response({'error': 'user_id kerak'}, status=400)

    from accounts.models import User
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Foydalanuvchi topilmadi'}, status=404)

    # Mavjud yoki yangi verification
    verification, created = TelegramVerification.objects.get_or_create(
        user=user,
        defaults={
            'verification_code': TelegramVerification.generate_code(),
            'code_expires_at': timezone.now() + timedelta(seconds=CODE_EXPIRY_SECONDS)
        }
    )

    # Agar allaqachon tasdiqlangan bo'lsa
    if verification.is_verified:
        return Response({
            'success': True,
            'is_verified': True,
            'message': 'Hisob allaqachon tasdiqlangan'
        })

    # Yangi kod generatsiya (yoki muddati o'tgan bo'lsa)
    if not created:
        verification.refresh_code()

    # Telegram bot link
    bot_link = f"https://t.me/{TELEGRAM_BOT_USERNAME}"

    return Response({
        'success': True,
        'code': verification.verification_code,
        'expires_in': CODE_EXPIRY_SECONDS,
        'expires_at': verification.code_expires_at.isoformat(),
        'remaining_seconds': verification.get_remaining_seconds(),
        'bot_link': bot_link,
        'bot_username': TELEGRAM_BOT_USERNAME,
        'is_verified': False,
        'message': f'Kodni Telegram botga yuboring. Kod {CODE_EXPIRY_SECONDS} soniyada amal qiladi.'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_code(request):
    """Kodni qayta yuborish"""
    user_id = request.data.get('user_id')

    if not user_id:
        return Response({'error': 'user_id kerak'}, status=400)

    try:
        verification = TelegramVerification.objects.get(user_id=user_id)

        if verification.is_verified:
            return Response({
                'success': True,
                'is_verified': True,
                'message': 'Hisob allaqachon tasdiqlangan'
            })

        # Yangi kod
        new_code = verification.refresh_code()

        return Response({
            'success': True,
            'code': new_code,
            'expires_in': CODE_EXPIRY_SECONDS,
            'remaining_seconds': CODE_EXPIRY_SECONDS,
            'message': 'Yangi kod yuborildi'
        })

    except TelegramVerification.DoesNotExist:
        return Response({'error': 'Avval kod oling'}, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_verification(request):
    """Tasdiqlash holatini tekshirish"""
    user_id = request.query_params.get('user_id')

    if not user_id:
        return Response({'error': 'user_id kerak'}, status=400)

    try:
        verification = TelegramVerification.objects.get(user_id=user_id)

        return Response({
            'is_verified': verification.is_verified,
            'telegram_username': verification.telegram_username,
            'verified_at': verification.verified_at,
            'code_valid': verification.is_code_valid() if not verification.is_verified else None,
            'remaining_seconds': verification.get_remaining_seconds() if not verification.is_verified else None
        })
    except TelegramVerification.DoesNotExist:
        return Response({'is_verified': False})


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_code(request):
    """Kodni tekshirish va tasdiqlash"""
    user_id = request.data.get('user_id')
    code = request.data.get('code')

    if not user_id or not code:
        return Response({'success': False, 'error': 'user_id va code kerak'}, status=400)

    try:
        verification = TelegramVerification.objects.get(user_id=user_id)

        # Allaqachon tasdiqlangan
        if verification.is_verified:
            return Response({'success': True, 'message': 'Allaqachon tasdiqlangan'})

        # Kod tekshirish
        if verification.verification_code != code:
            verification.attempts += 1
            verification.last_attempt_at = timezone.now()
            verification.save()

            remaining = 5 - verification.attempts
            if remaining <= 0:
                return Response({'success': False, 'error': 'Juda ko\'p urinish. Yangi kod oling.'})
            return Response({'success': False, 'error': f'Kod noto\'g\'ri. Qolgan urinish: {remaining}'})

        # Muddati tekshirish
        if not verification.is_code_valid():
            return Response(
                {'success': False, 'error': 'Kod muddati tugagan. Telegram botdan /start bosib yangi kod oling.'})

        # TASDIQLASH
        verification.is_verified = True
        verification.verified_at = timezone.now()
        verification.save()

        # User ni ham verified qilish
        from accounts.models import User
        user = User.objects.get(id=user_id)
        user.is_verified = True
        user.save()

        return Response({
            'success': True,
            'message': 'Tasdiqlandi!'
        })

    except TelegramVerification.DoesNotExist:
        return Response({'success': False, 'error': 'Avval Telegram botdan /start bosib kod oling'}, status=404)


@api_view(['POST'])
@permission_classes([AllowAny])
def telegram_webhook(request):
    """Telegram webhook - botdan kelgan xabarlar"""
    data = request.data

    if 'message' not in data:
        return Response({'ok': True})

    message = data['message']
    chat_id = message['chat']['id']
    text = message.get('text', '').strip()
    user_data = message.get('from', {})
    telegram_username = user_data.get('username', '')
    first_name = user_data.get('first_name', '')

    # /start command
    if text == '/start':
        send_telegram_message(
            chat_id,
            f"👋 Salom, {first_name}!\n\n"
            f"🏥 <b>HealthHub UZ</b> botiga xush kelibsiz!\n\n"
            f"📱 Hisobingizni tasdiqlash uchun saytdan olgan <b>5 xonali kodni</b> yuboring.\n\n"
            f"⏱ Kod 70 soniya amal qiladi.\n\n"
            f"Masalan: <code>12345</code>"
        )
        return Response({'ok': True})

    # /help command
    elif text == '/help':
        send_telegram_message(
            chat_id,
            "🆘 <b>Yordam</b>\n\n"
            "1️⃣ Saytda ro'yxatdan o'ting\n"
            "2️⃣ 5 xonali kodni oling\n"
            "3️⃣ Kodni shu botga yuboring\n"
            "4️⃣ Hisob tasdiqlanadi ✅\n\n"
            "📞 Qo'llab-quvvatlash: +998 90 123 45 67"
        )
        return Response({'ok': True})

    # /status command
    elif text == '/status':
        try:
            verification = TelegramVerification.objects.get(telegram_id=chat_id)
            if verification.is_verified:
                send_telegram_message(
                    chat_id,
                    f"✅ <b>Hisobingiz tasdiqlangan!</b>\n\n"
                    f"📧 Email: {verification.user.email}\n"
                    f"📅 Sana: {verification.verified_at.strftime('%d.%m.%Y %H:%M')}"
                )
            else:
                send_telegram_message(chat_id, "❌ Hisobingiz hali tasdiqlanmagan.\n\n5 xonali kodni yuboring.")
        except TelegramVerification.DoesNotExist:
            send_telegram_message(chat_id, "❌ Siz hali ro'yxatdan o'tmagansiz.\n\nhealthhub.uz saytiga kiring.")
        return Response({'ok': True})

    # 5 xonali kod tekshirish
    elif text.isdigit() and len(text) == 5:
        code = text

        try:
            verification = TelegramVerification.objects.get(
                verification_code=code,
                is_verified=False
            )

            # Kod muddati tekshirish
            if not verification.is_code_valid():
                send_telegram_message(
                    chat_id,
                    "⏰ <b>Kod muddati tugagan!</b>\n\n"
                    "Saytga qaytib yangi kod oling."
                )
                return Response({'ok': True})

            # Urinishlar tekshirish (max 5)
            if verification.attempts >= 5:
                send_telegram_message(
                    chat_id,
                    "🚫 <b>Juda ko'p urinish!</b>\n\n"
                    "Saytga qaytib yangi kod oling."
                )
                return Response({'ok': True})

            # TASDIQLASH
            verification.telegram_id = chat_id
            verification.telegram_username = telegram_username
            verification.is_verified = True
            verification.verified_at = timezone.now()
            verification.save()

            # User ni ham verified qilish
            user = verification.user
            user.is_verified = True
            user.save()

            send_telegram_message(
                chat_id,
                f"✅ <b>Tasdiqlandi!</b>\n\n"
                f"Salom, {first_name}! Hisobingiz muvaffaqiyatli tasdiqlandi.\n\n"
                f"📧 Email: {user.email}\n"
                f"👤 Ism: {user.first_name} {user.last_name}\n\n"
                f"✨ Endi saytga qaytib tizimdan foydalanishingiz mumkin.\n\n"
                f"🏥 HealthHub UZ - Sog'lom hayot!"
            )

        except TelegramVerification.DoesNotExist:
            existing = TelegramVerification.objects.filter(
                is_verified=False,
                code_expires_at__gt=timezone.now()
            ).first()

            if existing:
                existing.attempts += 1
                existing.last_attempt_at = timezone.now()
                existing.save()

                remaining = 5 - existing.attempts
                send_telegram_message(
                    chat_id,
                    f"❌ <b>Noto'g'ri kod!</b>\n\n"
                    f"Qaytadan urinib ko'ring.\n"
                    f"Qolgan urinishlar: {remaining}"
                )
            else:
                send_telegram_message(
                    chat_id,
                    "❌ <b>Noto'g'ri kod!</b>\n\n"
                    "Saytdan yangi kod oling."
                )

        return Response({'ok': True})

    # Boshqa xabarlar
    else:
        send_telegram_message(
            chat_id,
            "🤔 Tushunmadim.\n\n"
            "📱 Hisobni tasdiqlash uchun <b>5 xonali kodni</b> yuboring.\n\n"
            "/help - Yordam"
        )

    return Response({'ok': True})


def send_telegram_message(chat_id, text, parse_mode='HTML'):
    """Telegram xabar yuborish"""
    if not TELEGRAM_BOT_TOKEN:
        print("TELEGRAM_BOT_TOKEN sozlanmagan!")
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': parse_mode
    }

    try:
        response = requests.post(url, json=data, timeout=10)
        return response.json().get('ok', False)
    except Exception as e:
        print(f"Telegram xato: {e}")
        return False


@api_view(['POST'])
@permission_classes([AllowAny])
def send_notification(request):
    """Foydalanuvchiga Telegram xabar yuborish"""
    user_id = request.data.get('user_id')
    message = request.data.get('message')

    if not user_id or not message:
        return Response({'error': 'user_id va message kerak'}, status=400)

    try:
        verification = TelegramVerification.objects.get(
            user_id=user_id,
            is_verified=True
        )

        success = send_telegram_message(verification.telegram_id, message)

        TelegramNotification.objects.create(
            user_id=user_id,
            message=message,
            is_sent=success,
            sent_at=timezone.now() if success else None
        )

        return Response({
            'success': success,
            'message': 'Xabar yuborildi' if success else 'Xabar yuborilmadi'
        })

    except TelegramVerification.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Foydalanuvchi Telegram tasdiqlanmagan'
        }, status=400)