# admin_panel/views.py - TO'LIQ ISHLAYDIGAN VERSIYA
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta


class IsAdminUser(BasePermission):
    """Admin yoki Superuser tekshirish"""

    def has_permission(self, request, view):
        return (
                request.user and
                request.user.is_authenticated and
                (request.user.is_staff or request.user.is_superuser or
                 getattr(request.user, 'user_type', None) == 'admin')
        )


# ============== DASHBOARD ==============

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    """Admin dashboard statistikasi"""
    from accounts.models import User
    from doctors.models import Doctor
    from appointments.models import Appointment

    today = timezone.now().date()
    month_start = today.replace(day=1)
    week_start = today - timedelta(days=today.weekday())

    # Bemorlar soni
    total_patients = User.objects.filter(user_type='patient').count()
    new_patients_month = User.objects.filter(
        user_type='patient',
        created_at__date__gte=month_start
    ).count()

    # Shifokorlar
    total_doctors = Doctor.objects.count()
    active_doctors = Doctor.objects.filter(is_available=True).count()

    # Qabullar
    total_appointments = Appointment.objects.count()
    today_appointments = Appointment.objects.filter(date=today).count()
    today_completed = Appointment.objects.filter(date=today, status='completed').count()
    today_pending = Appointment.objects.filter(date=today, status__in=['pending', 'confirmed']).count()
    today_cancelled = Appointment.objects.filter(date=today, status='cancelled').count()

    week_appointments = Appointment.objects.filter(date__gte=week_start).count()
    month_appointments = Appointment.objects.filter(date__gte=month_start).count()

    # Daromad
    total_revenue = Appointment.objects.filter(
        status='completed',
        is_paid=True
    ).aggregate(total=Sum('payment_amount'))['total'] or 0

    month_revenue = Appointment.objects.filter(
        status='completed',
        is_paid=True,
        date__gte=month_start
    ).aggregate(total=Sum('payment_amount'))['total'] or 0

    today_revenue = Appointment.objects.filter(
        status='completed',
        is_paid=True,
        date=today
    ).aggregate(total=Sum('payment_amount'))['total'] or 0

    stats = {
        # Bemorlar
        'total_patients': total_patients,
        'new_patients_month': new_patients_month,

        # Shifokorlar
        'total_doctors': total_doctors,
        'active_doctors': active_doctors,

        # Qabullar
        'total_appointments': total_appointments,
        'today_appointments': today_appointments,
        'today_completed': today_completed,
        'today_pending': today_pending,
        'today_cancelled': today_cancelled,
        'week_appointments': week_appointments,
        'month_appointments': month_appointments,

        # Daromad
        'total_revenue': float(total_revenue),
        'month_revenue': float(month_revenue),
        'today_revenue': float(today_revenue),
    }

    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_recent_activity(request):
    """So'nggi faoliyat"""
    from appointments.models import Appointment
    from accounts.models import User

    activities = []

    # So'nggi qabullar
    recent_apps = Appointment.objects.select_related(
        'patient', 'doctor__user'
    ).order_by('-created_at')[:5]

    for apt in recent_apps:
        patient_name = apt.patient.get_full_name() if apt.patient else 'Noma\'lum'
        doctor_name = f"Dr. {apt.doctor.user.get_full_name()}" if apt.doctor else ''

        activities.append({
            'id': str(apt.id),
            'type': 'appointment',
            'title': 'Yangi qabul',
            'description': f"{patient_name} - {doctor_name}",
            'time': apt.created_at.strftime('%Y-%m-%d %H:%M'),
            'status': apt.status,
        })

    # So'nggi ro'yxatdan o'tganlar
    recent_users = User.objects.filter(
        user_type='patient'
    ).order_by('-created_at')[:5]

    for user in recent_users:
        activities.append({
            'id': str(user.id),
            'type': 'registration',
            'title': 'Yangi ro\'yxatdan o\'tish',
            'description': user.get_full_name() or user.email,
            'time': user.created_at.strftime('%Y-%m-%d %H:%M'),
            'status': 'new',
        })

    # Vaqt bo'yicha saralash
    activities.sort(key=lambda x: x['time'], reverse=True)

    return Response(activities[:10])


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_top_doctors(request):
    """Top shifokorlar"""
    from doctors.models import Doctor
    from appointments.models import Appointment

    doctors = Doctor.objects.select_related('user', 'specialization').annotate(
        patients_count=Count('doctor_appointments__patient', distinct=True),
        appointments_count=Count('doctor_appointments')
    ).order_by('-rating', '-patients_count')[:10]

    data = []
    for doctor in doctors:
        data.append({
            'id': str(doctor.id),
            'name': f"Dr. {doctor.user.get_full_name()}",
            'specialty': doctor.specialization.name_uz,
            'avatar': doctor.user.avatar.url if doctor.user.avatar else None,
            'patients': doctor.patients_count,
            'appointments': doctor.appointments_count,
            'rating': float(doctor.rating),
        })

    return Response(data)


