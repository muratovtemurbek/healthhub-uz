# medicines/tasks.py
import logging
from celery import shared_task
from django.utils import timezone
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


@shared_task(name='medicines.tasks.send_medicine_reminders')
def send_medicine_reminders():
    """
    Dori ichish eslatmalarini yuborish.
    Har 30 daqiqada ishga tushadi.
    """
    from .models import MedicineReminder
    from notifications.models import Notification

    now = timezone.now()
    current_time = now.strftime('%H:%M')

    # Faol eslatmalar
    active_reminders = MedicineReminder.objects.filter(
        status='active',
        start_date__lte=now.date(),
    ).select_related('user')

    # End date tekshirish
    active_reminders = active_reminders.filter(
        models.Q(end_date__isnull=True) | models.Q(end_date__gte=now.date())
    )

    reminders_sent = 0

    for reminder in active_reminders:
        # Vaqtlarni tekshirish
        times = reminder.times or []
        for scheduled_time in times:
            # Vaqt formatini tekshirish
            try:
                scheduled = datetime.strptime(scheduled_time, '%H:%M').time()
                current = datetime.strptime(current_time, '%H:%M').time()

                # 15 daqiqa oraliqda bo'lsa eslatma yuborish
                scheduled_minutes = scheduled.hour * 60 + scheduled.minute
                current_minutes = current.hour * 60 + current.minute

                if abs(scheduled_minutes - current_minutes) <= 15:
                    # Notification yaratish
                    Notification.objects.create(
                        user=reminder.user,
                        notification_type='medicine_reminder',
                        title='Dori eslatmasi',
                        message=f"{reminder.medicine_name} - {reminder.dosage} ichish vaqti keldi.",
                        data={
                            'reminder_id': reminder.id,
                            'medicine_name': reminder.medicine_name,
                            'dosage': reminder.dosage,
                            'time': scheduled_time,
                        }
                    )
                    reminders_sent += 1
                    logger.info(f"Medicine reminder sent to {reminder.user.email}")

            except (ValueError, TypeError) as e:
                logger.error(f"Invalid time format in reminder {reminder.id}: {e}")
                continue

    logger.info(f"Total medicine reminders sent: {reminders_sent}")
    return f"Sent {reminders_sent} medicine reminders"
