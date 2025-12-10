# medicines/views.py
import random
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Min, Max
from django.utils import timezone
from .models import Category, Pharmacy, Medicine, PharmacyPrice, Hospital, HospitalReview
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

        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)

        prescription = request.query_params.get('prescription')
        if prescription == 'true':
            queryset = queryset.filter(requires_prescription=True)
        elif prescription == 'false':
            queryset = queryset.filter(requires_prescription=False)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)

        ordering = request.query_params.get('ordering', 'name')
        if ordering in ['name', '-name', 'price', '-price']:
            queryset = queryset.order_by(ordering)

        serializer = MedicineListSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """Dori detail - narxlar bilan"""
        medicine = self.get_object()

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

        medicine = request.query_params.get('medicine')
        if medicine:
            queryset = queryset.filter(medicine_id=medicine)

        pharmacy = request.query_params.get('pharmacy')
        if pharmacy:
            queryset = queryset.filter(pharmacy_id=pharmacy)

        in_stock = request.query_params.get('in_stock')
        if in_stock == 'true':
            queryset = queryset.filter(in_stock=True)

        queryset = queryset.order_by('price')

        serializer = self.get_serializer(queryset[:100], many=True)
        return Response(serializer.data)


# ============ MEDICINE REMINDERS ============

from .models import MedicineReminder, ReminderLog