# ============== DOCTORS MANAGEMENT ==============

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_doctors_list(request):
    """Shifokorlar ro'yxati"""
    from doctors.models import Doctor

    queryset = Doctor.objects.select_related('user', 'specialization', 'hospital')

    # Status filter
    status_filter = request.query_params.get('status')
    if status_filter == 'active':
        queryset = queryset.filter(is_available=True)
    elif status_filter == 'inactive':
        queryset = queryset.filter(is_available=False)

    # Search
    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search) |
            Q(specialization__name_uz__icontains=search)
        )

    data = []
    for doctor in queryset.order_by('-created_at'):
        patients_count = doctor.doctor_appointments.values('patient').distinct().count()

        data.append({
            'id': str(doctor.id),
            'name': f"Dr. {doctor.user.get_full_name()}",
            'email': doctor.user.email,
            'phone': doctor.user.phone,
            'avatar': doctor.user.avatar.url if doctor.user.avatar else None,
            'specialization': doctor.specialization.name_uz,
            'hospital': doctor.hospital.name,
            'experience': doctor.experience_years,
            'rating': float(doctor.rating),
            'patients_count': patients_count,
            'status': 'active' if doctor.is_available else 'inactive',
            'joined': doctor.created_at.strftime('%Y-%m-%d'),
        })

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_doctor_detail(request, pk):
    """Shifokor tafsilotlari"""
    from doctors.models import Doctor

    try:
        doctor = Doctor.objects.select_related(
            'user', 'specialization', 'hospital'
        ).get(pk=pk)

        data = {
            'id': str(doctor.id),
            'name': f"Dr. {doctor.user.get_full_name()}",
            'first_name': doctor.user.first_name,
            'last_name': doctor.user.last_name,
            'email': doctor.user.email,
            'phone': doctor.user.phone,
            'avatar': doctor.user.avatar.url if doctor.user.avatar else None,
            'specialization': doctor.specialization.name_uz,
            'specialization_id': doctor.specialization.id,
            'hospital': doctor.hospital.name,
            'hospital_id': str(doctor.hospital.id),
            'experience_years': doctor.experience_years,
            'education': doctor.education,
            'bio': doctor.bio,
            'license_number': doctor.license_number,
            'consultation_price': float(doctor.consultation_price),
            'rating': float(doctor.rating),
            'total_reviews': doctor.total_reviews,
            'is_available': doctor.is_available,
            'languages': doctor.languages,
            'created_at': doctor.created_at.strftime('%Y-%m-%d'),
        }
        return Response(data)
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=404)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_doctor_activate(request, pk):
    """Shifokorni faollashtirish"""
    from doctors.models import Doctor

    try:
        doctor = Doctor.objects.get(pk=pk)
        doctor.is_available = True
        doctor.save()
        return Response({'status': 'activated'})
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=404)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_doctor_deactivate(request, pk):
    """Shifokorni o'chirish"""
    from doctors.models import Doctor

    try:
        doctor = Doctor.objects.get(pk=pk)
        doctor.is_available = False
        doctor.save()
        return Response({'status': 'deactivated'})
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=404)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_doctors_stats(request):
    """Shifokorlar statistikasi"""
    from doctors.models import Doctor

    total = Doctor.objects.count()
    active = Doctor.objects.filter(is_available=True).count()
    inactive = Doctor.objects.filter(is_available=False).count()

    month_start = timezone.now().date().replace(day=1)
    new_this_month = Doctor.objects.filter(created_at__date__gte=month_start).count()

    return Response({
        'total': total,
        'active': active,
        'inactive': inactive,
        'new_this_month': new_this_month,
    })


