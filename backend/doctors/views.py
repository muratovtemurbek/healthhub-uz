# doctors/views.py - TO'LIQ ISHLAYDIGAN VERSIYA
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Doctor, DoctorReview, Specialization, Hospital
from .serializers import (
    DoctorSerializer, DoctorDetailSerializer,
    DoctorReviewSerializer, SpecializationSerializer
)
from appointments.models import Appointment, MedicalRecord, Prescription


# ============== PUBLIC ENDPOINTS ==============

class SpecializationViewSet(viewsets.ReadOnlyModelViewSet):
    """Mutaxassisliklar ro'yxati"""
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = [AllowAny]


class PublicDoctorViewSet(viewsets.ReadOnlyModelViewSet):
    """Bemorlar uchun shifokorlar ro'yxati"""
    queryset = Doctor.objects.filter(is_available=True)
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Doctor.objects.filter(is_available=True).select_related(
            'user', 'specialization', 'hospital'
        )

        # Filter by specialization
        spec_id = self.request.query_params.get('specialization')
        if spec_id:
            queryset = queryset.filter(specialization_id=spec_id)

        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search)
            )

        # Filter by rating
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.filter(rating__gte=float(min_rating))

        # Filter by hospital
        hospital_id = self.request.query_params.get('hospital')
        if hospital_id:
            queryset = queryset.filter(hospital_id=hospital_id)

        return queryset

    def list(self, request):
        queryset = self.get_queryset()
        data = []
        for doctor in queryset:
            data.append({
                'id': str(doctor.id),
                'name': f"Dr. {doctor.user.get_full_name()}",
                'specialization': doctor.specialization.name_uz,
                'specialization_id': doctor.specialization.id,
                'hospital': doctor.hospital.name,
                'hospital_id': str(doctor.hospital.id),
                'experience_years': doctor.experience_years,
                'rating': float(doctor.rating),
                'total_reviews': doctor.total_reviews,
                'consultation_price': float(doctor.consultation_price),
                'is_available': doctor.is_available,
                'avatar': doctor.user.avatar.url if doctor.user.avatar else None,
                'languages': doctor.languages,
            })
        return Response(data)

    def retrieve(self, request, pk=None):
        try:
            doctor = Doctor.objects.select_related(
                'user', 'specialization', 'hospital'
            ).get(pk=pk)

            # Reviews
            reviews = DoctorReview.objects.filter(doctor=doctor).select_related('patient')[:5]
            reviews_data = [{
                'id': str(r.id),
                'patient_name': r.patient.get_full_name(),
                'rating': r.rating,
                'comment': r.comment,
                'created_at': r.created_at.strftime('%Y-%m-%d'),
            } for r in reviews]

            # Working hours
            schedule = {
                'monday': doctor.monday,
                'tuesday': doctor.tuesday,
                'wednesday': doctor.wednesday,
                'thursday': doctor.thursday,
                'friday': doctor.friday,
                'saturday': doctor.saturday,
                'sunday': doctor.sunday,
            }

            data = {
                'id': str(doctor.id),
                'name': f"Dr. {doctor.user.get_full_name()}",
                'email': doctor.user.email,
                'phone': doctor.user.phone,
                'specialization': doctor.specialization.name_uz,
                'specialization_id': doctor.specialization.id,
                'hospital': {
                    'id': str(doctor.hospital.id),
                    'name': doctor.hospital.name,
                    'address': doctor.hospital.address,
                    'phone': doctor.hospital.phone,
                },
                'experience_years': doctor.experience_years,
                'education': doctor.education,
                'bio': doctor.bio,
                'rating': float(doctor.rating),
                'total_reviews': doctor.total_reviews,
                'consultation_price': float(doctor.consultation_price),
                'is_available': doctor.is_available,
                'avatar': doctor.user.avatar.url if doctor.user.avatar else None,
                'languages': doctor.languages,
                'schedule': schedule,
                'reviews': reviews_data,
            }
            return Response(data)
        except Doctor.DoesNotExist:
            return Response({'error': 'Shifokor topilmadi'}, status=404)

    @action(detail=True, methods=['get'])
    def available_slots(self, request, pk=None):
        """Bo'sh vaqtlarni olish"""
        try:
            doctor = Doctor.objects.get(pk=pk)
            date_str = request.query_params.get('date')

            if not date_str:
                return Response({'error': 'Sana ko\'rsatilmagan'}, status=400)

            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            day_name = date.strftime('%A').lower()

            # Shifokor ish vaqti
            working_hours = getattr(doctor, day_name, {})
            if not working_hours or not working_hours.get('start'):
                return Response({'slots': [], 'message': 'Bu kunda shifokor ishlamaydi'})

            start_time = datetime.strptime(working_hours['start'], '%H:%M')
            end_time = datetime.strptime(working_hours['end'], '%H:%M')

            # Band vaqtlar
            booked = Appointment.objects.filter(
                doctor=doctor,
                date=date,
                status__in=['pending', 'confirmed']
            ).values_list('time', flat=True)

            booked_times = [t.strftime('%H:%M') for t in booked]

            # Bo'sh slotlar (30 daqiqalik)
            slots = []
            current = start_time
            while current < end_time:
                time_str = current.strftime('%H:%M')
                slots.append({
                    'time': time_str,
                    'available': time_str not in booked_times
                })
                current += timedelta(minutes=30)

            return Response({'slots': slots})
        except Doctor.DoesNotExist:
            return Response({'error': 'Shifokor topilmadi'}, status=404)


