# appointments/tasks.py
import logging
from celery import shared_task
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


@shared_task(name='appointments.tasks.send_appointment_reminders')
def send_appointment_reminders(hours_before=24):
    """
    Kelayotgan qabullar uchun eslatma yuborish.

    Args:
        hours_before: Qancha soat oldin eslatish (default: 24 soat)
    """
    from .models import Appointment
    from notifications.models import Notification

    now = timezone.now()
    reminder_time = now + timedelta(hours=hours_before)

    # Bugun yoki ertaga bo'ladigan tasdiqlangan qabullar
    upcoming_appointments = Appointment.objects.filter(
        date=reminder_time.date(),
        status__in=['pending', 'confirmed'],
    ).select_related('patient', 'doctor__user')

    reminders_sent = 0

    for appointment in upcoming_appointments:
        if not appointment.patient:
            continue

        # Notification yaratish
        try:
            doctor_name = f"Dr. {appointment.doctor.user.get_full_name()}" if appointment.doctor else "Shifokor"
            time_str = appointment.time.strftime('%H:%M')
            date_str = appointment.date.strftime('%d.%m.%Y')

            message = f"Eslatma: Sizning {doctor_name} bilan qabulingiz {date_str} kuni soat {time_str} da."

            # Notification model orqali
            Notification.objects.create(
                user=appointment.patient,
                notification_type='appointment_reminder',
                title='Qabul eslatmasi',
                message=message,
                data={
                    'appointment_id': str(appointment.id),
                    'doctor_name': doctor_name,
                    'date': date_str,
                    'time': time_str,
                }
            )

            reminders_sent += 1
            logger.info(f"Reminder sent for appointment {appointment.id} to {appointment.patient.email}")

        except Exception as e:
            logger.error(f"Failed to send reminder for appointment {appointment.id}: {e}")

    logger.info(f"Total reminders sent: {reminders_sent}")
    return f"Sent {reminders_sent} appointment reminders"


@shared_task(name='appointments.tasks.send_single_reminder')
def send_single_reminder(appointment_id):
    """Bitta qabul uchun eslatma yuborish"""
    from .models import Appointment
    from notifications.models import Notification

    try:
        appointment = Appointment.objects.select_related(
            'patient', 'doctor__user'
        ).get(id=appointment_id)

        if not appointment.patient:
            return "No patient associated"

        doctor_name = f"Dr. {appointment.doctor.user.get_full_name()}" if appointment.doctor else "Shifokor"
        time_str = appointment.time.strftime('%H:%M')
        date_str = appointment.date.strftime('%d.%m.%Y')

        Notification.objects.create(
            user=appointment.patient,
            notification_type='appointment_reminder',
            title='Qabul eslatmasi',
            message=f"Sizning {doctor_name} bilan qabulingiz {date_str} kuni soat {time_str} da.",
            data={
                'appointment_id': str(appointment.id),
            }
        )

        return f"Reminder sent for appointment {appointment_id}"

    except Appointment.DoesNotExist:
        logger.error(f"Appointment {appointment_id} not found")
        return f"Appointment {appointment_id} not found"
    except Exception as e:
        logger.error(f"Error sending reminder: {e}")
        return f"Error: {e}"


@shared_task(name='appointments.tasks.cleanup_old_appointments')
def cleanup_old_appointments(days=90):
    """Eski bekor qilingan qabullarni o'chirish"""
    from .models import Appointment

    cutoff_date = timezone.now().date() - timedelta(days=days)

    deleted_count, _ = Appointment.objects.filter(
        date__lt=cutoff_date,
        status='cancelled'
    ).delete()

    logger.info(f"Deleted {deleted_count} old cancelled appointments")
    return f"Deleted {deleted_count} appointments"
