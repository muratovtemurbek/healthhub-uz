# medicines/models.py
import uuid
from django.db import models
from django.conf import settings


class Category(models.Model):
    """Dori kategoriyalari"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=10, blank=True, default='💊')

    class Meta:
        verbose_name = 'Kategoriya'
        verbose_name_plural = 'Kategoriyalar'

    def __str__(self):
        return self.name


class Pharmacy(models.Model):
    """Dorixonalar"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default='')
    website = models.URLField(blank=True, default='')
    is_24_7 = models.BooleanField(default=False)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Dorixona'
        verbose_name_plural = 'Dorixonalar'

    def __str__(self):
        return self.name


class Medicine(models.Model):
    """Dorilar"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, blank=True, default='')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='medicines')
    manufacturer = models.CharField(max_length=200, blank=True, default='')
    description = models.TextField(blank=True, default='')
    dosage = models.CharField(max_length=100, blank=True, default='')
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    requires_prescription = models.BooleanField(default=False)
    in_stock = models.BooleanField(default=True)
    image = models.ImageField(upload_to='medicines/', null=True, blank=True)
    side_effects = models.TextField(blank=True, default='')
    instructions = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Dori'
        verbose_name_plural = 'Dorilar'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def min_price(self):
        """Eng arzon narx"""
        prices = self.pharmacy_prices.filter(in_stock=True)
        if prices.exists():
            return prices.order_by('price').first().price
        return self.price

    @property
    def max_price(self):
        """Eng qimmat narx"""
        prices = self.pharmacy_prices.filter(in_stock=True)
        if prices.exists():
            return prices.order_by('-price').first().price
        return self.price

    @property
    def price_range(self):
        """Narx diapazoni"""
        return {
            'min': self.min_price,
            'max': self.max_price,
            'avg': self.price
        }


class PharmacyPrice(models.Model):
    """Dorixonalardagi dori narxlari"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='pharmacy_prices')
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='medicine_prices')
    price = models.DecimalField(max_digits=12, decimal_places=2)
    in_stock = models.BooleanField(default=True)
    quantity = models.IntegerField(default=0, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Dorixona narxi'
        verbose_name_plural = 'Dorixona narxlari'
        unique_together = ['medicine', 'pharmacy']
        ordering = ['price']

    def __str__(self):
        return f"{self.medicine.name} - {self.pharmacy.name}: {self.price} so'm"

    @property
    def is_cheapest(self):
        """Bu eng arzon narxmi?"""
        min_price = PharmacyPrice.objects.filter(
            medicine=self.medicine,
            in_stock=True
        ).order_by('price').first()
        return min_price and min_price.id == self.id


class MedicineReminder(models.Model):
    """Dori eslatmalari"""
    FREQUENCY_CHOICES = [
        ('once', 'Bir marotaba'),
        ('daily', 'Har kuni'),
        ('twice_daily', 'Kuniga 2 marta'),
        ('three_times', 'Kuniga 3 marta'),
        ('weekly', 'Haftada bir'),
        ('custom', 'Maxsus'),
    ]

    STATUS_CHOICES = [
        ('active', 'Faol'),
        ('paused', 'To\'xtatilgan'),
        ('completed', 'Yakunlangan'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='medicine_reminders'
    )
    medicine_name = models.CharField(max_length=200, verbose_name="Dori nomi")
    dosage = models.CharField(max_length=100, verbose_name="Dozasi")
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='daily')
    times = models.JSONField(default=list, verbose_name="Vaqtlar")
    start_date = models.DateField(verbose_name="Boshlanish sanasi")
    end_date = models.DateField(null=True, blank=True, verbose_name="Tugash sanasi")
    notes = models.TextField(blank=True, verbose_name="Izohlar")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    with_food = models.BooleanField(default=False, verbose_name="Ovqat bilan")
    before_food = models.BooleanField(default=False, verbose_name="Ovqatdan oldin")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Dori eslatmasi"
        verbose_name_plural = "Dori eslatmalari"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.medicine_name}"


class ReminderLog(models.Model):
    """Eslatma tarixi - qachon ichilgan"""
    STATUS_CHOICES = [
        ('taken', 'Ichildi'),
        ('skipped', 'O\'tkazib yuborildi'),
        ('snoozed', 'Keyinga qoldirildi'),
    ]

    reminder = models.ForeignKey(
        MedicineReminder,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    scheduled_time = models.DateTimeField(verbose_name="Rejalashtirilgan vaqt")
    actual_time = models.DateTimeField(null=True, blank=True, verbose_name="Haqiqiy vaqt")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='taken')
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Eslatma tarixi"
        verbose_name_plural = "Eslatma tarixi"
        ordering = ['-scheduled_time']


class MedicalDocument(models.Model):
    """Tibbiy hujjatlar"""
    DOCUMENT_TYPES = [
        ('analysis', 'Tahlil natijasi'),
        ('prescription', 'Retsept'),
        ('xray', 'Rentgen'),
        ('mri', 'MRT'),
        ('ultrasound', 'UZI'),
        ('certificate', 'Spravka'),
        ('other', 'Boshqa'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='medical_documents'
    )
    title = models.CharField(max_length=200, verbose_name="Sarlavha")
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES, default='other')
    file = models.FileField(upload_to='medical_documents/%Y/%m/', verbose_name="Fayl")
    description = models.TextField(blank=True, verbose_name="Tavsif")
    doctor_name = models.CharField(max_length=200, blank=True, verbose_name="Shifokor")
    hospital_name = models.CharField(max_length=200, blank=True, verbose_name="Shifoxona")
    document_date = models.DateField(null=True, blank=True, verbose_name="Hujjat sanasi")

    file_size = models.PositiveIntegerField(default=0)
    file_type = models.CharField(max_length=50, blank=True)

    is_important = models.BooleanField(default=False, verbose_name="Muhim")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Tibbiy hujjat"
        verbose_name_plural = "Tibbiy hujjatlar"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
            self.file_type = self.file.name.split('.')[-1].lower()
        super().save(*args, **kwargs)


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

    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)

    working_hours = models.JSONField(default=dict, blank=True)
    is_24_hours = models.BooleanField(default=False, verbose_name="24 soat")

    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    reviews_count = models.PositiveIntegerField(default=0)

    services = models.JSONField(default=list, blank=True)
    specializations = models.JSONField(default=list, blank=True)

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


class HospitalReview(models.Model):
    """Kasalxona sharhlari"""
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hospital_reviews'  # MUHIM: related_name qo'shildi!
    )
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Sharh"
        verbose_name_plural = "Sharhlar"
        unique_together = ['hospital', 'user']