# accounts/views.py
import logging
import random
from datetime import timedelta

from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Count, Sum
from django.utils import timezone
import requests

logger = logging.getLogger(__name__)

from .models import User
from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    UserLoginSerializer, UserProfileUpdateSerializer,
    MedicalCardSerializer, MedicalCardUpdateSerializer,
    ChangePasswordSerializer
)


# ==================== AUTH ====================

class RegisterView(generics.CreateAPIView):
    """Ro'yxatdan o'tish"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!'
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """Login - email yoki username bilan"""
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            if hasattr(e, 'detail'):
                error_detail = e.detail
                if isinstance(error_detail, dict):
                    for key, value in error_detail.items():
                        if isinstance(value, list):
                            return Response({'error': value[0]}, status=status.HTTP_400_BAD_REQUEST)
                        elif isinstance(value, str):
                            return Response({'error': value}, status=status.HTTP_400_BAD_REQUEST)
                        elif isinstance(value, dict) and 'error' in value:
                            return Response({'error': value['error']}, status=status.HTTP_400_BAD_REQUEST)
                return Response({'error': str(error_detail)}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'error': 'Login xatolik'}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Xush kelibsiz!'
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Foydalanuvchi profili"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = UserProfileUpdateSerializer(
            self.get_object(),
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'user': UserSerializer(self.get_object()).data,
            'message': 'Profil yangilandi'
        })


class UserViewSet(viewsets.ModelViewSet):
    """Foydalanuvchilar boshqaruvi (Admin uchun)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """Faqat admin foydalanuvchilar ruxsat oladi"""
        return [IsAuthenticated()]

    def check_admin_permission(self, request):
        """Admin ekanligini tekshirish"""
        if not hasattr(request.user, 'user_type') or request.user.user_type != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Faqat adminlar uchun ruxsat berilgan")

    def list(self, request, *args, **kwargs):
        self.check_admin_permission(request)
        users = self.queryset.all().order_by('-date_joined')
        data = []
        for u in users:
            data.append({
                'id': str(u.id) if hasattr(u.id, 'hex') else u.id,
                'username': u.username,
                'email': u.email,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'phone': u.phone if u.phone else '',
                'user_type': u.user_type if hasattr(u, 'user_type') else 'patient',
                'is_active': u.is_active,
                'date_joined': u.date_joined.isoformat() if u.date_joined else None,
            })
        return Response(data)

    def create(self, request, *args, **kwargs):
        self.check_admin_permission(request)
        data = request.data

        # Parol majburiy
        password = data.get('password')
        if not password or len(password) < 8:
            return Response({
                'error': 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Email majburiy
        email = data.get('email', '')
        if not email:
            return Response({
                'error': 'Email kiritilishi shart'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(
                username=data.get('username', email.split('@')[0]),
                email=email,
                password=password,
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
            )
            if hasattr(user, 'user_type'):
                user.user_type = data.get('user_type', 'patient')
            if hasattr(user, 'phone'):
                user.phone = data.get('phone', '')
            user.save()

            return Response({
                'id': str(user.id) if hasattr(user.id, 'hex') else user.id,
                'message': 'Foydalanuvchi yaratildi!'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        self.check_admin_permission(request)
        try:
            user = self.get_object()
            if user.user_type == 'admin':
                return Response({'error': 'Admin o\'chirib bo\'lmaydi'}, status=status.HTTP_400_BAD_REQUEST)
            user.delete()
            return Response({'message': 'Foydalanuvchi o\'chirildi!'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Joriy foydalanuvchi ma'lumotlari"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# ==================== PROFILE & MEDICAL CARD ====================

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_detail(request):
    """Profil olish va tahrirlash"""
    user = request.user

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Profil muvaffaqiyatli yangilandi!'
            })
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def medical_card(request):
    """Tibbiy karta olish va yangilash"""
    user = request.user

    if request.method == 'GET':
        serializer = MedicalCardSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = MedicalCardUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'medical_card': MedicalCardSerializer(user).data,
                'message': 'Tibbiy karta yangilandi!'
            })
        return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Parol o'zgartirish"""
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})

    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Parol muvaffaqiyatli o\'zgartirildi!'
        })

    return Response(serializer.errors, status=400)


