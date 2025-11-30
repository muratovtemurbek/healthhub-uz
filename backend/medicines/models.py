# medicines/models.py
import uuid
from django.db import models


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
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # Asosiy narx
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
    quantity = models.IntegerField(default=0, blank=True)  # Qancha bor
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