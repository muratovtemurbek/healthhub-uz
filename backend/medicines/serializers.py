# medicines/serializers.py
from rest_framework import serializers
from .models import Category, Pharmacy, Medicine, PharmacyPrice


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon']


class PharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = ['id', 'name', 'address', 'phone', 'email', 'website', 'is_24_7']


class PharmacyPriceSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    pharmacy_address = serializers.CharField(source='pharmacy.address', read_only=True)
    pharmacy_phone = serializers.CharField(source='pharmacy.phone', read_only=True)
    is_24_7 = serializers.BooleanField(source='pharmacy.is_24_7', read_only=True)

    class Meta:
        model = PharmacyPrice
        fields = ['id', 'pharmacy', 'pharmacy_name', 'pharmacy_address', 'pharmacy_phone',
                  'is_24_7', 'price', 'in_stock', 'updated_at']


class MedicineSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    category_id = serializers.PrimaryKeyRelatedField(source='category', read_only=True)
    pharmacy_prices = PharmacyPriceSerializer(many=True, read_only=True)
    min_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    max_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Medicine
        fields = [
            'id', 'name', 'generic_name', 'category_name', 'category_id',
            'manufacturer', 'description', 'dosage', 'price',
            'requires_prescription', 'in_stock', 'image',
            'min_price', 'max_price', 'pharmacy_prices'
        ]

    def get_category_name(self, obj):
        return obj.category.name if obj.category else 'Boshqa'


class MedicineListSerializer(serializers.ModelSerializer):
    """Ro'yxat uchun oddiy serializer"""
    category_name = serializers.SerializerMethodField()
    category_id = serializers.PrimaryKeyRelatedField(source='category', read_only=True)
    price_range = serializers.SerializerMethodField()

    class Meta:
        model = Medicine
        fields = [
            'id', 'name', 'generic_name', 'category_name', 'category_id',
            'manufacturer', 'price', 'requires_prescription', 'in_stock',
            'price_range'
        ]

    def get_category_name(self, obj):
        return obj.category.name if obj.category else 'Boshqa'

    def get_price_range(self, obj):
        prices = obj.pharmacy_prices.filter(in_stock=True)
        if prices.exists():
            min_p = prices.order_by('price').first().price
            max_p = prices.order_by('-price').first().price
            return {'min': min_p, 'max': max_p}
        return {'min': obj.price, 'max': obj.price}


class MedicineCompareSerializer(serializers.ModelSerializer):
    """Narxlarni taqqoslash uchun"""
    pharmacy_prices = serializers.SerializerMethodField()
    cheapest_pharmacy = serializers.SerializerMethodField()

    class Meta:
        model = Medicine
        fields = ['id', 'name', 'generic_name', 'price', 'pharmacy_prices', 'cheapest_pharmacy']

    def get_pharmacy_prices(self, obj):
        prices = obj.pharmacy_prices.filter(in_stock=True).order_by('price')
        return PharmacyPriceSerializer(prices, many=True).data

    def get_cheapest_pharmacy(self, obj):
        cheapest = obj.pharmacy_prices.filter(in_stock=True).order_by('price').first()
        if cheapest:
            return {
                'pharmacy_name': cheapest.pharmacy.name,
                'pharmacy_address': cheapest.pharmacy.address,
                'price': cheapest.price,
                'savings': float(obj.price) - float(cheapest.price)
            }
        return None

# ============== PRESCRIPTION ORDER SERIALIZERS ==============

class PrescriptionOrderSerializer(serializers.ModelSerializer):
    """Retsept buyurtmasi serializeri"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    delivery_type_display = serializers.CharField(source='get_delivery_type_display', read_only=True)
    pharmacy_name = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()

    class Meta:
        from .models import PrescriptionOrder
        model = PrescriptionOrder
        fields = [
            'id', 'user_name', 'prescription', 'pharmacy', 'pharmacy_name',
            'items', 'total_amount', 'delivery_type', 'delivery_type_display',
            'delivery_address', 'delivery_phone', 'status', 'status_display',
            'is_paid', 'payment_method', 'notes', 'estimated_ready_time',
            'created_at', 'delivered_at'
        ]
        read_only_fields = ['id', 'created_at', 'delivered_at']

    def get_pharmacy_name(self, obj):
        return obj.pharmacy.name if obj.pharmacy else None

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email


class PrescriptionOrderCreateSerializer(serializers.ModelSerializer):
    """Retsept buyurtmasi yaratish"""

    class Meta:
        from .models import PrescriptionOrder
        model = PrescriptionOrder
        fields = [
            'prescription', 'pharmacy', 'items', 'total_amount',
            'delivery_type', 'delivery_address', 'delivery_phone', 'notes'
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)