# ============== DOCTOR PANEL ENDPOINTS ==============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_me(request):
    """Joriy shifokor ma'lumotlari"""
    try:
        doctor = Doctor.objects.select_related(
            'user', 'specialization', 'hospital'
        ).get(user=request.user)

        data = {
            'id': str(doctor.id),
            'name': f"Dr. {doctor.user.get_full_name()}",
            'first_name': doctor.user.first_name,
            'last_name': doctor.user.last_name,
            'email': doctor.user.email,
            'phone': doctor.user.phone,
            'specialization': doctor.specialization.name_uz,
            'specialization_id': doctor.specialization.id,
            'hospital': doctor.hospital.name,
            'hospital_id': str(doctor.hospital.id),
            'experience_years': doctor.experience_years,
            'education': doctor.education,
            'bio': doctor.bio,
            'rating': float(doctor.rating),
            'total_reviews': doctor.total_reviews,
            'consultation_price': float(doctor.consultation_price),
            'is_available': doctor.is_available,
            'avatar': doctor.user.avatar.url if doctor.user.avatar else None,
            'languages': doctor.languages,
            'license_number': doctor.license_number,
        }
        return Response(data)
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=404)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def doctor_update_profile(request):
    """Shifokor profilini yangilash"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        user = doctor.user
        data = request.data

        # User ma'lumotlari
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        user.save()

        # Doctor ma'lumotlari
        if 'bio' in data:
            doctor.bio = data['bio']
        if 'education' in data:
            doctor.education = data['education']
        if 'consultation_price' in data:
            doctor.consultation_price = data['consultation_price']
        if 'is_available' in data:
            doctor.is_available = data['is_available']
        if 'languages' in data:
            doctor.languages = data['languages']
        doctor.save()

        return Response({'status': 'updated'})
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_dashboard_stats(request):
    """Dashboard statistikasi"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        today = timezone.now().date()
        month_start = today.replace(day=1)

        # Bugungi qabullar
        today_apps = Appointment.objects.filter(doctor=doctor, date=today)

        # Oylik daromad
        monthly_income = Appointment.objects.filter(
            doctor=doctor,
            date__gte=month_start,
            status='completed',
            is_paid=True
        ).aggregate(total=Sum('payment_amount'))['total'] or 0

        # Jami bemorlar
        total_patients = Appointment.objects.filter(
            doctor=doctor
        ).values('patient').distinct().count()

        stats = {
            'today_appointments': today_apps.count(),
            'today_completed': today_apps.filter(status='completed').count(),
            'today_pending': today_apps.filter(status__in=['pending', 'confirmed']).count(),
            'today_cancelled': today_apps.filter(status='cancelled').count(),
            'total_patients': total_patients,
            'monthly_income': float(monthly_income),
            'rating': float(doctor.rating),
            'total_reviews': doctor.total_reviews,
        }
        return Response(stats)
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_today_schedule(request):
    """Bugungi jadval"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        today = timezone.now().date()

        appointments = Appointment.objects.filter(
            doctor=doctor,
            date=today
        ).select_related('patient').order_by('time')

        data = []
        for apt in appointments:
            data.append({
                'id': str(apt.id),
                'time': apt.time.strftime('%H:%M'),
                'patient_name': apt.patient.get_full_name() if apt.patient else 'Noma\'lum',
                'patient_phone': apt.patient.phone if apt.patient else '',
                'patient_avatar': apt.patient.avatar.url if apt.patient and apt.patient.avatar else None,
                'reason': apt.reason,
                'symptoms': apt.symptoms,
                'status': apt.status,
                'is_paid': apt.is_paid,
            })
        return Response(data)
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_recent_patients(request):
    """So'nggi bemorlar"""
    try:
        doctor = Doctor.objects.get(user=request.user)

        # Oxirgi 20 ta qabul
        recent_apps = Appointment.objects.filter(
            doctor=doctor
        ).select_related('patient').order_by('-date', '-time')[:20]

        seen = set()
        patients = []

        for apt in recent_apps:
            if apt.patient and apt.patient.id not in seen and len(patients) < 5:
                seen.add(apt.patient.id)

                # Oxirgi tashxis
                last_record = MedicalRecord.objects.filter(
                    patient=apt.patient,
                    doctor=request.user
                ).order_by('-record_date').first()

                patients.append({
                    'id': str(apt.patient.id),
                    'name': apt.patient.get_full_name(),
                    'phone': apt.patient.phone,
                    'avatar': apt.patient.avatar.url if apt.patient.avatar else None,
                    'last_visit': apt.date.strftime('%Y-%m-%d'),
                    'last_diagnosis': last_record.title if last_record else 'Belgilanmagan',
                })

        return Response(patients)
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=404)