# ============== PATIENTS MANAGEMENT ==============

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_patients_list(request):
    """Bemorlar ro'yxati"""
    from accounts.models import User
    from appointments.models import Appointment

    queryset = User.objects.filter(user_type='patient')

    # Status filter
    status_filter = request.query_params.get('status')
    if status_filter == 'active':
        queryset = queryset.filter(is_active=True)
    elif status_filter == 'inactive':
        queryset = queryset.filter(is_active=False)

    # Search
    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(phone__icontains=search) |
            Q(email__icontains=search)
        )

    data = []
    for patient in queryset.order_by('-created_at')[:100]:
        # Yosh
        age = None
        if patient.birth_date:
            today = timezone.now().date()
            born = patient.birth_date
            age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))

        # Tashriflar
        total_visits = Appointment.objects.filter(patient=patient).count()
        last_visit = Appointment.objects.filter(patient=patient).order_by('-date').first()

        data.append({
            'id': str(patient.id),
            'name': patient.get_full_name() or patient.email,
            'email': patient.email,
            'phone': patient.phone,
            'avatar': patient.avatar.url if patient.avatar else None,
            'age': age,
            'gender': patient.gender,
            'address': patient.address,
            'total_visits': total_visits,
            'last_visit': last_visit.date.strftime('%Y-%m-%d') if last_visit else None,
            'status': 'active' if patient.is_active else 'inactive',
            'registered': patient.created_at.strftime('%Y-%m-%d'),
        })

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_patient_detail(request, pk):
    """Bemor tafsilotlari"""
    from accounts.models import User
    from appointments.models import Appointment, MedicalRecord

    try:
        patient = User.objects.get(pk=pk, user_type='patient')

        # Yosh
        age = None
        if patient.birth_date:
            today = timezone.now().date()
            born = patient.birth_date
            age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))

        # Tashriflar
        visits = Appointment.objects.filter(patient=patient).order_by('-date')[:10]
        visits_data = [{
            'id': str(v.id),
            'date': v.date.strftime('%Y-%m-%d'),
            'doctor': f"Dr. {v.doctor.user.get_full_name()}" if v.doctor else '',
            'reason': v.reason,
            'status': v.status,
        } for v in visits]

        data = {
            'id': str(patient.id),
            'name': patient.get_full_name(),
            'first_name': patient.first_name,
            'last_name': patient.last_name,
            'email': patient.email,
            'phone': patient.phone,
            'avatar': patient.avatar.url if patient.avatar else None,
            'age': age,
            'birth_date': patient.birth_date.strftime('%Y-%m-%d') if patient.birth_date else None,
            'gender': patient.gender,
            'blood_type': patient.blood_type,
            'address': patient.address,
            'allergies': patient.allergies,
            'chronic_diseases': patient.chronic_diseases,
            'emergency_contact': patient.emergency_contact,
            'is_active': patient.is_active,
            'is_verified': patient.is_verified,
            'visits': visits_data,
            'total_visits': Appointment.objects.filter(patient=patient).count(),
            'registered': patient.created_at.strftime('%Y-%m-%d'),
        }
        return Response(data)
    except User.DoesNotExist:
        return Response({'error': 'Bemor topilmadi'}, status=404)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_patient_activate(request, pk):
    """Bemorni faollashtirish"""
    from accounts.models import User

    try:
        patient = User.objects.get(pk=pk)
        patient.is_active = True
        patient.save()
        return Response({'status': 'activated'})
    except User.DoesNotExist:
        return Response({'error': 'Bemor topilmadi'}, status=404)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_patient_deactivate(request, pk):
    """Bemorni bloklash"""
    from accounts.models import User

    try:
        patient = User.objects.get(pk=pk)
        patient.is_active = False
        patient.save()
        return Response({'status': 'deactivated'})
    except User.DoesNotExist:
        return Response({'error': 'Bemor topilmadi'}, status=404)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_patients_stats(request):
    """Bemorlar statistikasi"""
    from accounts.models import User

    total = User.objects.filter(user_type='patient').count()
    active = User.objects.filter(user_type='patient', is_active=True).count()
    inactive = User.objects.filter(user_type='patient', is_active=False).count()

    week_start = timezone.now().date() - timedelta(days=timezone.now().date().weekday())
    month_start = timezone.now().date().replace(day=1)

    new_this_week = User.objects.filter(
        user_type='patient',
        created_at__date__gte=week_start
    ).count()

    new_this_month = User.objects.filter(
        user_type='patient',
        created_at__date__gte=month_start
    ).count()

    return Response({
        'total': total,
        'active': active,
        'inactive': inactive,
        'new_this_week': new_this_week,
        'new_this_month': new_this_month,
    })


