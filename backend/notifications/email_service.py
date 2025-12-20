# notifications/email_service.py
import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from celery import shared_task

logger = logging.getLogger(__name__)


class EmailService:
    """Email yuborish xizmati"""

    @staticmethod
    def send_email(to_email, subject, template_name, context, from_email=None):
        """
        HTML email yuborish

        Args:
            to_email: Qabul qiluvchi email
            subject: Mavzu
            template_name: Template nomi (emails/ papkasida)
            context: Template uchun ma'lumotlar
            from_email: Yuboruvchi (default: settings.DEFAULT_FROM_EMAIL)
        """
        try:
            from_email = from_email or settings.DEFAULT_FROM_EMAIL

            # HTML va text versiyalari
            html_content = render_to_string(f'emails/{template_name}.html', context)
            text_content = render_to_string(f'emails/{template_name}.txt', context)

            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=[to_email]
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send()

            logger.info(f"Email sent to {to_email}: {subject}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    @staticmethod
    def send_simple_email(to_email, subject, message, from_email=None):
        """Oddiy text email yuborish"""
        try:
            from_email = from_email or settings.DEFAULT_FROM_EMAIL
            send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=[to_email],
                fail_silently=False,
            )
            logger.info(f"Simple email sent to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send simple email to {to_email}: {e}")
            return False


# ==================== CELERY TASKS ====================

@shared_task(name='notifications.email.send_appointment_reminder')
def send_appointment_reminder_email(appointment_id):
    """Qabul eslatmasi emaili"""
    from appointments.models import Appointment

    try:
        appointment = Appointment.objects.select_related(
            'patient', 'doctor__user'
        ).get(id=appointment_id)

        if not appointment.patient or not appointment.patient.email:
            return "No patient email"

        doctor_name = f"Dr. {appointment.doctor.user.get_full_name()}" if appointment.doctor else "Shifokor"

        context = {
            'patient_name': appointment.patient.get_full_name() or appointment.patient.email,
            'doctor_name': doctor_name,
            'date': appointment.date.strftime('%d.%m.%Y'),
            'time': appointment.time.strftime('%H:%M'),
            'reason': appointment.reason or 'Konsultatsiya',
            'frontend_url': settings.FRONTEND_URL,
            'appointment_id': str(appointment.id),
        }

        EmailService.send_email(
            to_email=appointment.patient.email,
            subject=f"Eslatma: Qabulingiz {context['date']} kuni",
            template_name='appointment_reminder',
            context=context
        )

        return f"Reminder sent to {appointment.patient.email}"

    except Appointment.DoesNotExist:
        logger.error(f"Appointment {appointment_id} not found")
        return f"Appointment not found"
    except Exception as e:
        logger.error(f"Error sending reminder email: {e}")
        return f"Error: {e}"


@shared_task(name='notifications.email.send_appointment_confirmed')
def send_appointment_confirmed_email(appointment_id):
    """Qabul tasdiqlandi emaili"""
    from appointments.models import Appointment

    try:
        appointment = Appointment.objects.select_related(
            'patient', 'doctor__user', 'doctor__hospital'
        ).get(id=appointment_id)

        if not appointment.patient or not appointment.patient.email:
            return "No patient email"

        doctor_name = f"Dr. {appointment.doctor.user.get_full_name()}" if appointment.doctor else "Shifokor"
        hospital_name = appointment.doctor.hospital.name if appointment.doctor and appointment.doctor.hospital else ""
        hospital_address = appointment.doctor.hospital.address if appointment.doctor and appointment.doctor.hospital else ""

        context = {
            'patient_name': appointment.patient.get_full_name() or appointment.patient.email,
            'doctor_name': doctor_name,
            'date': appointment.date.strftime('%d.%m.%Y'),
            'time': appointment.time.strftime('%H:%M'),
            'hospital_name': hospital_name,
            'hospital_address': hospital_address,
            'frontend_url': settings.FRONTEND_URL,
        }

        EmailService.send_email(
            to_email=appointment.patient.email,
            subject=f"Qabulingiz tasdiqlandi - {context['date']}",
            template_name='appointment_confirmed',
            context=context
        )

        return f"Confirmation sent to {appointment.patient.email}"

    except Exception as e:
        logger.error(f"Error sending confirmation email: {e}")
        return f"Error: {e}"