# ============== DOCTOR APPOINTMENTS ==============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_appointments(request):
    """Shifokor qabullari"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        queryset = Appointment.objects.filter(doctor=doctor).select_related('patient')

        # Filters
        date = request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)

        status_filter = request.query_params.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])

        data = []
        for apt in queryset.order_by('-date', '-time'):
            # Yosh hisoblash
            age = None
            if apt.patient and apt.patient.birth_date:
                today = timezone.now().date()
                born = apt.patient.birth_date
                age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))

            data.append({
                'id': str(apt.id),
                'patient_id': str(apt.patient.id) if apt.patient else None,
                'patient_name': apt.patient.get_full_name() if apt.patient else 'Noma\'lum',
                'patient_phone': apt.patient.phone if apt.patient else '',
                'patient_age': age,
                'patient_avatar': apt.patient.avatar.url if apt.patient and apt.patient.avatar else None,
                'date': apt.date.strftime('%Y-%m-%d'),
                'time': apt.time.strftime('%H:%M'),
                'reason': apt.reason,
                'symptoms': apt.symptoms,
                'notes': apt.notes,
                'status': apt.status,
                'is_paid': apt.is_paid,
                'payment_amount': float(apt.payment_amount) if apt.payment_amount else None,
            })

        return Response(data)
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_appointment_detail(request, pk):
    """Qabul tafsilotlari"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        apt = Appointment.objects.select_related('patient').get(pk=pk, doctor=doctor)

        # Bemor tarixi
        patient_history = []
        if apt.patient:
            prev_apps = Appointment.objects.filter(
                doctor=doctor,
                patient=apt.patient
            ).exclude(pk=pk).order_by('-date')[:5]

            for p in prev_apps:
                patient_history.append({
                    'date': p.date.strftime('%Y-%m-%d'),
                    'reason': p.reason,
                    'status': p.status,
                })

        data = {
            'id': str(apt.id),
            'patient': {
                'id': str(apt.patient.id) if apt.patient else None,
                'name': apt.patient.get_full_name() if apt.patient else 'Noma\'lum',
                'phone': apt.patient.phone if apt.patient else '',
                'email': apt.patient.email if apt.patient else '',
                'birth_date': apt.patient.birth_date.strftime(
                    '%Y-%m-%d') if apt.patient and apt.patient.birth_date else None,
                'gender': apt.patient.gender if apt.patient else '',
                'blood_type': apt.patient.blood_type if apt.patient else '',
                'allergies': apt.patient.allergies if apt.patient else [],
                'chronic_diseases': apt.patient.chronic_diseases if apt.patient else [],
            } if apt.patient else None,
            'date': apt.date.strftime('%Y-%m-%d'),
            'time': apt.time.strftime('%H:%M'),
            'reason': apt.reason,
            'symptoms': apt.symptoms,
            'notes': apt.notes,
            'status': apt.status,
            'is_paid': apt.is_paid,
            'payment_amount': float(apt.payment_amount) if apt.payment_amount else None,
            'patient_history': patient_history,
        }
        return Response(data)
    except (Doctor.DoesNotExist, Appointment.DoesNotExist):
        return Response({'error': 'Topilmadi'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def doctor_appointment_confirm(request, pk):
    """Qabulni tasdiqlash"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        apt = Appointment.objects.get(pk=pk, doctor=doctor)

        if apt.status == 'pending':
            apt.status = 'confirmed'
            apt.save()
            return Response({'status': 'confirmed'})
        return Response({'error': 'Bu qabulni tasdiqlab bo\'lmaydi'}, status=400)
    except (Doctor.DoesNotExist, Appointment.DoesNotExist):
        return Response({'error': 'Topilmadi'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def doctor_appointment_complete(request, pk):
    """Qabulni yakunlash"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        apt = Appointment.objects.get(pk=pk, doctor=doctor)

        if apt.status in ['pending', 'confirmed']:
            apt.status = 'completed'
            apt.notes = request.data.get('notes', apt.notes)
            apt.save()

            # Tibbiy yozuv yaratish
            diagnosis = request.data.get('diagnosis')
            if diagnosis and apt.patient:
                MedicalRecord.objects.create(
                    patient=apt.patient,
                    doctor=request.user,
                    appointment=apt,
                    record_type='consultation',
                    title=diagnosis,
                    description=request.data.get('description', ''),
                    record_date=apt.date,
                )

            # Retsept yaratish
            medications = request.data.get('medications')
            if medications and apt.patient:
                Prescription.objects.create(
                    appointment=apt,
                    doctor=request.user,
                    patient=apt.patient,
                    diagnosis=diagnosis or apt.reason,
                    medications=medications,
                    instructions=request.data.get('instructions', ''),
                )

            return Response({'status': 'completed'})
        return Response({'error': 'Bu qabulni yakunlab bo\'lmaydi'}, status=400)
    except (Doctor.DoesNotExist, Appointment.DoesNotExist):
        return Response({'error': 'Topilmadi'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def doctor_appointment_cancel(request, pk):
    """Qabulni bekor qilish"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        apt = Appointment.objects.get(pk=pk, doctor=doctor)

        if apt.status not in ['completed', 'cancelled']:
            apt.status = 'cancelled'
            apt.notes = request.data.get('reason', '')
            apt.save()
            return Response({'status': 'cancelled'})
        return Response({'error': 'Bu qabulni bekor qilib bo\'lmaydi'}, status=400)
    except (Doctor.DoesNotExist, Appointment.DoesNotExist):
        return Response({'error': 'Topilmadi'}, status=404)


# ============== DOCTOR PATIENTS ==============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_patients(request):
    """Shifokor bemorlari"""
    try:
        doctor = Doctor.objects.get(user=request.user)

        # Unique bemorlar
        patient_ids = Appointment.objects.filter(
            doctor=doctor
        ).values_list('patient_id', flat=True).distinct()

        from accounts.models import User
        queryset = User.objects.filter(id__in=patient_ids)

        # Search
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(phone__icontains=search)
            )

        data = []
        for patient in queryset:
            # Tashriflar
            visits = Appointment.objects.filter(doctor=doctor, patient=patient)
            last_visit = visits.order_by('-date').first()

            # Yosh
            age = None
            if patient.birth_date:
                today = timezone.now().date()
                born = patient.birth_date
                age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))

            data.append({
                'id': str(patient.id),
                'name': patient.get_full_name(),
                'phone': patient.phone,
                'email': patient.email,
                'age': age,
                'gender': patient.gender,
                'blood_type': patient.blood_type,
                'avatar': patient.avatar.url if patient.avatar else None,
                'total_visits': visits.count(),
                'last_visit': last_visit.date.strftime('%Y-%m-%d') if last_visit else None,
            })

        return Response(data)
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_patient_detail(request, pk):
    """Bemor tafsilotlari"""
    try:
        doctor = Doctor.objects.get(user=request.user)

        from accounts.models import User
        patient = User.objects.get(pk=pk)

        # Tashrif borligini tekshirish
        if not Appointment.objects.filter(doctor=doctor, patient=patient).exists():
            return Response({'error': 'Bu bemor sizga tegishli emas'}, status=403)

        # Tashriflar
        visits = Appointment.objects.filter(
            doctor=doctor, patient=patient
        ).order_by('-date')

        visits_data = [{
            'id': str(v.id),
            'date': v.date.strftime('%Y-%m-%d'),
            'time': v.time.strftime('%H:%M'),
            'reason': v.reason,
            'status': v.status,
        } for v in visits[:10]]

        # Tibbiy yozuvlar
        records = MedicalRecord.objects.filter(
            doctor=request.user, patient=patient
        ).order_by('-record_date')

        records_data = [{
            'id': str(r.id),
            'date': r.record_date.strftime('%Y-%m-%d'),
            'type': r.record_type,
            'title': r.title,
        } for r in records[:10]]

        # Yosh
        age = None
        if patient.birth_date:
            today = timezone.now().date()
            born = patient.birth_date
            age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))

        data = {
            'id': str(patient.id),
            'name': patient.get_full_name(),
            'phone': patient.phone,
            'email': patient.email,
            'age': age,
            'birth_date': patient.birth_date.strftime('%Y-%m-%d') if patient.birth_date else None,
            'gender': patient.gender,
            'blood_type': patient.blood_type,
            'address': patient.address,
            'avatar': patient.avatar.url if patient.avatar else None,
            'allergies': patient.allergies,
            'chronic_diseases': patient.chronic_diseases,
            'emergency_contact': patient.emergency_contact,
            'total_visits': visits.count(),
            'visits': visits_data,
            'medical_records': records_data,
        }
        return Response(data)
    except (Doctor.DoesNotExist, User.DoesNotExist):
        return Response({'error': 'Topilmadi'}, status=404)


# ============== DOCTOR SCHEDULE ==============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_schedule(request):
    """Shifokor jadvali"""
    try:
        doctor = Doctor.objects.get(user=request.user)

        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        day_names = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']

        schedule = []
        for i, day in enumerate(days):
            hours = getattr(doctor, day, {})
            schedule.append({
                'day': day,
                'day_name': day_names[i],
                'day_index': i,
                'start': hours.get('start', ''),
                'end': hours.get('end', ''),
                'is_working': bool(hours.get('start')),
            })

        return Response(schedule)
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=404)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def doctor_schedule_update(request):
    """Jadvalni yangilash"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        data = request.data

        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

        for day in days:
            if day in data:
                day_data = data[day]
                if day_data.get('is_working'):
                    setattr(doctor, day, {
                        'start': day_data.get('start', '09:00'),
                        'end': day_data.get('end', '18:00'),
                    })
                else:
                    setattr(doctor, day, {})

        doctor.save()
        return Response({'status': 'updated'})
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=404)


# ============== DOCTOR MEDICAL RECORDS ==============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_records(request):
    """Shifokor tibbiy yozuvlari"""
    queryset = MedicalRecord.objects.filter(
        doctor=request.user
    ).select_related('patient')

    # Filter by type
    record_type = request.query_params.get('type')
    if record_type and record_type != 'all':
        queryset = queryset.filter(record_type=record_type)

    # Search
    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search) |
            Q(patient__first_name__icontains=search) |
            Q(patient__last_name__icontains=search)
        )

    data = []
    for record in queryset.order_by('-record_date')[:50]:
        data.append({
            'id': str(record.id),
            'patient_id': str(record.patient.id),
            'patient_name': record.patient.get_full_name(),
            'record_type': record.record_type,
            'title': record.title,
            'description': record.description,
            'record_date': record.record_date.strftime('%Y-%m-%d'),
            'created_at': record.created_at.strftime('%Y-%m-%d %H:%M'),
        })

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def doctor_record_create(request):
    """Yangi tibbiy yozuv"""
    try:
        from accounts.models import User

        patient_id = request.data.get('patient_id')
        patient = User.objects.get(pk=patient_id)

        record = MedicalRecord.objects.create(
            patient=patient,
            doctor=request.user,
            record_type=request.data.get('record_type', 'consultation'),
            title=request.data.get('title'),
            description=request.data.get('description', ''),
            vitals=request.data.get('vitals', {}),
            record_date=request.data.get('record_date', timezone.now().date()),
        )

        return Response({
            'id': str(record.id),
            'status': 'created'
        }, status=201)
    except User.DoesNotExist:
        return Response({'error': 'Bemor topilmadi'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


# ============== DOCTOR REVIEWS ==============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_reviews(request):
    """Shifokor sharhlari"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        reviews = DoctorReview.objects.filter(doctor=doctor).select_related('patient')

        data = []
        for r in reviews.order_by('-created_at'):
            data.append({
                'id': str(r.id),
                'patient_name': r.patient.get_full_name(),
                'rating': r.rating,
                'comment': r.comment,
                'created_at': r.created_at.strftime('%Y-%m-%d'),
            })

        return Response(data)
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=404)