# ============== APPOINTMENTS MANAGEMENT ==============

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_appointments_list(request):
    """Qabullar ro'yxati"""
    from appointments.models import Appointment

    queryset = Appointment.objects.select_related('patient', 'doctor__user', 'doctor__specialization')

    # Status filter
    status_filter = request.query_params.get('status')
    if status_filter and status_filter != 'all':
        queryset = queryset.filter(status=status_filter)

    # Date filter
    date = request.query_params.get('date')
    if date:
        queryset = queryset.filter(date=date)

    # Date range
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    if start_date and end_date:
        queryset = queryset.filter(date__range=[start_date, end_date])

    # Search
    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(
            Q(patient__first_name__icontains=search) |
            Q(patient__last_name__icontains=search) |
            Q(doctor__user__first_name__icontains=search) |
            Q(doctor__user__last_name__icontains=search)
        )

    data = []
    for apt in queryset.order_by('-date', '-time')[:100]:
        data.append({
            'id': str(apt.id),
            'patient_name': apt.patient.get_full_name() if apt.patient else 'Noma\'lum',
            'doctor_name': f"Dr. {apt.doctor.user.get_full_name()}" if apt.doctor else '',
            'specialty': apt.doctor.specialization.name_uz if apt.doctor else '',
            'date': apt.date.strftime('%Y-%m-%d'),
            'time': apt.time.strftime('%H:%M'),
            'reason': apt.reason,
            'status': apt.status,
            'is_paid': apt.is_paid,
            'payment_amount': float(apt.payment_amount) if apt.payment_amount else None,
        })

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_appointment_confirm(request, pk):
    """Qabulni tasdiqlash"""
    from appointments.models import Appointment

    try:
        apt = Appointment.objects.get(pk=pk)
        apt.status = 'confirmed'
        apt.save()
        return Response({'status': 'confirmed'})
    except Appointment.DoesNotExist:
        return Response({'error': 'Qabul topilmadi'}, status=404)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_appointment_cancel(request, pk):
    """Qabulni bekor qilish"""
    from appointments.models import Appointment

    try:
        apt = Appointment.objects.get(pk=pk)
        apt.status = 'cancelled'
        apt.save()
        return Response({'status': 'cancelled'})
    except Appointment.DoesNotExist:
        return Response({'error': 'Qabul topilmadi'}, status=404)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_appointments_stats(request):
    """Qabullar statistikasi"""
    from appointments.models import Appointment

    today = timezone.now().date()

    total = Appointment.objects.count()
    completed = Appointment.objects.filter(status='completed').count()
    pending = Appointment.objects.filter(status__in=['pending', 'confirmed']).count()
    cancelled = Appointment.objects.filter(status='cancelled').count()

    today_total = Appointment.objects.filter(date=today).count()
    today_completed = Appointment.objects.filter(date=today, status='completed').count()

    total_revenue = Appointment.objects.filter(
        status='completed',
        is_paid=True
    ).aggregate(total=Sum('payment_amount'))['total'] or 0

    return Response({
        'total': total,
        'completed': completed,
        'pending': pending,
        'cancelled': cancelled,
        'today_total': today_total,
        'today_completed': today_completed,
        'total_revenue': float(total_revenue),
    })