# ==================== AIR QUALITY & HEALTH ALERTS ====================

from django.conf import settings
IQAIR_API_KEY = getattr(settings, 'IQAIR_API_KEY', '')

# Kasalliklar va havo sifati ta'siri
HEALTH_SENSITIVITY = {
    'asthma': {'name': 'Astma', 'aqi_threshold': 50, 'message': 'Astma uchun xavfli havo!'},
    'bronchitis': {'name': 'Bronxit', 'aqi_threshold': 75, 'message': 'Bronxit uchun xavfli havo!'},
    'heart_disease': {'name': 'Yurak kasalligi', 'aqi_threshold': 100, 'message': 'Yurak kasalligi uchun xavfli!'},
    'allergy': {'name': 'Allergiya', 'aqi_threshold': 50, 'message': 'Allergiya uchun xavfli havo!'},
    'diabetes': {'name': 'Diabet', 'aqi_threshold': 100, 'message': 'Diabet bemorlari uchun ehtiyotkor bo\'ling!'},
    'hypertension': {'name': 'Gipertoniya', 'aqi_threshold': 75, 'message': 'Qon bosimi oshishi mumkin!'},
    'copd': {'name': 'COPD', 'aqi_threshold': 50, 'message': 'O\'pka kasalligi uchun juda xavfli!'},
    'respiratory': {'name': 'Nafas kasalliklari', 'aqi_threshold': 75, 'message': 'Nafas olish qiyinlashishi mumkin!'},
}


