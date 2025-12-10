# hospitals/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import Hospital, HospitalReview
import math


def calculate_distance(lat1, lon1, lat2, lon2):
    """Ikki nuqta orasidagi masofani hisoblash (km)"""
    if not all([lat1, lon1, lat2, lon2]):
        return None
    R = 6371  # Earth radius in km
    lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return round(R * c, 1)


def hospital_to_dict(hospital, user_lat=None, user_lng=None):
    """Hospital modelini dict ga o'girish"""
    distance = None
    if user_lat and user_lng and hospital.latitude and hospital.longitude:
        distance = calculate_distance(user_lat, user_lng, hospital.latitude, hospital.longitude)

    return {
        'id': hospital.id,
        'name': hospital.name,
        'hospital_type': hospital.hospital_type,
        'type_display': hospital.get_hospital_type_display(),
        'address': hospital.address,
        'city': hospital.city,
        'latitude': float(hospital.latitude) if hospital.latitude else None,
        'longitude': float(hospital.longitude) if hospital.longitude else None,
        'phone': hospital.phone,
        'email': hospital.email,
        'website': hospital.website,
        'rating': float(hospital.rating),
        'reviews_count': hospital.reviews_count,
        'is_24_hours': hospital.is_24_hours,
        'working_hours': hospital.working_hours,
        'specializations': hospital.specializations or [],
        'services': hospital.services or [],
        'description': hospital.description,
        'image_url': hospital.image.url if hospital.image else None,
        'distance': distance,
        'is_verified': hospital.is_verified,
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def hospitals_list(request):
    """Kasalxonalar ro'yxati"""

    queryset = Hospital.objects.filter(is_active=True)

    # Filters
    hospital_type = request.GET.get('type')
    if hospital_type:
        queryset = queryset.filter(hospital_type=hospital_type)

    city = request.GET.get('city')
    if city:
        queryset = queryset.filter(city__iexact=city)

    search = request.GET.get('search', '').strip()
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) |
            Q(address__icontains=search) |
            Q(specializations__icontains=search)
        )

    is_24_hours = request.GET.get('is_24_hours')
    if is_24_hours == 'true':
        queryset = queryset.filter(is_24_hours=True)

    # User location for distance calculation
    user_lat = request.GET.get('lat')
    user_lng = request.GET.get('lng')

    # Sort
    sort_by = request.GET.get('sort', 'rating')
    if sort_by == 'rating':
        queryset = queryset.order_by('-rating', 'name')
    elif sort_by == 'name':
        queryset = queryset.order_by('name')
    elif sort_by == 'reviews':
        queryset = queryset.order_by('-reviews_count')

    hospitals = [hospital_to_dict(h, user_lat, user_lng) for h in queryset[:50]]

    # Sort by distance if user location provided
    if sort_by == 'distance' and user_lat and user_lng:
        hospitals.sort(key=lambda x: x.get('distance') or 9999)

    return Response({
        'count': len(hospitals),
        'hospitals': hospitals
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def hospital_detail(request, pk):
    """Kasalxona tafsilotlari"""

    try:
        hospital = Hospital.objects.get(pk=pk, is_active=True)
    except Hospital.DoesNotExist:
        return Response({'error': 'Kasalxona topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    # User location
    user_lat = request.GET.get('lat')
    user_lng = request.GET.get('lng')

    data = hospital_to_dict(hospital, user_lat, user_lng)

    # Add reviews
    reviews = hospital.reviews.select_related('user').order_by('-created_at')[:10]
    data['reviews'] = [{
        'id': r.id,
        'user_name': r.user.first_name or r.user.email.split('@')[0],
        'rating': r.rating,
        'comment': r.comment,
        'date': str(r.created_at.date()),
    } for r in reviews]

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hospital_review(request, pk):
    """Kasalxonaga sharh qoldirish"""

    try:
        hospital = Hospital.objects.get(pk=pk, is_active=True)
    except Hospital.DoesNotExist:
        return Response({'error': 'Kasalxona topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    rating = request.data.get('rating')
    comment = request.data.get('comment', '')

    if not rating or not (1 <= int(rating) <= 5):
        return Response({'error': 'Rating 1-5 oralig\'ida bo\'lishi kerak'}, status=400)

    # Check if user already reviewed
    existing = HospitalReview.objects.filter(hospital=hospital, user=request.user).first()
    if existing:
        # Update existing review
        existing.rating = int(rating)
        existing.comment = comment
        existing.save()
        review = existing
        message = 'Sharhingiz yangilandi!'
    else:
        # Create new review
        review = HospitalReview.objects.create(
            hospital=hospital,
            user=request.user,
            rating=int(rating),
            comment=comment
        )
        message = 'Sharhingiz qabul qilindi!'

    return Response({
        'message': message,
        'review': {
            'id': review.id,
            'hospital_id': hospital.id,
            'user_name': request.user.first_name or request.user.email.split('@')[0],
            'rating': review.rating,
            'comment': review.comment,
            'date': str(review.created_at.date()),
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def nearby_hospitals(request):
    """Yaqin atrofdagi kasalxonalar"""

    lat = request.GET.get('lat')
    lng = request.GET.get('lng')
    radius = float(request.GET.get('radius', 5))  # km
    hospital_type = request.GET.get('type')

    if not lat or not lng:
        return Response({'error': 'lat va lng parametrlari kerak'}, status=400)

    try:
        user_lat = float(lat)
        user_lng = float(lng)
    except ValueError:
        return Response({'error': 'Noto\'g\'ri koordinatalar'}, status=400)

    queryset = Hospital.objects.filter(
        is_active=True,
        latitude__isnull=False,
        longitude__isnull=False
    )

    if hospital_type:
        queryset = queryset.filter(hospital_type=hospital_type)

    # Calculate distances and filter
    hospitals = []
    for h in queryset:
        distance = calculate_distance(user_lat, user_lng, h.latitude, h.longitude)
        if distance and distance <= radius:
            data = {
                'id': h.id,
                'name': h.name,
                'hospital_type': h.hospital_type,
                'type_display': h.get_hospital_type_display(),
                'distance': distance,
                'is_24_hours': h.is_24_hours,
                'rating': float(h.rating),
                'address': h.address,
                'phone': h.phone,
            }
            hospitals.append(data)

    # Sort by distance
    hospitals.sort(key=lambda x: x['distance'])

    return Response({
        'count': len(hospitals),
        'hospitals': hospitals[:20]
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def hospital_types(request):
    """Kasalxona turlari"""
    types = [
        {'value': 'hospital', 'label': 'Kasalxona'},
        {'value': 'clinic', 'label': 'Klinika'},
        {'value': 'pharmacy', 'label': 'Dorixona'},
        {'value': 'laboratory', 'label': 'Laboratoriya'},
        {'value': 'dental', 'label': 'Stomatologiya'},
    ]
    return Response(types)
