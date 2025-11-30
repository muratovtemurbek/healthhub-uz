# doctors/views.py
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone

from .models import Doctor, Specialization
from .serializers import DoctorSerializer, DoctorDetailSerializer
from accounts.models import User


# ==================== PUBLIC API ====================

class DoctorListView(generics.ListAPIView):
    """Shifokorlar ro'yxati (Public)"""
    queryset = Doctor.objects.filter(is_available=True)
    serializer_class = DoctorSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Doctor.objects.filter(is_available=True)

        specialization = self.request.GET.get('specialization', None)
        if specialization:
            queryset = queryset.filter(specialization_id=specialization)

        search = self.request.GET.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(specialization__name__icontains=search) |
                Q(specialization__name_uz__icontains=search)
            )

        return queryset.select_related('user', 'specialization', 'hospital')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        data = []
        for doctor in queryset:
            user = doctor.user
            data.append({
                'id': str(doctor.id),
                'full_name': f"Dr. {user.first_name or ''} {user.last_name or ''}".strip() if user else 'Dr.',
                'first_name': user.first_name or '' if user else '',
                'last_name': user.last_name or '' if user else '',
                'email': user.email if user else '',
                'phone': user.phone or '' if user else '',
                'specialty': doctor.specialization.name_uz if doctor.specialization else '',
                'specialty_display': doctor.specialization.name_uz if doctor.specialization else '',
                'specialization_id': str(doctor.specialization_id) if doctor.specialization_id else None,
                'experience_years': doctor.experience_years or 0,
                'rating': float(doctor.rating) if doctor.rating else 4.5,
                'consultation_fee': float(doctor.consultation_price) if doctor.consultation_price else 150000,
                'bio': doctor.bio or '',
                'photo': None,
                'hospital_name': doctor.hospital.name if doctor.hospital else 'HealthHub Clinic',
                'hospital_id': str(doctor.hospital_id) if doctor.hospital_id else None,
                'is_available': doctor.is_available,
            })

        return Response(data)


class DoctorDetailView(generics.RetrieveAPIView):
    """Shifokor tafsilotlari (Public)"""
    queryset = Doctor.objects.filter(is_available=True)
    serializer_class = DoctorDetailSerializer
    permission_classes = [AllowAny]

    def retrieve(self, request, *args, **kwargs):
        try:
            doctor = self.get_object()
            user = doctor.user

            data = {
                'id': str(doctor.id),
                'full_name': f"Dr. {user.first_name or ''} {user.last_name or ''}".strip() if user else 'Dr.',
                'first_name': user.first_name or '' if user else '',
                'last_name': user.last_name or '' if user else '',
                'email': user.email if user else '',
                'phone': user.phone or '' if user else '',
                'specialty': doctor.specialization.name_uz if doctor.specialization else '',
                'specialty_display': doctor.specialization.name_uz if doctor.specialization else '',
                'specialization_id': str(doctor.specialization_id) if doctor.specialization_id else None,
                'experience_years': doctor.experience_years or 0,
                'rating': float(doctor.rating) if doctor.rating else 4.5,
                'total_reviews': doctor.total_reviews or 0,
                'consultation_fee': float(doctor.consultation_price) if doctor.consultation_price else 150000,
                'bio': doctor.bio or '',
                'education': doctor.education or '',
                'photo': None,
                'hospital_name': doctor.hospital.name if doctor.hospital else 'HealthHub Clinic',
                'hospital_address': doctor.hospital.address if doctor.hospital else '',
                'hospital_id': str(doctor.hospital_id) if doctor.hospital_id else None,
                'languages': doctor.languages or ['O\'zbek', 'Rus'],
                'working_hours': '09:00 - 18:00',
                'is_available': doctor.is_available,
                'license_number': doctor.license_number or '',
            }

            return Response(data)
        except Doctor.DoesNotExist:
            return Response({'error': 'Shifokor topilmadi'}, status=404)