def get_aqi_status(aqi):
    """AQI darajasini aniqlash"""
    if aqi <= 50:
        return {
            'level': 'good',
            'label': 'Yaxshi',
            'color': 'green',
            'description': 'Havo sifati yaxshi. Ochiq havoda faollik xavfsiz.',
            'icon': '😊'
        }
    elif aqi <= 100:
        return {
            'level': 'moderate',
            'label': 'O\'rtacha',
            'color': 'yellow',
            'description': 'Havo sifati qoniqarli. Sezgir odamlar ehtiyot bo\'lishi kerak.',
            'icon': '😐'
        }
    elif aqi <= 150:
        return {
            'level': 'unhealthy_sensitive',
            'label': 'Sezgirlar uchun zararli',
            'color': 'orange',
            'description': 'Surunkali kasalligi borlar ochiq havoda kam bo\'lsin.',
            'icon': '😷'
        }
    elif aqi <= 200:
        return {
            'level': 'unhealthy',
            'label': 'Zararli',
            'color': 'red',
            'description': 'Hamma uchun sog\'liq ta\'siri bo\'lishi mumkin.',
            'icon': '🤒'
        }
    elif aqi <= 300:
        return {
            'level': 'very_unhealthy',
            'label': 'Juda zararli',
            'color': 'purple',
            'description': 'Sog\'liq uchun jiddiy xavf. Uyda qoling.',
            'icon': '🏥'
        }
    else:
        return {
            'level': 'hazardous',
            'label': 'Xavfli',
            'color': 'maroon',
            'description': 'Favqulodda holat! Tashqariga chiqmang.',
            'icon': '☠️'
        }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def health_alerts(request):
    """Foydalanuvchi sog'lig'iga asoslangan havo sifati ogohlantirishlari"""
    user = request.user
    city = request.GET.get('city', 'Tashkent')
    country = request.GET.get('country', 'Uzbekistan')

    # Foydalanuvchi kasalliklarini olish
    user_conditions = []
    if user.chronic_diseases:
        if isinstance(user.chronic_diseases, list):
            user_conditions = [c.lower() for c in user.chronic_diseases]
        elif isinstance(user.chronic_diseases, str):
            user_conditions = [c.strip().lower() for c in user.chronic_diseases.split(',')]

    # Allergiyalarni ham qo'shish
    if user.allergies:
        user_conditions.append('allergy')

    # IQAir API dan havo sifatini olish
    try:
        # Demo rejimda static data
        # Real API: https://api.airvisual.com/v2/city?city={city}&state={state}&country={country}&key={key}

        # Demo data (IQAir API key bo'lmaganda)
        air_data = {
            'city': city,
            'country': country,
            'aqi': 78,  # Demo AQI
            'main_pollutant': 'pm2.5',
            'temperature': 22,
            'humidity': 45,
            'wind_speed': 3.5,
            'weather_icon': '01d'
        }

        # Real API call (API key bo'lganda)
        if IQAIR_API_KEY and IQAIR_API_KEY != "your-iqair-api-key":
            try:
                from urllib.parse import urlencode, quote
                # URL injection dan himoya - parametrlarni xavfsiz encode qilish
                params = urlencode({
                    'city': city,
                    'state': city,
                    'country': country,
                    'key': IQAIR_API_KEY
                })
                api_url = f"http://api.airvisual.com/v2/city?{params}"
                response = requests.get(api_url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if data.get('status') == 'success':
                        current = data['data']['current']
                        pollution = current['pollution']
                        weather = current['weather']
                        air_data = {
                            'city': city,
                            'country': country,
                            'aqi': pollution['aqius'],
                            'main_pollutant': pollution.get('mainus', 'pm2.5'),
                            'temperature': weather.get('tp', 0),
                            'humidity': weather.get('hu', 0),
                            'wind_speed': weather.get('ws', 0),
                            'weather_icon': weather.get('ic', '01d')
                        }
            except Exception as e:
                print(f"IQAir API error: {e}")

        aqi = air_data['aqi']
        aqi_status = get_aqi_status(aqi)

        # Shaxsiy ogohlantirish yaratish
        personal_alerts = []
        for condition in user_conditions:
            for key, sensitivity in HEALTH_SENSITIVITY.items():
                if key in condition or condition in key:
                    if aqi > sensitivity['aqi_threshold']:
                        personal_alerts.append({
                            'condition': sensitivity['name'],
                            'message': sensitivity['message'],
                            'severity': 'high' if aqi > sensitivity['aqi_threshold'] + 50 else 'medium',
                            'recommendation': get_recommendation(key, aqi)
                        })

        # Umumiy tavsiyalar
        recommendations = get_general_recommendations(aqi, user_conditions)

        return Response({
            'air_quality': {
                'aqi': aqi,
                'status': aqi_status,
                'main_pollutant': air_data['main_pollutant'],
                'city': air_data['city'],
                'country': air_data['country'],
            },
            'weather': {
                'temperature': air_data['temperature'],
                'humidity': air_data['humidity'],
                'wind_speed': air_data['wind_speed'],
                'icon': air_data['weather_icon']
            },
            'personal_alerts': personal_alerts,
            'has_alerts': len(personal_alerts) > 0,
            'recommendations': recommendations,
            'user_conditions': user_conditions,
            'last_updated': timezone.now().isoformat()
        })

    except Exception as e:
        return Response({
            'error': f'Havo ma\'lumotlarini olishda xatolik: {str(e)}',
            'air_quality': None,
            'personal_alerts': [],
            'recommendations': []
        }, status=500)


def get_recommendation(condition, aqi):
    """Kasallikka qarab tavsiya"""
    recommendations = {
        'asthma': 'Inhaler yoningizda bo\'lsin. Tashqarida bo\'lishni kamaytiring.',
        'bronchitis': 'Ko\'p suv iching. Uyda dam oling.',
        'heart_disease': 'Og\'ir jismoniy mashqlardan saqlaning.',
        'allergy': 'Allergiya dorilarini oling. Oyna va eshiklarni yoping.',
        'diabetes': 'Qand darajasini tez-tez tekshiring.',
        'hypertension': 'Qon bosimini kuzating. Stressdan saqlaning.',
        'copd': 'Kislorod apparatini tayyor tuting. Shifokorga murojaat qiling.',
        'respiratory': 'N95 niqob taqing. Uyda havo tozalagich ishlating.',
    }
    return recommendations.get(condition, 'Ehtiyot bo\'ling va shifokorga murojaat qiling.')


def get_general_recommendations(aqi, conditions):
    """Umumiy tavsiyalar"""
    recommendations = []

    if aqi > 50:
        recommendations.append({
            'icon': '🏠',
            'title': 'Uyda qoling',
            'description': 'Iloji boricha tashqariga chiqmang'
        })
        recommendations.append({
            'icon': '😷',
            'title': 'Niqob taqing',
            'description': 'Tashqarida N95 niqob ishlating'
        })

    if aqi > 100:
        recommendations.append({
            'icon': '💨',
            'title': 'Havo tozalagich',
            'description': 'Uyda havo tozalagich ishlating'
        })
        recommendations.append({
            'icon': '🚫',
            'title': 'Sport qilmang',
            'description': 'Ochiq havoda sport qilmang'
        })

    if aqi > 150:
        recommendations.append({
            'icon': '🏥',
            'title': 'Shifokorga murojaat',
            'description': 'Ahvol yomonlashsa darhol shifokorga boring'
        })

    if conditions:
        recommendations.append({
            'icon': '💊',
            'title': 'Dorilaringiz',
            'description': 'Zarur dorilarni yoningizda saqlang'
        })

    if not recommendations:
        recommendations.append({
            'icon': '✅',
            'title': 'Havo yaxshi',
            'description': 'Ochiq havoda faollik xavfsiz'
        })

    return recommendations


# ==================== ADMIN API ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    """Admin dashboard statistikasi"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Ruxsat yoq'}, status=403)

    today = timezone.now().date()
    month_start = today.replace(day=1)

    total_users = User.objects.filter(user_type='patient').count()
    total_doctors = User.objects.filter(user_type='doctor').count()

    try:
        from appointments.models import Appointment
        total_appointments = Appointment.objects.count()
        pending_appointments = Appointment.objects.filter(status='scheduled').count()
        today_appointments = Appointment.objects.filter(date=today).count()
    except:
        total_appointments = 0
        pending_appointments = 0
        today_appointments = 0

    try:
        from payments.models import Payment
        total_payments = Payment.objects.filter(status='completed').count()
        total_revenue = Payment.objects.filter(status='completed').aggregate(Sum('amount'))['amount__sum'] or 0
        monthly_revenue = Payment.objects.filter(
            status='completed',
            paid_at__gte=month_start
        ).aggregate(Sum('amount'))['amount__sum'] or 0
    except:
        total_payments = 0
        total_revenue = 0
        monthly_revenue = 0

    last_month = month_start - timezone.timedelta(days=1)
    last_month_start = last_month.replace(day=1)
    last_month_users = User.objects.filter(
        date_joined__lt=month_start,
        date_joined__gte=last_month_start
    ).count()

    current_month_users = User.objects.filter(date_joined__gte=month_start).count()
    users_growth = 0
    if last_month_users > 0:
        users_growth = round(((current_month_users - last_month_users) / last_month_users) * 100, 1)

    return Response({
        'total_users': total_users,
        'total_doctors': total_doctors,
        'total_appointments': total_appointments,
        'total_payments': total_payments,
        'total_revenue': float(total_revenue),
        'pending_appointments': pending_appointments,
        'today_appointments': today_appointments,
        'monthly_revenue': float(monthly_revenue),
        'users_growth': users_growth,
        'revenue_growth': 8.3
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users(request):
    """Admin - Foydalanuvchilar royxati"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Ruxsat yoq'}, status=403)

    user_type = request.GET.get('user_type', None)
    search = request.GET.get('search', '')
    limit = int(request.GET.get('limit', 50))

    users = User.objects.all().order_by('-date_joined')

    if user_type and user_type != 'all':
        users = users.filter(user_type=user_type)

    if search:
        users = users.filter(
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(phone__icontains=search)
        )

    data = [{
        'id': str(u.id) if hasattr(u.id, 'hex') else u.id,
        'email': u.email,
        'first_name': u.first_name or '',
        'last_name': u.last_name or '',
        'phone': u.phone or '',
        'user_type': u.user_type,
        'is_verified': getattr(u, 'is_verified', False),
        'is_active': u.is_active,
        'created_at': u.date_joined.isoformat(),
        'last_login': u.last_login.isoformat() if u.last_login else None
    } for u in users[:limit]]

    return Response({
        'results': data,
        'count': users.count()
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_user_delete(request, user_id):
    """Admin - Foydalanuvchini o'chirish"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Ruxsat yoq'}, status=403)

    try:
        user = User.objects.get(id=user_id)
        if user.user_type == 'admin':
            return Response({'error': 'Admin o\'chirib bo\'lmaydi'}, status=400)
        user.delete()
        return Response({'success': True})
    except User.DoesNotExist:
        return Response({'error': 'Foydalanuvchi topilmadi'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_payments(request):
    """Admin - Tolovlar royxati"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Ruxsat yoq'}, status=403)

    try:
        from payments.models import Payment
    except ImportError:
        return Response({'results': [], 'count': 0})

    status_filter = request.GET.get('status', None)
    limit = int(request.GET.get('limit', 50))

    payments = Payment.objects.select_related('user').order_by('-created_at')

    if status_filter and status_filter != 'all':
        payments = payments.filter(status=status_filter)

    data = [{
        'id': str(p.id),
        'user_email': p.user.email,
        'user_name': f"{p.user.first_name or ''} {p.user.last_name or ''}".strip() or p.user.email,
        'amount': float(p.amount),
        'status': p.status,
        'provider': p.provider,
        'payment_type': p.payment_type,
        'created_at': p.created_at.isoformat(),
        'paid_at': p.paid_at.isoformat() if p.paid_at else None
    } for p in payments[:limit]]

    return Response({
        'results': data,
        'count': payments.count()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_appointments(request):
    """Admin - Qabullar royxati"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Ruxsat yoq'}, status=403)

    try:
        from appointments.models import Appointment
        from doctors.models import Doctor
    except ImportError:
        return Response({'results': [], 'count': 0})

    status_filter = request.GET.get('status', None)
    limit = int(request.GET.get('limit', 50))

    appointments = Appointment.objects.select_related('patient', 'doctor', 'doctor__user',
                                                      'doctor__specialization').order_by('-date', '-time')

    if status_filter and status_filter != 'all':
        appointments = appointments.filter(status=status_filter)

    data = []
    for a in appointments[:limit]:
        doctor_name = 'Shifokor'
        doctor_specialty = ''

        if a.doctor:
            if hasattr(a.doctor, 'user') and a.doctor.user:
                doctor_name = f"Dr. {a.doctor.user.first_name or ''} {a.doctor.user.last_name or ''}".strip()
            if hasattr(a.doctor, 'specialization') and a.doctor.specialization:
                doctor_specialty = a.doctor.specialization.name_uz or a.doctor.specialization.name or ''

        patient_name = 'N/A'
        patient_email = ''
        if a.patient:
            patient_name = f"{a.patient.first_name or ''} {a.patient.last_name or ''}".strip() or a.patient.email
            patient_email = a.patient.email

        data.append({
            'id': str(a.id),
            'patient_name': patient_name,
            'patient_email': patient_email,
            'doctor_name': doctor_name,
            'doctor_specialty': doctor_specialty,
            'date': str(a.date),
            'time': str(a.time) if a.time else '',
            'status': a.status,
            'payment_status': getattr(a, 'payment_status', 'pending'),
            'reason': a.symptoms or a.notes or ''
        })

    return Response({
        'results': data,
        'count': appointments.count()
    })

# ============ MEDICAL DOCUMENTS ============

from medicines.models import MedicalDocument
from .serializers import MedicalDocumentSerializer, MedicalDocumentCreateSerializer
from rest_framework.parsers import MultiPartParser, FormParser


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def medical_documents(request):
    """Tibbiy hujjatlar ro'yxati va yaratish"""

    if request.method == 'GET':
        queryset = MedicalDocument.objects.filter(user=request.user)

        # Tur bo'yicha filter
        doc_type = request.GET.get('type')
        if doc_type:
            queryset = queryset.filter(document_type=doc_type)

        # Muhim hujjatlar
        is_important = request.GET.get('important')
        if is_important == 'true':
            queryset = queryset.filter(is_important=True)

        # Qidiruv
        search = request.GET.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(doctor_name__icontains=search) |
                Q(hospital_name__icontains=search)
            )

        serializer = MedicalDocumentSerializer(
            queryset,
            many=True,
            context={'request': request}
        )

        return Response({
            'count': queryset.count(),
            'documents': serializer.data
        })

    elif request.method == 'POST':
        serializer = MedicalDocumentCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            document = serializer.save()
            return Response({
                'id': str(document.id),
                'message': 'Hujjat muvaffaqiyatli yuklandi',
                'title': document.title,
            }, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def medical_document_detail(request, pk):
    """Bitta hujjat - ko'rish, yangilash, o'chirish"""

    try:
        document = MedicalDocument.objects.get(pk=pk, user=request.user)
    except MedicalDocument.DoesNotExist:
        return Response({'error': 'Hujjat topilmadi'}, status=404)

    if request.method == 'GET':
        serializer = MedicalDocumentSerializer(document, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = MedicalDocumentCreateSerializer(
            document,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Hujjat yangilandi',
                'id': str(document.id)
            })
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        # Faylni ham o'chirish
        if document.file:
            document.file.delete(save=False)
        document.delete()
        return Response({'message': 'Hujjat o\'chirildi'}, status=204)


# ============ HEALTH ANALYTICS ============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def health_statistics(request):
    """Umumiy sog'liq statistikasi"""

    period = request.GET.get('period', 'month')

    stats = {
        'period': period,
        'summary': {
            'total_appointments': 12,
            'completed_appointments': 10,
            'cancelled_appointments': 2,
            'total_spent': 1850000,
            'total_spent_display': '1,850,000 so\'m',
            'doctors_visited': 5,
            'medicines_taken': 156,
            'adherence_rate': 87,
        },
        'health_score': {
            'current': 78,
            'previous': 72,
            'change': 6,
            'trend': 'up',
            'factors': [
                {'name': 'Dori rejimi', 'score': 85, 'max': 100},
                {'name': 'Qabullar', 'score': 90, 'max': 100},
                {'name': 'Faollik', 'score': 65, 'max': 100},
                {'name': 'Uyqu', 'score': 70, 'max': 100},
            ]
        },
        'appointments_by_specialty': [
            {'specialty': 'Kardiolog', 'count': 4},
            {'specialty': 'Terapevt', 'count': 3},
            {'specialty': 'Nevrolog', 'count': 2},
            {'specialty': 'Dermatolog', 'count': 2},
            {'specialty': 'Umumiy', 'count': 1},
        ],
        'spending_by_category': [
            {'category': 'Qabullar', 'amount': 1200000},
            {'category': 'Dorilar', 'amount': 450000},
            {'category': 'Tahlillar', 'amount': 200000},
        ]
    }

    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def appointments_chart(request):
    """Qabullar grafigi"""

    data = []
    months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']

    for month in months:
        data.append({
            'month': month,
            'completed': random.randint(0, 4),
            'cancelled': random.randint(0, 1),
        })

    return Response({
        'data': data,
        'total_completed': sum(d['completed'] for d in data),
        'total_cancelled': sum(d['cancelled'] for d in data),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def spending_chart(request):
    """To'lovlar grafigi"""

    data = []
    months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']

    for month in months:
        data.append({
            'month': month,
            'appointments': random.randint(50000, 300000),
            'medicines': random.randint(20000, 150000),
            'tests': random.randint(0, 100000),
        })

    return Response({
        'data': data,
        'total': sum(d['appointments'] + d['medicines'] + d['tests'] for d in data),
    })


def get_aqi_level(aqi):
    if aqi <= 50:
        return 'good'
    elif aqi <= 100:
        return 'moderate'
    elif aqi <= 150:
        return 'sensitive'
    elif aqi <= 200:
        return 'unhealthy'
    else:
        return 'hazardous'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def air_quality_history_chart(request):
    """Havo sifati tarixi"""

    days = int(request.GET.get('days', 30))
    city = request.GET.get('city', 'Toshkent')

    data = []
    for i in range(days):
        date = timezone.now().date() - timedelta(days=days - 1 - i)
        aqi = random.randint(40, 180)
        data.append({
            'date': str(date),
            'aqi': aqi,
            'level': get_aqi_level(aqi),
        })

    aqi_values = [d['aqi'] for d in data]

    return Response({
        'city': city,
        'data': data,
        'statistics': {
            'average': round(sum(aqi_values) / len(aqi_values), 1),
            'min': min(aqi_values),
            'max': max(aqi_values),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def medicine_adherence_chart(request):
    """Dori rejimiga rioya qilish"""

    days = int(request.GET.get('days', 30))

    data = []
    for i in range(days):
        date = timezone.now().date() - timedelta(days=days - 1 - i)
        total = random.randint(2, 4)
        taken = random.randint(1, total)

        data.append({
            'date': str(date),
            'total': total,
            'taken': taken,
            'adherence': round(taken / total * 100) if total > 0 else 0,
        })

    adherence_values = [d['adherence'] for d in data]

    return Response({
        'data': data,
        'statistics': {
            'average_adherence': round(sum(adherence_values) / len(adherence_values), 1),
            'perfect_days': len([a for a in adherence_values if a == 100]),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_report(request):
    """Haftalik hisobot"""

    return Response({
        'period': {
            'start': str(timezone.now().date() - timedelta(days=7)),
            'end': str(timezone.now().date()),
        },
        'highlights': [
            {'type': 'positive', 'text': 'Dori rejimiga 90% rioya qildingiz'},
            {'type': 'positive', 'text': '2 ta qabulga bordingiz'},
            {'type': 'neutral', 'text': 'Havo sifati o\'rtacha bo\'ldi'},
            {'type': 'suggestion', 'text': 'Keyingi qabulni rejalashtiring'},
        ],
        'medicine_adherence': 90,
        'appointments_attended': 2,
        'total_spent': 300000,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_widgets(request):
    """Dashboard uchun widget ma'lumotlari"""

    return Response({
        'next_appointment': {
            'has_appointment': True,
            'doctor_name': 'Dr. Akbar Karimov',
            'specialty': 'Kardiolog',
            'date': str(timezone.now().date() + timedelta(days=3)),
            'time': '14:00',
            'days_left': 3,
        },
        'today_medicines': {
            'total': 3,
            'taken': 2,
            'pending': 1,
            'next_dose': {
                'medicine': 'Lisinopril',
                'time': '20:00',
                'dosage': '10mg',
            }
        },
        'air_quality': {
            'aqi': 85,
            'level': "O'rtacha",
            'city': 'Toshkent',
            'icon': '😐',
        },
        'health_score': {
            'score': 78,
            'trend': 'up',
            'change': 6,
        },
        'unread_messages': {
            'count': 2,
        },
        'notifications': {
            'unread_count': 3,
        }
    })