# ai_service/models.py
from django.db import models
from accounts.models import User
import uuid


class AIConsultation(models.Model):
    """AI chatbot konsultatsiyalari"""
    URGENCY_LEVELS = [
        (1, 'Juda past'),
        (2, 'Past'),
        (3, 'O\'rtacha'),
        (4, 'O\'rtachadan yuqori'),
        (5, 'Yuqori'),
        (6, 'Juda yuqori'),
        (7, 'Shoshilinch'),
        (8, 'Juda shoshilinch'),
        (9, 'Kritik'),
        (10, 'Hayotiy xavf'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_consultations')
    symptoms = models.TextField()
    age = models.IntegerField()
    gender = models.CharField(max_length=10)
    medical_history = models.JSONField(default=list)

    # AI Analysis results
    ai_analysis = models.JSONField()  # Full AI response
    possible_conditions = models.JSONField(default=list)
    urgency_level = models.IntegerField(choices=URGENCY_LEVELS)
    recommended_specialist = models.CharField(max_length=100)
    first_aid_tips = models.JSONField(default=list)
    warnings = models.JSONField(default=list)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Konsultatsiya'
        verbose_name_plural = 'AI Konsultatsiyalar'

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.created_at.date()} (Darajasi: {self.urgency_level}/10)"