# ==================== DOCTOR PANEL API ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_stats(request):
    """Shifokor statistikasi"""
    user = request.user

    if user.user_type != 'doctor':
        return Response({'error': 'Ruxsat yoq'}, status=403)

    today = timezone.now().date()
    month_start = today.replace(day=1)

    try:
        doctor = Doctor.objects.get(user=user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile topilmadi'}, status=404)

    try:
        from appointments.models import Appointment

        total_patients = Appointment.objects.filter(doctor=doctor).values('patient').distinct().count()
        today_appointments = Appointment.objects.filter(doctor=doctor, date=today).count()
        pending_appointments = Appointment.objects.filter(doctor=doctor, status='scheduled').count()
        completed_appointments = Appointment.objects.filter(doctor=doctor, status='completed').count()
    except:
        total_patients = 0
        today_appointments = 0
        pending_appointments = 0
        completed_appointments = 0

    try:
        from payments.models import Payment
        monthly_earnings = Payment.objects.filter(
            appointment__doctor=doctor,
            status='completed',
            paid_at__gte=month_start
        ).aggregate(Sum('amount'))['amount__sum'] or 0
    except:
        fee = float(doctor.consultation_price) if doctor.consultation_price else 150000
        monthly_earnings = completed_appointments * fee

    return Response({
        'total_patients': total_patients,
        'today_appointments': today_appointments,
        'pending_appointments': pending_appointments,
        'completed_appointments': completed_appointments,
        'monthly_earnings': float(monthly_earnings),
        'rating': float(doctor.rating) if doctor.rating else 4.5
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_appointments_list(request):
    """Shifokor qabullari"""
    user = request.user

    if user.user_type != 'doctor':
        return Response({'error': 'Ruxsat yoq'}, status=403)

    try:
        doctor = Doctor.objects.get(user=user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile topilmadi'}, status=404)

    try:
        from appointments.models import Appointment
    except ImportError:
        return Response([])

    status_filter = request.GET.get('status', None)
    date_filter = request.GET.get('date', None)

    appointments = Appointment.objects.filter(doctor=doctor).select_related('patient').order_by('-date', '-time')

    if status_filter and status_filter != 'all':
        appointments = appointments.filter(status=status_filter)

    if date_filter:
        appointments = appointments.filter(date=date_filter)

    data = [{
        'id': str(a.id),
        'patient_name': f"{a.patient.first_name or ''} {a.patient.last_name or ''}".strip() or a.patient.email if a.patient else 'N/A',
        'patient_email': a.patient.email if a.patient else '',
        'patient_phone': a.patient.phone or '' if a.patient else '',
        'date': str(a.date),
        'time': str(a.time) if a.time else '',
        'status': a.status,
        'status_display': a.get_status_display() if hasattr(a, 'get_status_display') else a.status,
        'payment_status': getattr(a, 'payment_status', 'pending'),
        'reason': a.symptoms or a.notes or ''
    } for a in appointments[:100]]

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_today_appointments(request):
    """Shifokor bugungi qabullari"""
    user = request.user
    today = timezone.now().date()

    if user.user_type != 'doctor':
        return Response({'error': 'Ruxsat yoq'}, status=403)

    try:
        doctor = Doctor.objects.get(user=user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile topilmadi'}, status=404)

    try:
        from appointments.models import Appointment
    except ImportError:
        return Response([])

    appointments = Appointment.objects.filter(
        doctor=doctor,
        date=today
    ).select_related('patient').order_by('time')

    data = [{
        'id': str(a.id),
        'patient_name': f"{a.patient.first_name or ''} {a.patient.last_name or ''}".strip() or a.patient.email if a.patient else 'N/A',
        'patient_phone': a.patient.phone or '' if a.patient else '',
        'date': str(a.date),
        'time': str(a.time) if a.time else '',
        'status': a.status,
        'status_display': a.get_status_display() if hasattr(a, 'get_status_display') else a.status,
        'reason': a.symptoms or a.notes or ''
    } for a in appointments]

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_patients_list(request):
    """Shifokor bemorlari"""
    user = request.user

    if user.user_type != 'doctor':
        return Response({'error': 'Ruxsat yoq'}, status=403)

    try:
        doctor = Doctor.objects.get(user=user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile topilmadi'}, status=404)

    try:
        from appointments.models import Appointment
    except ImportError:
        return Response([])

    search = request.GET.get('search', '')

    patient_ids = Appointment.objects.filter(doctor=doctor).values_list('patient_id', flat=True).distinct()
    patients = User.objects.filter(id__in=patient_ids)

    if search:
        patients = patients.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search) |
            Q(phone__icontains=search)
        )

    data = []
    for p in patients:
        from appointments.models import Appointment
        last_appointment = Appointment.objects.filter(doctor=doctor, patient=p).order_by('-date').first()
        total_visits = Appointment.objects.filter(doctor=doctor, patient=p).count()

        data.append({
            'id': str(p.id),
            'first_name': p.first_name or '',
            'last_name': p.last_name or '',
            'email': p.email,
            'phone': p.phone or '',
            'date_of_birth': str(p.date_of_birth) if hasattr(p, 'date_of_birth') and p.date_of_birth else '',
            'gender': getattr(p, 'gender', 'male') or 'male',
            'last_visit': str(last_appointment.date) if last_appointment else '',
            'total_visits': total_visits
        })

    return Response(data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def doctor_update_appointment(request, appointment_id):
    """Shifokor - Qabulni yangilash"""
    user = request.user

    if user.user_type != 'doctor':
        return Response({'error': 'Ruxsat yoq'}, status=403)

    try:
        doctor = Doctor.objects.get(user=user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile topilmadi'}, status=404)

    try:
        from appointments.models import Appointment
        appointment = Appointment.objects.get(id=appointment_id, doctor=doctor)
    except:
        return Response({'error': 'Qabul topilmadi'}, status=404)

    new_status = request.data.get('status')
    if new_status:
        if new_status in ['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show']:
            appointment.status = new_status
            appointment.save()
            return Response({
                'success': True,
                'status': appointment.status,
                'message': f'Qabul {new_status} holatiga o\'zgartirildi'
            })
        else:
            return Response({'error': 'Noto\'g\'ri status'}, status=400)

    return Response({'error': 'Status ko\'rsatilmagan'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_profile(request):
    """Shifokor profili"""
    user = request.user

    if user.user_type != 'doctor':
        return Response({'error': 'Ruxsat yoq'}, status=403)

    try:
        doctor = Doctor.objects.get(user=user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile topilmadi'}, status=404)

    return Response({
        'id': str(doctor.id),
        'user_id': str(user.id),
        'email': user.email,
        'first_name': user.first_name or '',
        'last_name': user.last_name or '',
        'phone': user.phone or '',
        'specialty': doctor.specialization.name_uz if doctor.specialization else '',
        'specialty_display': doctor.specialization.name_uz if doctor.specialization else '',
        'experience_years': doctor.experience_years or 0,
        'rating': float(doctor.rating) if doctor.rating else 4.5,
        'consultation_fee': float(doctor.consultation_price) if doctor.consultation_price else 150000,
        'bio': doctor.bio or '',
        'photo': None,
        'hospital_name': doctor.hospital.name if doctor.hospital else '',
        'is_available': doctor.is_available,
    })


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def doctor_profile_update(request):
    """Shifokor profilini yangilash"""
    user = request.user

    if user.user_type != 'doctor':
        return Response({'error': 'Ruxsat yoq'}, status=403)

    try:
        doctor = Doctor.objects.get(user=user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile topilmadi'}, status=404)

    data = request.data

    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'phone' in data:
        user.phone = data['phone']
    user.save()

    if 'experience_years' in data:
        doctor.experience_years = data['experience_years']
    if 'consultation_fee' in data:
        doctor.consultation_price = data['consultation_fee']
    if 'bio' in data:
        doctor.bio = data['bio']
    doctor.save()

    return Response({
        'success': True,
        'message': 'Profil yangilandi'
    })


# ==================== SPECIALTIES ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def specialties_list(request):
    """Mutaxassisliklar ro'yxati"""
    specializations = Specialization.objects.all()
    data = [{'value': str(s.id), 'label': s.name_uz or s.name} for s in specializations]
    return Response(data)