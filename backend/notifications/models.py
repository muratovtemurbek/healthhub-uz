# notifications/models.py

from django.db import models
from django.conf import settings
import uuid


class Notification(models.Model):
    """Bildirishnomalar"""

    TYPE_CHOICES = [
        ('appointment_reminder', 'Navbat eslatmasi'),
        ('appointment_confirmed', 'Navbat tasdiqlandi'),
        ('appointment_cancelled', 'Navbat bekor qilindi'),
        ('appointment_completed', 'Qabul yakunlandi'),
        ('new_message', 'Yangi xabar'),
        ('system', 'Tizim xabari'),
        ('promotion', 'Aksiya'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')

    type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='system')
    title = models.CharField(max_length=200)
    message = models.TextField()

    # Bog'liq ma'lumotlar
    appointment_id = models.UUIDField(null=True, blank=True)
    doctor_id = models.UUIDField(null=True, blank=True)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Bildirishnoma'
        verbose_name_plural = 'Bildirishnomalar'

    def __str__(self):
        return f"{self.user.email} - {self.title}"