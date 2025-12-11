# appointments/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Appointment, Prescription, MedicalRecord, Allergy, ChronicCondition
from .serializers import (
    AppointmentSerializer, AppointmentCreateSerializer,
    PrescriptionSerializer, PrescriptionCreateSerializer,
    MedicalRecordSerializer, MedicalRecordCreateSerializer,
    AllergySerializer, ChronicConditionSerializer
)


# ============== APPOINTMENT VIEWSET ==============
class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Appointment.objects.all()

        # Filter by date
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)

        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Filter by doctor
        doctor_id = self.request.query_params.get('doctor')
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)

        # Filter by patient
        patient_id = self.request.query_params.get('patient')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)

        return queryset.order_by('date', 'time')

    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Return full serializer
        appointment = serializer.instance
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'confirmed'
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'cancelled'
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'completed'
        if 'notes' in request.data:
            appointment.notes = request.data['notes']
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)


@api_view(['PATCH', 'PUT'])
@permission_classes([IsAuthenticated])
def appointment_update(request, pk):
    """Appointment status yangilash"""
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    if 'status' in request.data:
        appointment.status = request.data['status']
    if 'notes' in request.data:
        appointment.notes = request.data['notes']
    if 'is_paid' in request.data:
        appointment.is_paid = request.data['is_paid']

    appointment.save()
    return Response(AppointmentSerializer(appointment).data)


