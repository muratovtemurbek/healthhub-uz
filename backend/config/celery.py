# config/celery.py
import os
from celery import Celery
from celery.schedules import crontab

# Django settings moduli
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('healthhub')

# Django settings dan config olish
app.config_from_object('django.conf:settings', namespace='CELERY')

# Tasks modullarini avtomatik topish
app.autodiscover_tasks()

# Beat schedule - har kuni soat 8:00 da eslatmalar yuboriladi
app.conf.beat_schedule = {
    'send-appointment-reminders-morning': {
        'task': 'appointments.tasks.send_appointment_reminders',
        'schedule': crontab(hour=8, minute=0),
        'args': (24,),  # 24 soat oldin eslatish
    },
    'send-appointment-reminders-evening': {
        'task': 'appointments.tasks.send_appointment_reminders',
        'schedule': crontab(hour=18, minute=0),
        'args': (12,),  # 12 soat oldin eslatish
    },
    'send-medicine-reminders': {
        'task': 'medicines.tasks.send_medicine_reminders',
        'schedule': crontab(minute='*/30'),  # Har 30 daqiqada
    },
}

app.conf.timezone = 'Asia/Tashkent'


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
