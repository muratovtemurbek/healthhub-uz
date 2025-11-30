# medicines/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Min, Max
from .models import Category, Pharmacy, Medicine, PharmacyPrice
from .serializers import (
    CategorySerializer, PharmacySerializer, MedicineSerializer,
    MedicineListSerializer, MedicineCompareSerializer, PharmacyPriceSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """Kategoriyalar"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class PharmacyViewSet(viewsets.ModelViewSet):
    """Dorixonalar"""
    queryset = Pharmacy.objects.all()
    serializer_class = PharmacySerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get'])
    def medicines(self, request, pk=None):
        """Dorixonadagi barcha dorilar va narxlar"""
        pharmacy = self.get_object()
        prices = PharmacyPrice.objects.filter(pharmacy=pharmacy, in_stock=True).order_by('price')

        data = []
        for price in prices:
            data.append({
                'medicine_id': str(price.medicine.id),
                'medicine_name': price.medicine.name,
                'generic_name': price.medicine.generic_name,
                'category': price.medicine.category.name if price.medicine.category else 'Boshqa',
                'price': float(price.price),
                'in_stock': price.in_stock,
                'requires_prescription': price.medicine.requires_prescription
            })

        return Response({
            'pharmacy': PharmacySerializer(pharmacy).data,
            'medicines': data,
            'total': len(data)
        })


class MedicineViewSet(viewsets.ModelViewSet):
    """Dorilar"""
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'list':
            return MedicineListSerializer
        if self.action == 'compare':
            return MedicineCompareSerializer
        return MedicineSerializer

    def list(self, request, *args, **kwargs):
        """Dorilar ro'yxati"""
        queryset = self.queryset.all()

        # Filter by category
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)

        # Filter by prescription
        prescription = request.query_params.get('prescription')
        if prescription == 'true':
            queryset = queryset.filter(requires_prescription=True)
        elif prescription == 'false':
            queryset = queryset.filter(requires_prescription=False)

        # Search
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)

        # Ordering
        ordering = request.query_params.get('ordering', 'name')
        if ordering in ['name', '-name', 'price', '-price']:
            queryset = queryset.order_by(ordering)

        serializer = MedicineListSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """Dori detail - narxlar bilan"""
        medicine = self.get_object()

        # Dorixonalardagi narxlar
        prices = PharmacyPrice.objects.filter(medicine=medicine).order_by('price')
        prices_data = []
        for idx, p in enumerate(prices):
            prices_data.append({
                'pharmacy_id': str(p.pharmacy.id),
                'pharmacy_name': p.pharmacy.name,
                'pharmacy_address': p.pharmacy.address,
                'pharmacy_phone': p.pharmacy.phone,
                'is_24_7': p.pharmacy.is_24_7,
                'price': float(p.price),
                'in_stock': p.in_stock,
                'is_cheapest': idx == 0 and p.in_stock
            })

        data = MedicineSerializer(medicine).data
        data['pharmacy_prices'] = prices_data

        return Response(data)

    def create(self, request, *args, **kwargs):
        """Yangi dori qo'shish"""
        data = request.data
        try:
            category = None
            if data.get('category'):
                category = Category.objects.filter(id=data.get('category')).first()

            medicine = Medicine.objects.create(
                name=data.get('name', ''),
                generic_name=data.get('generic_name', ''),
                manufacturer=data.get('manufacturer', ''),
                category=category,
                price=data.get('price', 0),
                description=data.get('description', ''),
                requires_prescription=data.get('requires_prescription', False),
                in_stock=data.get('in_stock', True)
            )

            return Response({
                'id': str(medicine.id),
                'message': 'Dori qo\'shildi!'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def prices(self, request, pk=None):
        """Dori narxlari barcha dorixonalarda"""
        medicine = self.get_object()
        prices = PharmacyPrice.objects.filter(medicine=medicine).order_by('price')

        data = []
        for idx, price in enumerate(prices):
            data.append({
                'pharmacy_id': str(price.pharmacy.id),
                'pharmacy_name': price.pharmacy.name,
                'pharmacy_address': price.pharmacy.address,
                'pharmacy_phone': price.pharmacy.phone,
                'is_24_7': price.pharmacy.is_24_7,
                'price': float(price.price),
                'in_stock': price.in_stock,
                'is_cheapest': idx == 0 and price.in_stock
            })

        # Statistika
        in_stock_prices = [p for p in data if p['in_stock']]

        return Response({
            'medicine': {
                'id': str(medicine.id),
                'name': medicine.name,
                'generic_name': medicine.generic_name,
                'base_price': float(medicine.price)
            },
            'prices': data,
            'statistics': {
                'total_pharmacies': len(data),
                'in_stock_count': len(in_stock_prices),
                'min_price': min([p['price'] for p in in_stock_prices]) if in_stock_prices else None,
                'max_price': max([p['price'] for p in in_stock_prices]) if in_stock_prices else None,
            }
        })

    @action(detail=False, methods=['get'])
    def compare(self, request):
        """Bir nechta dorini taqqoslash"""
        medicine_ids = request.query_params.get('ids', '').split(',')
        medicine_ids = [mid.strip() for mid in medicine_ids if mid.strip()]
        medicines = Medicine.objects.filter(id__in=medicine_ids)
        serializer = MedicineCompareSerializer(medicines, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Dori qidirish"""
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])

        medicines = Medicine.objects.filter(name__icontains=query)[:20]
        serializer = MedicineListSerializer(medicines, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def cheapest(self, request):
        """Eng arzon narxli dorilar"""
        medicines = Medicine.objects.all()[:20]

        data = []
        for med in medicines:
            cheapest = med.pharmacy_prices.filter(in_stock=True).order_by('price').first()
            if cheapest:
                savings = float(med.price) - float(cheapest.price)
                data.append({
                    'medicine_id': str(med.id),
                    'medicine_name': med.name,
                    'base_price': float(med.price),
                    'cheapest_price': float(cheapest.price),
                    'pharmacy_name': cheapest.pharmacy.name,
                    'pharmacy_address': cheapest.pharmacy.address,
                    'savings': savings,
                    'savings_percent': round((savings / float(med.price)) * 100, 1) if float(med.price) > 0 else 0
                })

        # Eng ko'p tejash bo'yicha saralash
        data.sort(key=lambda x: x['savings'], reverse=True)

        return Response(data)


class PharmacyPriceViewSet(viewsets.ModelViewSet):
    """Dorixona narxlari"""
    queryset = PharmacyPrice.objects.all()
    serializer_class = PharmacyPriceSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        """Narxlar ro'yxati"""
        queryset = self.queryset.all()

        # Filter by medicine
        medicine = request.query_params.get('medicine')
        if medicine:
            queryset = queryset.filter(medicine_id=medicine)

        # Filter by pharmacy
        pharmacy = request.query_params.get('pharmacy')
        if pharmacy:
            queryset = queryset.filter(pharmacy_id=pharmacy)

        # Only in stock
        in_stock = request.query_params.get('in_stock')
        if in_stock == 'true':
            queryset = queryset.filter(in_stock=True)

        # Order by price
        queryset = queryset.order_by('price')

        serializer = self.get_serializer(queryset[:100], many=True)
        return Response(serializer.data)