# ============== PRESCRIPTION VIEWSET ==============
class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Prescription.objects.all().order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return PrescriptionCreateSerializer
        return PrescriptionSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_prescriptions(request):
    prescriptions = Prescription.objects.filter(patient=request.user).order_by('-created_at')
    return Response(PrescriptionSerializer(prescriptions, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_prescription(request):
    serializer = PrescriptionCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============== MEDICAL RECORD VIEWSET ==============
class MedicalRecordViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MedicalRecord.objects.all().order_by('-record_date')

    def get_serializer_class(self):
        if self.action == 'create':
            return MedicalRecordCreateSerializer
        return MedicalRecordSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_medical_records(request):
    records = MedicalRecord.objects.filter(patient=request.user).order_by('-record_date')
    return Response(MedicalRecordSerializer(records, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_medical_record(request):
    serializer = MedicalRecordCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============== ALLERGY & CHRONIC CONDITIONS ==============
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_allergies(request):
    if request.method == 'GET':
        allergies = Allergy.objects.filter(patient=request.user, is_active=True)
        return Response(AllergySerializer(allergies, many=True).data)

    elif request.method == 'POST':
        data = request.data.copy()
        data['patient'] = request.user.id
        serializer = AllergySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_chronic_conditions(request):
    if request.method == 'GET':
        conditions = ChronicCondition.objects.filter(patient=request.user, is_active=True)
        return Response(ChronicConditionSerializer(conditions, many=True).data)

    elif request.method == 'POST':
        data = request.data.copy()
        data['patient'] = request.user.id
        serializer = ChronicConditionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============== MEDICAL HISTORY ==============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_medical_history(request):
    user = request.user

    data = {
        'prescriptions': PrescriptionSerializer(
            Prescription.objects.filter(patient=user).order_by('-created_at')[:20], many=True
        ).data,
        'medical_records': MedicalRecordSerializer(
            MedicalRecord.objects.filter(patient=user).order_by('-record_date')[:20], many=True
        ).data,
        'allergies': AllergySerializer(
            Allergy.objects.filter(patient=user, is_active=True), many=True
        ).data,
        'chronic_conditions': ChronicConditionSerializer(
            ChronicCondition.objects.filter(patient=user, is_active=True), many=True
        ).data,
        'recent_appointments': AppointmentSerializer(
            Appointment.objects.filter(patient=user).order_by('-date')[:10], many=True
        ).data,
        'summary': {
            'total_prescriptions': Prescription.objects.filter(patient=user).count(),
            'total_records': MedicalRecord.objects.filter(patient=user).count(),
            'active_allergies': Allergy.objects.filter(patient=user, is_active=True).count(),
            'chronic_conditions': ChronicCondition.objects.filter(patient=user, is_active=True).count(),
            'total_appointments': Appointment.objects.filter(patient=user).count(),
            'completed_appointments': Appointment.objects.filter(patient=user, status='completed').count(),
        }
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_medical_history(request, patient_id):
    """Bemor tibbiy tarixini ko'rish - faqat shifokor yoki o'zi ko'ra oladi"""
    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        patient = User.objects.get(pk=patient_id)
    except User.DoesNotExist:
        return Response({'error': 'Bemor topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    # XAVFSIZLIK: Faqat shifokor yoki bemor o'zi ko'ra oladi
    is_own_data = str(request.user.id) == str(patient_id)
    is_doctor = hasattr(request.user, 'user_type') and request.user.user_type == 'doctor'
    is_admin = hasattr(request.user, 'user_type') and request.user.user_type == 'admin'

    # Shifokor faqat o'z bemorlarini ko'ra oladi
    if is_doctor and not is_own_data:
        from doctors.models import Doctor
        try:
            doctor = Doctor.objects.get(user=request.user)
            has_appointment = Appointment.objects.filter(doctor=doctor, patient=patient).exists()
            if not has_appointment:
                return Response({'error': 'Bu bemorning ma\'lumotlarini ko\'rishga ruxsat yo\'q'}, status=status.HTTP_403_FORBIDDEN)
        except Doctor.DoesNotExist:
            return Response({'error': 'Shifokor topilmadi'}, status=status.HTTP_403_FORBIDDEN)

    # Oddiy foydalanuvchi faqat o'z ma'lumotlarini ko'ra oladi
    if not is_own_data and not is_doctor and not is_admin:
        return Response({'error': 'Bu bemorning ma\'lumotlarini ko\'rishga ruxsat yo\'q'}, status=status.HTTP_403_FORBIDDEN)

    data = {
        'patient': {
            'id': str(patient.id),
            'name': patient.get_full_name(),
            'email': patient.email,
        },
        'prescriptions': PrescriptionSerializer(
            Prescription.objects.filter(patient=patient).order_by('-created_at')[:20], many=True
        ).data,
        'medical_records': MedicalRecordSerializer(
            MedicalRecord.objects.filter(patient=patient).order_by('-record_date')[:20], many=True
        ).data,
        'allergies': AllergySerializer(
            Allergy.objects.filter(patient=patient, is_active=True), many=True
        ).data,
        'chronic_conditions': ChronicConditionSerializer(
            ChronicCondition.objects.filter(patient=patient, is_active=True), many=True
        ).data,
        'recent_appointments': AppointmentSerializer(
            Appointment.objects.filter(patient=patient).order_by('-date')[:10], many=True
        ).data,
    }

    return Response(data)


# ============== DOCTOR APPOINTMENTS ==============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_appointments(request):
    date = request.query_params.get('date', timezone.now().date().isoformat())
    appointments = Appointment.objects.filter(date=date).order_by('time')
    return Response(AppointmentSerializer(appointments, many=True).data)


# ============== AVAILABLE SLOTS ==============
@api_view(['GET'])
@permission_classes([AllowAny])
def available_slots(request, doctor_id):
    from doctors.models import Doctor

    date = request.query_params.get('date', timezone.now().date().isoformat())

    try:
        doctor = Doctor.objects.get(pk=doctor_id)
    except Doctor.DoesNotExist:
        return Response({'error': 'Shifokor topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    booked_times = Appointment.objects.filter(
        doctor=doctor,
        date=date,
        status__in=['pending', 'confirmed']
    ).values_list('time', flat=True)

    booked_times_str = [t.strftime('%H:%M') for t in booked_times]

    slots = []
    for hour in range(9, 18):
        for minute in [0, 30]:
            time_str = f'{hour:02d}:{minute:02d}'
            slots.append({
                'time': time_str,
                'available': time_str not in booked_times_str
            })

    return Response(slots)