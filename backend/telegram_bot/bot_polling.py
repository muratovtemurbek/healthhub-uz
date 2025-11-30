# telegram_bot/bot_polling.py
import os
import sys
import django

# Django setup
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import requests
import time
from django.utils import timezone
from datetime import timedelta
from telegram_bot.models import TelegramVerification

BOT_TOKEN = '8413898003:AAEtG7KFl-yfV7ml5eDkEjJMrHj0YrJwBzw'  # O'zgartiring!
API_URL = f'https://api.telegram.org/bot{BOT_TOKEN}'


def send_message(chat_id, text):
    url = f'{API_URL}/sendMessage'
    data = {'chat_id': chat_id, 'text': text, 'parse_mode': 'HTML'}
    requests.post(url, json=data)


def process_message(message):
    chat_id = message['chat']['id']
    text = message.get('text', '').strip()
    user_data = message.get('from', {})
    first_name = user_data.get('first_name', '')
    telegram_username = user_data.get('username', '')

    if text == '/start':
        send_message(chat_id,
                     f"👋 Salom, {first_name}!\n\n"
                     f"🏥 <b>HealthHub UZ</b> botiga xush kelibsiz!\n\n"
                     f"📱 Hisobingizni tasdiqlash uchun saytdan olgan <b>5 xonali kodni</b> yuboring.\n\n"
                     f"⏱ Kod 70 soniya amal qiladi."
                     )

    elif text.isdigit() and len(text) == 5:
        try:
            verification = TelegramVerification.objects.get(
                verification_code=text,
                is_verified=False
            )

            if not verification.is_code_valid():
                send_message(chat_id, "⏰ <b>Kod muddati tugagan!</b>\n\nSaytga qaytib yangi kod oling.")
                return

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

            send_message(chat_id,
                         f"✅ <b>Tasdiqlandi!</b>\n\n"
                         f"Salom, {first_name}! Hisobingiz muvaffaqiyatli tasdiqlandi.\n\n"
                         f"📧 Email: {user.email}\n\n"
                         f"✨ Endi saytga qaytib tizimdan foydalanishingiz mumkin!"
                         )
            print(f"✅ User {user.email} tasdiqlandi!")

        except TelegramVerification.DoesNotExist:
            send_message(chat_id, "❌ <b>Noto'g'ri kod!</b>\n\nQaytadan tekshiring yoki saytdan yangi kod oling.")

    else:
        send_message(chat_id, "🤔 Tushunmadim.\n\n📱 5 xonali kodni yuboring.")


def main():
    print("🤖 Bot ishga tushdi...")
    offset = 0

    while True:
        try:
            url = f'{API_URL}/getUpdates?offset={offset}&timeout=30'
            response = requests.get(url, timeout=35)
            data = response.json()

            if data.get('ok') and data.get('result'):
                for update in data['result']:
                    offset = update['update_id'] + 1
                    if 'message' in update:
                        process_message(update['message'])

        except Exception as e:
            print(f"Xato: {e}")
            time.sleep(5)


if __name__ == '__main__':
    main()