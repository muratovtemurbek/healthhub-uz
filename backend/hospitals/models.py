# hospitals/models.py
from django.db import models
from django.conf import settings


class Hospital(models.Model):
    """Kasalxonalar/Klinikalar"""
    TYPE_CHOICES = [
        ('hospital', 'Kasalxona'),
        ('clinic', 'Klinika'),
        ('pharmacy', 'Dorixona'),
        ('laboratory', 'Laboratoriya'),
        ('dental', 'Stomatologiya'),
    ]

    name = models.CharField(max_length=200, verbose_name="Nomi")
    name_en = models.CharField(max_length=200, blank=True)
    hospital_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='hospital')
    address = models.TextField(verbose_name="Manzil")
    city = models.CharField(max_length=100, default='Toshkent')

    # Koordinatalar
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)

    # Ish vaqti
    working_hours = models.JSONField(default=dict, blank=True)
    is_24_hours = models.BooleanField(default=False, verbose_name="24 soat")

    # Reyting
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    reviews_count = models.PositiveIntegerField(default=0)

    # Xizmatlar
    services = models.JSONField(default=list, blank=True)
    specializations = models.JSONField(default=list, blank=True)

    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='hospitals/', blank=True)

    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Kasalxona"
        verbose_name_plural = "Kasalxonalar"
        ordering = ['-rating', 'name']

    def __str__(self):
        return self.name

    def update_rating(self):
        """Reytingni yangilash"""
        reviews = self.reviews.all()
        if reviews.exists():
            self.rating = reviews.aggregate(models.Avg('rating'))['rating__avg']
            self.reviews_count = reviews.count()
            self.save(update_fields=['rating', 'reviews_count'])


class HospitalReview(models.Model):
    """Kasalxona sharhlari"""
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()  # 1-5
    comment = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Sharh"
        verbose_name_plural = "Sharhlar"
        unique_together = ['hospital', 'user']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.hospital.update_rating()