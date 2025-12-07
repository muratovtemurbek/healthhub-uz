# hospitals/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
import random


@api_view(['GET'])
@permission_classes([AllowAny])
def hospitals_list(request):
    """Kasalxonalar ro'yxati"""

    # Demo data - real loyihada DB dan olinadi
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
            'image_url': '/media/hospitals/tma.jpg',
        },
        {
            'id': 2,
            'name': 'Respublika Shoshilinch Tibbiy Yordam Ilmiy Markazi',
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
            'image_url': '/media/hospitals/emergency.jpg',
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
            'image_url': '/media/hospitals/premium.jpg',
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
            'image_url': '/media/hospitals/pharmacy.jpg',
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
            'image_url': '/media/hospitals/invitro.jpg',
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
            'image_url': '/media/hospitals/dental.jpg',
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
        'description': "O'zbekistondagi eng yirik davlat tibbiyot muassasasi. 1935 yilda tashkil etilgan. Har yili minglab bemorlar sifatli tibbiy xizmat oladi.",
        'image_url': '/media/hospitals/tma.jpg',
        'reviews': [
            {
                'id': 1,
                'user_name': 'Alisher K.',
                'rating': 5,
                'comment': 'Ajoyib shifokorlar va sifatli xizmat! Tavsiya qilaman.',
                'date': '2024-01-15'
            },
            {
                'id': 2,
                'user_name': 'Madina R.',
                'rating': 4,
                'comment': 'Yaxshi, lekin navbat kutish kerak bo\'ladi.',
                'date': '2024-01-10'
            },
            {
                'id': 3,
                'user_name': 'Bobur T.',
                'rating': 5,
                'comment': 'Professional xizmat, hamma narsa toza va tartibli.',
                'date': '2024-01-05'
            },
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

    lat = request.GET.get('lat')
    lng = request.GET.get('lng')
    radius = request.GET.get('radius', 5)  # km
    hospital_type = request.GET.get('type')

    # Demo - real loyihada koordinatalar bo'yicha hisoblash
    hospitals = [
        {
            'id': 4,
            'name': 'Dori-Darmon Dorixonasi',
            'hospital_type': 'pharmacy',
            'type_display': 'Dorixona',
            'distance': 1.2,
            'is_24_hours': True,
            'rating': 4.3,
        },
        {
            'id': 1,
            'name': 'Toshkent Tibbiyot Akademiyasi Klinikasi',
            'hospital_type': 'hospital',
            'type_display': 'Kasalxona',
            'distance': 2.5,
            'is_24_hours': True,
            'rating': 4.5,
        },
        {
            'id': 3,
            'name': 'Premium Med Clinic',
            'hospital_type': 'clinic',
            'type_display': 'Klinika',
            'distance': 3.1,
            'is_24_hours': False,
            'rating': 4.8,
        },
    ]

    if hospital_type:
        hospitals = [h for h in hospitals if h['hospital_type'] == hospital_type]

    return Response({
        'count': len(hospitals),
        'hospitals': hospitals
    })