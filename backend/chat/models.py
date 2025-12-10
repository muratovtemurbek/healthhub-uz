# chat/models.py
from django.db import models
from django.conf import settings
import uuid


class ChatRoom(models.Model):
    """Chat xonasi - Bemor va Shifokor o'rtasida"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_chat_rooms'
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_chat_rooms'
    )

    # Appointment bilan bog'lash (ixtiyoriy)
    appointment = models.ForeignKey(
        'appointments.Appointment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_rooms'
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Oxirgi xabar (tez ko'rish uchun)
    last_message = models.TextField(blank=True)
    last_message_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-updated_at']
        unique_together = ['patient', 'doctor']
        verbose_name = 'Chat xonasi'
        verbose_name_plural = 'Chat xonalari'

    def __str__(self):
        return f"Chat: {self.patient} - {self.doctor}"

    @property
    def patient_name(self):
        return f"{self.patient.first_name} {self.patient.last_name}"

    @property
    def doctor_name(self):
        return f"{self.doctor.first_name} {self.doctor.last_name}"


class Message(models.Model):
    """Chat xabarlari"""
    MESSAGE_TYPES = [
        ('text', 'Matn'),
        ('image', 'Rasm'),
        ('file', 'Fayl'),
        ('voice', 'Ovozli xabar'),
        ('system', 'Tizim xabari'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )

    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    content = models.TextField()

    # Fayl/rasm uchun
    file = models.FileField(upload_to='chat_files/', blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True)

    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    # Reply (javob berish uchun)
    reply_to = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='replies'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Xabar'
        verbose_name_plural = 'Xabarlar'

    def __str__(self):
        return f"{self.sender}: {self.content[:50]}"

    @property
    def sender_name(self):
        return f"{self.sender.first_name} {self.sender.last_name}"


class ChatNotification(models.Model):
    """Chat bildirishnomalari"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_notifications'
    )
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    unread_count = models.PositiveIntegerField(default=0)
    last_notified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['user', 'room']


class VideoCall(models.Model):
    """Video qo'ng'iroq"""
    CALL_STATUS = [
        ('pending', 'Kutilmoqda'),
        ('ringing', 'Jiringlamoqda'),
        ('active', 'Faol'),
        ('ended', 'Tugadi'),
        ('missed', 'Javobsiz'),
        ('declined', 'Rad etildi'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name='video_calls'
    )
    caller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='outgoing_calls'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='incoming_calls'
    )

    status = models.CharField(max_length=20, choices=CALL_STATUS, default='pending')

    # Call timing
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration = models.PositiveIntegerField(default=0)  # sekund

    # WebRTC signaling
    caller_offer = models.TextField(blank=True)  # SDP offer
    receiver_answer = models.TextField(blank=True)  # SDP answer
    ice_candidates = models.JSONField(default=list)

    # Call info
    is_video = models.BooleanField(default=True)  # False = audio only
    call_quality = models.CharField(max_length=20, blank=True)  # HD, SD, etc

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Video qo\'ng\'iroq'
        verbose_name_plural = 'Video qo\'ng\'iroqlar'

    def __str__(self):
        return f"Call: {self.caller} -> {self.receiver} ({self.status})"

    @property
    def duration_formatted(self):
        """Davomiylikni formatlash (00:00:00)"""
        hours = self.duration // 3600
        minutes = (self.duration % 3600) // 60
        seconds = self.duration % 60
        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        return f"{minutes:02d}:{seconds:02d}"