# ============== HOSPITALS MANAGEMENT ==============

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_hospitals_list(request):
    """Shifoxonalar ro'yxati"""
    from doctors.models import Hospital

    hospitals = Hospital.objects.all().order_by('-rating', 'name')

    data = []
    for h in hospitals:
        doctors_count = h.doctors.count()

        data.append({
            'id': str(h.id),
            'name': h.name,
            'type': h.type,
            'type_display': h.get_type_display(),
            'address': h.address,
            'city': h.city,
            'phone': h.phone,
            'email': h.email,
            'rating': float(h.rating),
            'is_24_7': h.is_24_7,
            'has_emergency': h.has_emergency,
            'doctors_count': doctors_count,
            'image': h.image.url if h.image else None,
        })

    return Response(data)


# ============== SETTINGS ==============

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_settings(request):
    """Tizim sozlamalari"""
    # Bu keyinchalik Settings modeldan olinadi
    settings = {
        'clinic_name': 'HealthHub UZ',
        'clinic_email': 'info@healthhub.uz',
        'clinic_phone': '+998 71 123 45 67',
        'clinic_address': 'Toshkent sh., Yunusobod tumani',
        'working_hours': '09:00 - 18:00',
        'language': 'uz',
        'email_notifications': True,
        'sms_notifications': True,
        'maintenance_mode': False,
    }
    return Response(settings)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def admin_settings_update(request):
    """Tizim sozlamalarini yangilash"""
    # Bu keyinchalik Settings modelga saqlanadi
    return Response({'status': 'updated'})


