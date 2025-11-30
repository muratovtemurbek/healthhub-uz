# appointments/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from .models import Appointment
from .serializers import AppointmentSerializer
from doctors.models import Doctor


class AppointmentViewSet(viewsets.ModelViewSet):
    """Navbatlar CRUD"""
    serializer_class = AppointmentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if hasattr(user, 'user_type'):
                if user.user_type == 'doctor':
                    return Appointment.objects.filter(doctor__user=user)
                elif user.user_type == 'patient':
                    return Appointment.objects.filter(patient=user)
        return Appointment.objects.all()

    def list(self, request, *args, **kwargs):
        """Navbatlar ro'yxati"""
        queryset = self.get_queryset().order_by('-date', '-time')
        data = []
        for apt in queryset:
            data.append({
                'id': str(apt.id),
                'doctor_id': str(apt.doctor.id) if apt.doctor else None,
                'doctor_name': f"{apt.doctor.user.first_name} {apt.doctor.user.last_name}".strip() if apt.doctor and apt.doctor.user else "N/A",
                'specialization_name': apt.doctor.specialization.name_uz if apt.doctor and apt.doctor.specialization else "N/A",
                'hospital_name': apt.doctor.hospital.name if apt.doctor and apt.doctor.hospital else "N/A",
                'patient_id': str(apt.patient.id) if apt.patient else None,
                'patient_name': f"{apt.patient.first_name} {apt.patient.last_name}".strip() if apt.patient else "N/A",
                'date': str(apt.date) if apt.date else None,
                'time': str(apt.time)[:5] if apt.time else None,
                'status': apt.status,
                'status_display': self._get_status_display(apt.status),
                'symptoms': apt.symptoms if hasattr(apt, 'symptoms') else '',
                'notes': apt.notes if hasattr(apt, 'notes') else '',
                'created_at': apt.created_at.isoformat() if apt.created_at else None,
            })
        return Response(data)

    def create(self, request, *args, **kwargs):
        """Yangi navbat yaratish"""
        data = request.data

        try:
            doctor_id = data.get('doctor_id') or data.get('doctor')
            if not doctor_id:
                return Response({'error': 'Shifokor tanlanmagan'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                doctor = Doctor.objects.get(id=doctor_id)
            except Doctor.DoesNotExist:
                return Response({'error': 'Shifokor topilmadi'}, status=status.HTTP_404_NOT_FOUND)

            # Patient
            patient = None
            if request.user.is_authenticated:
                patient = request.user
            else:
                patient_id = data.get('patient_id')
                if patient_id:
                    from accounts.models import User
                    try:
                        patient = User.objects.get(id=patient_id)
                    except:
                        pass

            # Date and time
            date = data.get('date')
            time = data.get('time')

            if not date or not time:
                return Response({'error': 'Sana va vaqt kiritilishi shart'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if slot is available
            existing = Appointment.objects.filter(
                doctor=doctor,
                date=date,
                time=time,
                status__in=['scheduled', 'confirmed']
            ).exists()

            if existing:
                return Response({'error': 'Bu vaqt band'}, status=status.HTTP_400_BAD_REQUEST)

            # Create appointment
            appointment = Appointment.objects.create(
                doctor=doctor,
                patient=patient,
                date=date,
                time=time,
                status='scheduled',
                symptoms=data.get('symptoms', ''),
                notes=data.get('notes', ''),
            )

            return Response({
                'id': str(appointment.id),
                'message': 'Navbat muvaffaqiyatli yaratildi!',
                'date': str(appointment.date),
                'time': str(appointment.time)[:5],
                'doctor_name': f"{doctor.user.first_name} {doctor.user.last_name}".strip() if doctor.user else "Shifokor",
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """Navbatni yangilash"""
        appointment = self.get_object()
        data = request.data

        try:
            if 'status' in data:
                appointment.status = data['status']
            if 'date' in data:
                appointment.date = data['date']
            if 'time' in data:
                appointment.time = data['time']
            if 'symptoms' in data:
                appointment.symptoms = data['symptoms']
            if 'notes' in data:
                appointment.notes = data['notes']

            appointment.save()
            return Response({'message': 'Navbat yangilandi!'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Navbatni bekor qilish"""
        try:
            appointment = self.get_object()
            appointment.status = 'cancelled'
            appointment.save()
            return Response({'message': 'Navbat bekor qilindi!'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my_appointments(self, request):
        """Foydalanuvchining navbatlari"""
        if not request.user.is_authenticated:
            return Response({'error': 'Login qiling'}, status=status.HTTP_401_UNAUTHORIZED)

        appointments = Appointment.objects.filter(patient=request.user).order_by('-date', '-time')
        return self.list(request)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Navbatni bekor qilish"""
        appointment = self.get_object()
        appointment.status = 'cancelled'
        appointment.save()
        return Response({'message': 'Navbat bekor qilindi!'})

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Navbatni tasdiqlash"""
        appointment = self.get_object()
        appointment.status = 'confirmed'
        appointment.save()
        return Response({'message': 'Navbat tasdiqlandi!'})

    def _get_status_display(self, status_val):
        statuses = {
            'scheduled': 'Rejalashtirilgan',
            'confirmed': 'Tasdiqlangan',
            'completed': 'Yakunlangan',
            'cancelled': 'Bekor qilingan',
            'no_show': 'Kelmadi'
        }
        return statuses.get(status_val, status_val)


# ==================== CLASS TASHQARISIDA ====================

@api_view(['PATCH', 'PUT'])
@permission_classes([IsAuthenticated])
def appointment_update(request, pk):
    """Qabulni yangilash"""
    try:
        appointment = Appointment.objects.get(id=pk)
    except Appointment.DoesNotExist:
        return Response({'error': 'Qabul topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    is_doctor = hasattr(user, 'user_type') and user.user_type == 'doctor'
    is_patient = appointment.patient == user
    is_admin = hasattr(user, 'user_type') and user.user_type == 'admin'

    if not (is_doctor or is_patient or is_admin or user.is_staff):
        return Response({'error': 'Ruxsat yoq'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data

    if 'status' in data:
        appointment.status = data['status']
    if 'symptoms' in data:
        appointment.symptoms = data['symptoms']
    if 'notes' in data:
        appointment.notes = data['notes']
    if 'date' in data:
        appointment.date = data['date']
    if 'time' in data:
        appointment.time = data['time']

    appointment.save()

    return Response({
        'success': True,
        'id': str(appointment.id),
        'status': appointment.status,
        'message': 'Qabul yangilandi'
    })