#!/usr/bin/env python
"""Telegram webhook o'rnatish skripti"""
import os
import sys
import requests

# Django setup
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.conf import settings

BOT_TOKEN = settings.TELEGRAM_BOT_TOKEN
WEBHOOK_URL = os.getenv('RAILWAY_PUBLIC_DOMAIN', 'healthhub-uz-production.up.railway.app')

if not BOT_TOKEN:
    print("TELEGRAM_BOT_TOKEN sozlanmagan!")
    sys.exit(1)

# Webhook URL
webhook_url = f"https://{WEBHOOK_URL}/api/telegram/webhook/"

print(f"Webhook URL: {webhook_url}")

# Telegram API ga webhook o'rnatish
url = f"https://api.telegram.org/bot{BOT_TOKEN}/setWebhook"
data = {
    'url': webhook_url,
    'allowed_updates': ['message']
}

response = requests.post(url, json=data)
result = response.json()

if result.get('ok'):
    print("Webhook muvaffaqiyatli o'rnatildi!")
    print(f"Result: {result}")
else:
    print(f"Xatolik: {result}")

# Webhook info
info_url = f"https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo"
info_response = requests.get(info_url)
print(f"\nWebhook info: {info_response.json()}")
