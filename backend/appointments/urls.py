# appointments/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AppointmentViewSet, appointment_update,
    PrescriptionViewSet, my_prescriptions, create_prescription,
    MedicalRecordViewSet, my_medical_records, create_medical_record,
    my_allergies, my_chronic_conditions,
    my_medical_history, patient_medical_history,
    doctor_appointments, available_slots,
    LabTestViewSet, lab_test_types
)

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')
router.register(r'records', MedicalRecordViewSet, basename='medical-record')
router.register(r'lab-tests', LabTestViewSet, basename='lab-test')

urlpatterns = [
    # Doctor appointments
    path('doctor/appointments/', doctor_appointments, name='doctor-appointments'),

    # Available slots
    path('slots/<str:doctor_id>/', available_slots, name='available-slots'),

    # Appointments update
    path('appointments/<uuid:pk>/update/', appointment_update, name='appointment-update'),

    # Prescriptions
    path('my-prescriptions/', my_prescriptions, name='my-prescriptions'),
    path('prescriptions/create/', create_prescription, name='create-prescription'),

    # Medical Records
    path('my-records/', my_medical_records, name='my-records'),
    path('records/create/', create_medical_record, name='create-record'),

    # Allergies & Conditions
    path('my-allergies/', my_allergies, name='my-allergies'),
    path('my-conditions/', my_chronic_conditions, name='my-conditions'),

    # Full Medical History
    path('my-history/', my_medical_history, name='my-history'),
    path('patient/<uuid:patient_id>/history/', patient_medical_history, name='patient-history'),

    # Lab Tests
    path('lab-test-types/', lab_test_types, name='lab-test-types'),

    # Router URLs (appointments, prescriptions, records, lab-tests CRUD)
    path('', include(router.urls)),
]