FREQUENCY_DISPLAY = {
    'once': 'Bir marotaba',
    'daily': 'Har kuni',
    'twice_daily': 'Kuniga 2 marta',
    'three_times': 'Kuniga 3 marta',
    'weekly': 'Haftada bir',
    'custom': 'Maxsus',
}


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def medicine_reminders(request):
    """Dori eslatmalari ro'yxati va yaratish"""

    if request.method == 'GET':
        # Foydalanuvchi eslatmalari
        queryset = MedicineReminder.objects.filter(user=request.user)

        status_filter = request.GET.get('status', 'active')
        if status_filter != 'all':
            queryset = queryset.filter(status=status_filter)

        reminders = []
        for r in queryset:
            # Bugungi statistika
            today = timezone.now().date()
            today_logs = ReminderLog.objects.filter(
                reminder=r,
                scheduled_time__date=today
            )
            taken_today = today_logs.filter(status='taken').count()
            total_today = len(r.times) if r.times else 1

            # Streak hisoblash
            streak = 0
            check_date = today
            while True:
                day_logs = ReminderLog.objects.filter(
                    reminder=r,
                    scheduled_time__date=check_date,
                    status='taken'
                )
                if day_logs.exists():
                    streak += 1
                    check_date -= timezone.timedelta(days=1)
                else:
                    break
                if streak > 100:
                    break

            # Keyingi doza
            next_dose = None
            if r.status == 'active' and r.times:
                now = timezone.now().time()
                for t in sorted(r.times):
                    try:
                        dose_time = timezone.datetime.strptime(t, '%H:%M').time()
                        if dose_time > now:
                            next_dose = t
                            break
                    except:
                        pass
                if not next_dose:
                    next_dose = f"Ertaga {r.times[0]}" if r.times else None

            reminders.append({
                'id': r.id,
                'medicine_name': r.medicine_name,
                'dosage': r.dosage,
                'frequency': r.frequency,
                'frequency_display': FREQUENCY_DISPLAY.get(r.frequency, r.frequency),
                'times': r.times or [],
                'start_date': str(r.start_date),
                'end_date': str(r.end_date) if r.end_date else None,
                'status': r.status,
                'with_food': r.with_food,
                'before_food': r.before_food,
                'notes': r.notes,
                'next_dose': next_dose,
                'taken_today': taken_today,
                'total_today': total_today,
                'streak': streak,
            })

        return Response({
            'count': len(reminders),
            'reminders': reminders
        })

    elif request.method == 'POST':
        data = request.data

        # Yangi eslatma yaratish
        reminder = MedicineReminder.objects.create(
            user=request.user,
            medicine_name=data.get('medicine_name', ''),
            dosage=data.get('dosage', ''),
            frequency=data.get('frequency', 'daily'),
            times=data.get('times', ['08:00']),
            start_date=data.get('start_date', timezone.now().date()),
            end_date=data.get('end_date'),
            with_food=data.get('with_food', False),
            before_food=data.get('before_food', False),
            notes=data.get('notes', ''),
            status='active'
        )

        return Response({
            'id': reminder.id,
            'medicine_name': reminder.medicine_name,
            'dosage': reminder.dosage,
            'frequency': reminder.frequency,
            'frequency_display': FREQUENCY_DISPLAY.get(reminder.frequency, reminder.frequency),
            'times': reminder.times,
            'start_date': str(reminder.start_date),
            'end_date': str(reminder.end_date) if reminder.end_date else None,
            'status': reminder.status,
            'with_food': reminder.with_food,
            'before_food': reminder.before_food,
            'notes': reminder.notes,
            'message': 'Eslatma yaratildi!'
        }, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def medicine_reminder_detail(request, pk):
    """Bitta eslatma tafsilotlari"""

    try:
        reminder = MedicineReminder.objects.get(id=pk, user=request.user)
    except MedicineReminder.DoesNotExist:
        return Response({'error': 'Eslatma topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Tarix
        logs = ReminderLog.objects.filter(reminder=reminder).order_by('-scheduled_time')[:20]
        history = [{
            'date': str(log.scheduled_time.date()),
            'time': log.scheduled_time.strftime('%H:%M'),
            'status': log.status,
            'actual_time': log.actual_time.strftime('%H:%M') if log.actual_time else None,
        } for log in logs]

        return Response({
            'id': reminder.id,
            'medicine_name': reminder.medicine_name,
            'dosage': reminder.dosage,
            'frequency': reminder.frequency,
            'frequency_display': FREQUENCY_DISPLAY.get(reminder.frequency, reminder.frequency),
            'times': reminder.times or [],
            'start_date': str(reminder.start_date),
            'end_date': str(reminder.end_date) if reminder.end_date else None,
            'status': reminder.status,
            'with_food': reminder.with_food,
            'before_food': reminder.before_food,
            'notes': reminder.notes,
            'history': history,
        })

    elif request.method == 'PUT':
        data = request.data
        reminder.medicine_name = data.get('medicine_name', reminder.medicine_name)
        reminder.dosage = data.get('dosage', reminder.dosage)
        reminder.frequency = data.get('frequency', reminder.frequency)
        reminder.times = data.get('times', reminder.times)
        reminder.end_date = data.get('end_date', reminder.end_date)
        reminder.with_food = data.get('with_food', reminder.with_food)
        reminder.before_food = data.get('before_food', reminder.before_food)
        reminder.notes = data.get('notes', reminder.notes)
        reminder.status = data.get('status', reminder.status)
        reminder.save()

        return Response({
            'message': 'Yangilandi',
            'id': reminder.id,
            'medicine_name': reminder.medicine_name,
            'dosage': reminder.dosage,
            'frequency': reminder.frequency,
            'status': reminder.status,
        })

    elif request.method == 'DELETE':
        reminder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_medicine_taken(request, pk):
    """Dori ichildi deb belgilash"""

    try:
        reminder = MedicineReminder.objects.get(id=pk, user=request.user)
    except MedicineReminder.DoesNotExist:
        return Response({'error': 'Eslatma topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get('action', 'taken')
    scheduled_time_str = request.data.get('scheduled_time')

    # scheduled_time ni parse qilish
    if scheduled_time_str:
        try:
            scheduled_time = timezone.datetime.fromisoformat(scheduled_time_str.replace('Z', '+00:00'))
        except:
            scheduled_time = timezone.now()
    else:
        scheduled_time = timezone.now()

    # Log yaratish
    log = ReminderLog.objects.create(
        reminder=reminder,
        scheduled_time=scheduled_time,
        actual_time=timezone.now() if action == 'taken' else None,
        status=action,
        notes=request.data.get('notes', '')
    )

    messages = {
        'taken': 'Dori ichildi deb belgilandi',
        'skipped': "O'tkazib yuborildi",
        'snoozed': '15 daqiqaga keyinga qoldirildi',
    }

    return Response({
        'id': log.id,
        'reminder_id': pk,
        'scheduled_time': log.scheduled_time.isoformat(),
        'actual_time': log.actual_time.isoformat() if log.actual_time else None,
        'status': action,
        'message': messages.get(action, 'Saqlandi')
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def today_schedule(request):
    """Bugungi dori jadvali"""

    today = timezone.now().date()
    now = timezone.now()

    # Faol eslatmalar
    reminders = MedicineReminder.objects.filter(
        user=request.user,
        status='active',
        start_date__lte=today
    ).filter(
        models.Q(end_date__isnull=True) | models.Q(end_date__gte=today)
    )

    schedule = []
    for reminder in reminders:
        if not reminder.times:
            continue

        for time_str in reminder.times:
            try:
                dose_time = timezone.datetime.strptime(time_str, '%H:%M').time()
                scheduled_datetime = timezone.datetime.combine(today, dose_time)
                if timezone.is_naive(scheduled_datetime):
                    scheduled_datetime = timezone.make_aware(scheduled_datetime)

                # Bu dozani log tekshirish
                log = ReminderLog.objects.filter(
                    reminder=reminder,
                    scheduled_time__date=today,
                    scheduled_time__hour=dose_time.hour,
                    scheduled_time__minute=dose_time.minute
                ).first()

                if log:
                    dose_status = log.status
                    taken_at = log.actual_time.strftime('%H:%M') if log.actual_time else None
                elif scheduled_datetime < now:
                    dose_status = 'missed'
                    taken_at = None
                else:
                    dose_status = 'pending'
                    taken_at = None

                schedule.append({
                    'id': reminder.id,
                    'time': time_str,
                    'medicine_name': reminder.medicine_name,
                    'dosage': reminder.dosage,
                    'status': dose_status,
                    'taken_at': taken_at,
                    'with_food': reminder.with_food,
                    'before_food': reminder.before_food,
                })
            except:
                pass

    # Vaqt bo'yicha tartiblash
    schedule.sort(key=lambda x: x['time'])

    # Statistika
    taken = len([s for s in schedule if s['status'] == 'taken'])
    total = len(schedule)
    adherence_rate = round((taken / total) * 100) if total > 0 else 0

    stats = {
        'total': total,
        'taken': taken,
        'pending': len([s for s in schedule if s['status'] == 'pending']),
        'skipped': len([s for s in schedule if s['status'] == 'skipped']),
        'missed': len([s for s in schedule if s['status'] == 'missed']),
        'adherence_rate': adherence_rate,
    }

    return Response({
        'date': str(today),
        'schedule': schedule,
        'stats': stats
    })


# ============ HOSPITALS ============

@api_view(['GET'])
@permission_classes([AllowAny])
def hospitals_list(request):
    """Kasalxonalar ro'yxati"""

    # Demo data
    hospitals = [
        {
            'id': 1,
            'name': 'Toshkent Tibbiyot Akademiyasi Klinikasi',
            'hospital_type': 'hospital',
            'type_display': 'Kasalxona',
            'address': 'Toshkent sh., Almazar tumani, Farobiy ko\'chasi 2',
            'city': 'Toshkent',
            'latitude': 41.311081,
            'longitude': 69.279737,
            'phone': '+998 71 268 50 00',
            'rating': 4.5,
            'reviews_count': 128,
            'is_24_hours': True,
            'distance': 2.5,
            'specializations': ['Kardiologiya', 'Nevrologiya', 'Terapiya', 'Jarrohlik'],
        },
        {
            'id': 2,
            'name': 'Respublika Shoshilinch Tibbiy Yordam Markazi',
            'hospital_type': 'hospital',
            'type_display': 'Kasalxona',
            'address': 'Toshkent sh., Shayxontohur tumani, Kichik Xalqa yo\'li 2',
            'city': 'Toshkent',
            'latitude': 41.328650,
            'longitude': 69.255889,
            'phone': '+998 71 277 09 05',
            'rating': 4.7,
            'reviews_count': 256,
            'is_24_hours': True,
            'distance': 4.2,
            'specializations': ['Travmatologiya', 'Reanimatologiya', 'Jarrohlik'],
        },
        {
            'id': 3,
            'name': 'Premium Med Clinic',
            'hospital_type': 'clinic',
            'type_display': 'Klinika',
            'address': 'Toshkent sh., Yunusobod tumani, Amir Temur ko\'chasi 88',
            'city': 'Toshkent',
            'latitude': 41.350000,
            'longitude': 69.300000,
            'phone': '+998 71 200 00 00',
            'rating': 4.8,
            'reviews_count': 89,
            'is_24_hours': False,
            'working_hours': '08:00 - 20:00',
            'distance': 3.1,
            'specializations': ['UZI', 'Laboratoriya', 'Terapiya'],
        },
        {
            'id': 4,
            'name': 'Dori-Darmon Dorixonasi',
            'hospital_type': 'pharmacy',
            'type_display': 'Dorixona',
            'address': 'Toshkent sh., Mirzo Ulug\'bek tumani, Buyuk Ipak Yo\'li 48',
            'city': 'Toshkent',
            'latitude': 41.340000,
            'longitude': 69.285000,
            'phone': '+998 71 255 55 55',
            'rating': 4.3,
            'reviews_count': 45,
            'is_24_hours': True,
            'distance': 1.2,
            'specializations': ['Dorilar', 'Tibbiy anjomlar'],
        },
        {
            'id': 5,
            'name': 'Invitro Laboratoriyasi',
            'hospital_type': 'laboratory',
            'type_display': 'Laboratoriya',
            'address': 'Toshkent sh., Chilonzor tumani, Bunyodkor ko\'chasi 5',
            'city': 'Toshkent',
            'latitude': 41.285000,
            'longitude': 69.205000,
            'phone': '+998 71 150 00 00',
            'rating': 4.6,
            'reviews_count': 167,
            'is_24_hours': False,
            'working_hours': '07:00 - 19:00',
            'distance': 5.5,
            'specializations': ['Qon tahlili', 'Genetik testlar', 'Allergiya testlari'],
        },
        {
            'id': 6,
            'name': 'Smile Dental Clinic',
            'hospital_type': 'dental',
            'type_display': 'Stomatologiya',
            'address': 'Toshkent sh., Yunusobod tumani, Bogishamol ko\'chasi 12',
            'city': 'Toshkent',
            'latitude': 41.355000,
            'longitude': 69.290000,
            'phone': '+998 71 234 56 78',
            'rating': 4.9,
            'reviews_count': 203,
            'is_24_hours': False,
            'working_hours': '09:00 - 21:00',
            'distance': 2.8,
            'specializations': ['Terapevtik stomatologiya', 'Ortodontiya', 'Implantatsiya'],
        },
    ]

    # Filters
    hospital_type = request.GET.get('type')
    if hospital_type:
        hospitals = [h for h in hospitals if h['hospital_type'] == hospital_type]

    city = request.GET.get('city')
    if city:
        hospitals = [h for h in hospitals if h['city'].lower() == city.lower()]

    search = request.GET.get('search', '').lower()
    if search:
        hospitals = [h for h in hospitals if
                     search in h['name'].lower() or
                     search in h['address'].lower() or
                     any(search in s.lower() for s in h['specializations'])
                     ]

    # Sort
    sort_by = request.GET.get('sort', 'distance')
    if sort_by == 'distance':
        hospitals.sort(key=lambda x: x.get('distance', 999))
    elif sort_by == 'rating':
        hospitals.sort(key=lambda x: x.get('rating', 0), reverse=True)
    elif sort_by == 'name':
        hospitals.sort(key=lambda x: x.get('name', ''))

    return Response({
        'count': len(hospitals),
        'hospitals': hospitals
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def hospital_detail(request, pk):
    """Kasalxona tafsilotlari"""

    hospital = {
        'id': pk,
        'name': 'Toshkent Tibbiyot Akademiyasi Klinikasi',
        'hospital_type': 'hospital',
        'type_display': 'Kasalxona',
        'address': 'Toshkent sh., Almazar tumani, Farobiy ko\'chasi 2',
        'city': 'Toshkent',
        'latitude': 41.311081,
        'longitude': 69.279737,
        'phone': '+998 71 268 50 00',
        'email': 'info@tma.uz',
        'website': 'https://tma.uz',
        'rating': 4.5,
        'reviews_count': 128,
        'is_24_hours': True,
        'working_hours': {
            'mon': '00:00 - 24:00',
            'tue': '00:00 - 24:00',
            'wed': '00:00 - 24:00',
            'thu': '00:00 - 24:00',
            'fri': '00:00 - 24:00',
            'sat': '00:00 - 24:00',
            'sun': '00:00 - 24:00',
        },
        'specializations': ['Kardiologiya', 'Nevrologiya', 'Terapiya', 'Jarrohlik'],
        'services': [
            'Ambulator qabul',
            'Statsionar davolash',
            'Shoshilinch yordam',
            'Laboratoriya xizmatlari',
            'Diagnostika',
            'Fizioterapiya',
        ],
        'description': "O'zbekistondagi eng yirik davlat tibbiyot muassasasi.",
        'reviews': [
            {'id': 1, 'user_name': 'Alisher K.', 'rating': 5, 'comment': 'Ajoyib shifokorlar!', 'date': '2024-01-15'},
            {'id': 2, 'user_name': 'Madina R.', 'rating': 4, 'comment': 'Yaxshi xizmat.', 'date': '2024-01-10'},
        ]
    }

    return Response(hospital)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hospital_review(request, pk):
    """Kasalxonaga sharh qoldirish"""

    rating = request.data.get('rating')
    comment = request.data.get('comment', '')

    if not rating or not (1 <= int(rating) <= 5):
        return Response({'error': 'Rating 1-5 oralig\'ida bo\'lishi kerak'}, status=400)

    review = {
        'id': random.randint(100, 999),
        'hospital_id': pk,
        'user_name': request.user.get_full_name() or request.user.phone,
        'rating': int(rating),
        'comment': comment,
        'date': str(timezone.now().date()),
    }

    return Response({
        'message': 'Sharhingiz qabul qilindi!',
        'review': review
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def nearby_hospitals(request):
    """Yaqin atrofdagi kasalxonalar"""

    hospitals = [
        {'id': 4, 'name': 'Dori-Darmon Dorixonasi', 'hospital_type': 'pharmacy', 'type_display': 'Dorixona',
         'distance': 1.2, 'is_24_hours': True, 'rating': 4.3},
        {'id': 1, 'name': 'Toshkent Tibbiyot Akademiyasi', 'hospital_type': 'hospital', 'type_display': 'Kasalxona',
         'distance': 2.5, 'is_24_hours': True, 'rating': 4.5},
        {'id': 3, 'name': 'Premium Med Clinic', 'hospital_type': 'clinic', 'type_display': 'Klinika', 'distance': 3.1,
         'is_24_hours': False, 'rating': 4.8},
    ]

    hospital_type = request.GET.get('type')
    if hospital_type:
        hospitals = [h for h in hospitals if h['hospital_type'] == hospital_type]

    return Response({
        'count': len(hospitals),
        'hospitals': hospitals
    })