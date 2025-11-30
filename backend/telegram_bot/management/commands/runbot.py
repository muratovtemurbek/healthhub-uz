# telegram_bot/management/commands/runbot.py
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
import requests
import time

from telegram_bot.models import TelegramVerification


class Command(BaseCommand):
    help = 'Telegram botni ishga tushirish'

    def handle(self, *args, **options):
        bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '')

        if not bot_token:
            self.stdout.write(self.style.ERROR('❌ TELEGRAM_BOT_TOKEN sozlanmagan!'))
            return

        self.stdout.write(self.style.SUCCESS('🤖 Telegram bot ishga tushdi...'))

        api_url = f'https://api.telegram.org/bot{bot_token}'
        offset = 0

        while True:
            try:
                url = f'{api_url}/getUpdates?offset={offset}&timeout=30'
                response = requests.get(url, timeout=35)
                data = response.json()

                if data.get('ok') and data.get('result'):
                    for update in data['result']:
                        offset = update['update_id'] + 1
                        if 'message' in update:
                            self.process_message(update['message'], api_url)

            except Exception as e:
                self.stdout.write(self.style.WARNING(f'⚠️ Xato: {e}'))
                time.sleep(5)

    def send_message(self, api_url, chat_id, text):
        url = f'{api_url}/sendMessage'
        data = {'chat_id': chat_id, 'text': text, 'parse_mode': 'HTML'}
        try:
            requests.post(url, json=data, timeout=10)
        except:
            pass

    def process_message(self, message, api_url):
        chat_id = message['chat']['id']
        text = message.get('text', '').strip()
        user_data = message.get('from', {})
        first_name = user_data.get('first_name', '')
        telegram_username = user_data.get('username', '')

        # /start - KOD YUBORISH
        if text == '/start':
            try:
                # Eng so'nggi tasdiqlanmagan va muddati o'tmagan verification
                verification = TelegramVerification.objects.filter(
                    is_verified=False,
                    code_expires_at__gt=timezone.now()
                ).order_by('-created_at').first()

                if verification:
                    # Telegram ID saqlash
                    verification.telegram_id = chat_id
                    verification.telegram_username = telegram_username
                    verification.save()

                    remaining = verification.get_remaining_seconds()

                    self.send_message(api_url, chat_id,
                                      f"👋 Salom, {first_name}!\n\n"
                                      f"🏥 <b>HealthHub UZ</b>\n\n"
                                      f"🔐 <b>Sizning tasdiqlash kodingiz:</b>\n\n"
                                      f"<code>{verification.verification_code}</code>\n\n"
                                      f"⏱ Kod {remaining} soniya amal qiladi.\n\n"
                                      f"📱 Ushbu kodni saytdagi oynaga kiriting."
                                      )
                    self.stdout.write(self.style.SUCCESS(
                        f'📤 Kod yuborildi: {verification.verification_code} -> {first_name}'
                    ))
                else:
                    self.send_message(api_url, chat_id,
                                      f"👋 Salom, {first_name}!\n\n"
                                      f"🏥 <b>HealthHub UZ</b> botiga xush kelibsiz!\n\n"
                                      f"📱 Ro'yxatdan o'tish uchun avval saytga kiring va\n"
                                      f"formani to'ldiring.\n\n"
                                      f"🌐 Sayt: healthhub.uz"
                                      )

            except Exception as e:
                self.stdout.write(self.style.WARNING(f'⚠️ /start xato: {e}'))
                self.send_message(api_url, chat_id,
                                  f"👋 Salom, {first_name}!\n\n"
                                  f"🏥 <b>HealthHub UZ</b> botiga xush kelibsiz!\n\n"
                                  f"📱 Ro'yxatdan o'tish uchun saytga kiring."
                                  )

        # /help
        elif text == '/help':
            self.send_message(api_url, chat_id,
                              "🆘 <b>Yordam</b>\n\n"
                              "1️⃣ Saytda formani to'ldiring\n"
                              "2️⃣ 'Ro'yxatdan o'tish' tugmasini bosing\n"
                              "3️⃣ Bu botga keling va /start bosing\n"
                              "4️⃣ Kodni saytga kiriting\n"
                              "5️⃣ Tayyor! ✅"
                              )

        # /status
        elif text == '/status':
            try:
                verification = TelegramVerification.objects.get(telegram_id=chat_id)
                if verification.is_verified:
                    self.send_message(api_url, chat_id,
                                      f"✅ <b>Hisobingiz tasdiqlangan!</b>\n\n"
                                      f"📧 Email: {verification.user.email}"
                                      )
                else:
                    self.send_message(api_url, chat_id, "❌ Hali tasdiqlanmagan.\n\n/start bosib kod oling.")
            except TelegramVerification.DoesNotExist:
                self.send_message(api_url, chat_id, "❌ Siz hali ro'yxatdan o'tmagansiz.")

        # 5 xonali kod
        elif text.isdigit() and len(text) == 5:
            self.send_message(api_url, chat_id,
                              "📱 Kodni <b>saytdagi oynaga</b> kiriting, bu yerga emas.\n\n"
                              "Agar kod kerak bo'lsa /start bosing."
                              )

        # Boshqa
        else:
            self.send_message(api_url, chat_id,
                              "🤔 Tushunmadim.\n\n"
                              "📱 Kod olish uchun /start bosing.\n\n"
                              "/help - Yordam"
                              )