@shared_task(name='notifications.email.send_appointment_cancelled')
def send_appointment_cancelled_email(appointment_id, reason=""):
    """Qabul bekor qilindi emaili"""
    from appointments.models import Appointment

    try:
        appointment = Appointment.objects.select_related(
            'patient', 'doctor__user'
        ).get(id=appointment_id)

        if not appointment.patient or not appointment.patient.email:
            return "No patient email"

        doctor_name = f"Dr. {appointment.doctor.user.get_full_name()}" if appointment.doctor else "Shifokor"

        context = {
            'patient_name': appointment.patient.get_full_name() or appointment.patient.email,
            'doctor_name': doctor_name,
            'date': appointment.date.strftime('%d.%m.%Y'),
            'time': appointment.time.strftime('%H:%M'),
            'reason': reason or 'Sabab ko\'rsatilmagan',
            'frontend_url': settings.FRONTEND_URL,
        }

        EmailService.send_email(
            to_email=appointment.patient.email,
            subject=f"Qabulingiz bekor qilindi - {context['date']}",
            template_name='appointment_cancelled',
            context=context
        )

        return f"Cancellation sent to {appointment.patient.email}"

    except Exception as e:
        logger.error(f"Error sending cancellation email: {e}")
        return f"Error: {e}"


@shared_task(name='notifications.email.send_welcome_email')
def send_welcome_email(user_id):
    """Yangi foydalanuvchi uchun xush kelibsiz emaili"""
    from accounts.models import User

    try:
        user = User.objects.get(id=user_id)

        context = {
            'user_name': user.get_full_name() or user.email,
            'frontend_url': settings.FRONTEND_URL,
        }

        EmailService.send_email(
            to_email=user.email,
            subject="HealthHub UZ ga xush kelibsiz!",
            template_name='welcome',
            context=context
        )

        return f"Welcome email sent to {user.email}"

    except Exception as e:
        logger.error(f"Error sending welcome email: {e}")
        return f"Error: {e}"


@shared_task(name='notifications.email.send_password_reset')
def send_password_reset_email(user_id, reset_token):
    """Parol tiklash emaili"""
    from accounts.models import User

    try:
        user = User.objects.get(id=user_id)

        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

        context = {
            'user_name': user.get_full_name() or user.email,
            'reset_url': reset_url,
            'frontend_url': settings.FRONTEND_URL,
        }

        EmailService.send_email(
            to_email=user.email,
            subject="Parolni tiklash - HealthHub UZ",
            template_name='password_reset',
            context=context
        )

        return f"Password reset email sent to {user.email}"

    except Exception as e:
        logger.error(f"Error sending password reset email: {e}")
        return f"Error: {e}"


@shared_task(name='notifications.email.send_prescription_ready')
def send_prescription_ready_email(prescription_id):
    """Retsept tayyor emaili"""
    from appointments.models import Prescription

    try:
        prescription = Prescription.objects.select_related(
            'patient', 'doctor'
        ).get(id=prescription_id)

        if not prescription.patient or not prescription.patient.email:
            return "No patient email"

        context = {
            'patient_name': prescription.patient.get_full_name() or prescription.patient.email,
            'doctor_name': prescription.doctor.get_full_name() if prescription.doctor else "Shifokor",
            'diagnosis': prescription.diagnosis,
            'medications': prescription.medications,
            'frontend_url': settings.FRONTEND_URL,
        }

        EmailService.send_email(
            to_email=prescription.patient.email,
            subject="Yangi retsept tayyor - HealthHub UZ",
            template_name='prescription_ready',
            context=context
        )

        return f"Prescription email sent to {prescription.patient.email}"

    except Exception as e:
        logger.error(f"Error sending prescription email: {e}")
        return f"Error: {e}"