# ============== DOCTOR CREATE ==============

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_doctor_create(request):
    """Yangi shifokor qo'shish"""
    import random
    import string
    from accounts.models import User
    from doctors.models import Doctor, Specialization, Hospital

    data = request.data

    # Required fields
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    specialization_id = data.get('specialization_id')
    hospital_id = data.get('hospital_id')
    license_number = data.get('license_number')

    if not all([email, first_name, last_name, specialization_id, hospital_id, license_number]):
        return Response({
            'error': 'Barcha maydonlar to\'ldirilishi shart'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check email unique
    if User.objects.filter(email=email).exists():
        return Response({
            'error': 'Bu email allaqachon ro\'yxatdan o\'tgan'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check license unique
    if Doctor.objects.filter(license_number=license_number).exists():
        return Response({
            'error': 'Bu litsenziya raqami allaqachon mavjud'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        specialization = Specialization.objects.get(id=specialization_id)
        hospital = Hospital.objects.get(id=hospital_id)
    except (Specialization.DoesNotExist, Hospital.DoesNotExist):
        return Response({
            'error': 'Mutaxassislik yoki shifoxona topilmadi'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Generate random password
    password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

    # Create username from email
    username = email.split('@')[0]
    counter = 1
    base_username = username
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1

    user = User.objects.create_user(
        email=email,
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        phone=data.get('phone', ''),
        user_type='doctor'
    )

    # Create doctor profile
    doctor = Doctor.objects.create(
        user=user,
        specialization=specialization,
        hospital=hospital,
        license_number=license_number,
        experience_years=data.get('experience_years', 0),
        education=data.get('education', ''),
        bio=data.get('bio', ''),
        consultation_price=data.get('consultation_price', 100000),
        languages=data.get('languages', ['uz']),
        is_available=data.get('is_available', True),
        # Default working hours
        monday={'start': '09:00', 'end': '18:00'},
        tuesday={'start': '09:00', 'end': '18:00'},
        wednesday={'start': '09:00', 'end': '18:00'},
        thursday={'start': '09:00', 'end': '18:00'},
        friday={'start': '09:00', 'end': '18:00'},
        saturday={},
        sunday={},
    )

    return Response({
        'id': str(doctor.id),
        'name': f"Dr. {user.get_full_name()}",
        'email': user.email,
        'password': password,  # Parolni qaytarish
        'message': 'Shifokor muvaffaqiyatli qo\'shildi!'
    }, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def admin_doctor_update(request, pk):
    """Shifokorni tahrirlash"""
    from accounts.models import User
    from doctors.models import Doctor, Specialization, Hospital

    try:
        doctor = Doctor.objects.select_related('user').get(pk=pk)
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    user = doctor.user

    # Update user fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'phone' in data:
        user.phone = data['phone']
    if 'email' in data and data['email'] != user.email:
        if User.objects.filter(email=data['email']).exclude(pk=user.pk).exists():
            return Response({'error': 'Bu email allaqachon band'}, status=status.HTTP_400_BAD_REQUEST)
        user.email = data['email']
    user.save()

    # Update doctor fields
    if 'specialization_id' in data:
        try:
            doctor.specialization = Specialization.objects.get(id=data['specialization_id'])
        except Specialization.DoesNotExist:
            pass
    if 'hospital_id' in data:
        try:
            doctor.hospital = Hospital.objects.get(id=data['hospital_id'])
        except Hospital.DoesNotExist:
            pass
    if 'license_number' in data:
        if Doctor.objects.filter(license_number=data['license_number']).exclude(pk=pk).exists():
            return Response({'error': 'Bu litsenziya raqami band'}, status=status.HTTP_400_BAD_REQUEST)
        doctor.license_number = data['license_number']
    if 'experience_years' in data:
        doctor.experience_years = data['experience_years']
    if 'education' in data:
        doctor.education = data['education']
    if 'bio' in data:
        doctor.bio = data['bio']
    if 'consultation_price' in data:
        doctor.consultation_price = data['consultation_price']
    if 'is_available' in data:
        doctor.is_available = data['is_available']
    if 'languages' in data:
        doctor.languages = data['languages']

    doctor.save()

    return Response({
        'id': str(doctor.id),
        'message': 'Shifokor yangilandi'
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_doctor_reset_password(request, pk):
    """Shifokor parolini yangilash"""
    import random
    import string
    from doctors.models import Doctor

    try:
        doctor = Doctor.objects.select_related('user').get(pk=pk)
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    # Generate new password
    new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    doctor.user.set_password(new_password)
    doctor.user.save()

    return Response({
        'email': doctor.user.email,
        'password': new_password,
        'message': 'Parol yangilandi'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_specializations_list(request):
    """Mutaxassisliklar ro'yxati"""
    from doctors.models import Specialization

    specs = Specialization.objects.all()
    data = [{
        'id': s.id,
        'name': s.name,
        'name_uz': s.name_uz,
    } for s in specs]

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_hospitals_dropdown(request):
    """Shifoxonalar dropdown uchun"""
    from doctors.models import Hospital

    hospitals = Hospital.objects.all()
    data = [{
        'id': str(h.id),
        'name': h.name,
        'type': h.get_type_display(),
    } for h in hospitals]

    return Response(data)