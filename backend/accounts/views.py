# accounts/views.py
from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Count, Sum
from django.utils import timezone

from .models import User
from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    UserLoginSerializer, UserProfileUpdateSerializer
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
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
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
        data = request.data
        try:
            user = User.objects.create_user(
                username=data.get('username', data.get('email', '').split('@')[0]),
                email=data.get('email', ''),
                password=data.get('password', 'user123'),
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
        try:
            user = self.get_object()
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

    appointments = Appointment.objects.select_related('patient', 'doctor', 'doctor__user', 'doctor__specialization').order_by('-date', '-time')

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