# payments/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from decimal import Decimal
import hashlib
import base64
import json
import time

from .models import Payment, PaymeTransaction, ClickTransaction


# ==================== TO'LOV YARATISH ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """Yangi to'lov yaratish"""
    amount = request.data.get('amount')
    provider = request.data.get('provider')  # payme yoki click
    payment_type = request.data.get('payment_type', 'appointment')
    appointment_id = request.data.get('appointment_id')
    description = request.data.get('description', '')

    if not amount or not provider:
        return Response({'error': 'amount va provider kerak'}, status=400)

    if provider not in ['payme', 'click']:
        return Response({'error': 'provider payme yoki click bolishi kerak'}, status=400)

    # Payment yaratish
    payment = Payment.objects.create(
        user=request.user,
        amount=Decimal(str(amount)),
        provider=provider,
        payment_type=payment_type,
        description=description,
        transaction_id=f"HEALTH-{int(time.time())}-{request.user.id}"
    )

    # Appointment bog'lash
    if appointment_id:
        from appointments.models import Appointment
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            payment.appointment = appointment
            payment.save()
        except Appointment.DoesNotExist:
            pass

    # Provider URL yaratish
    if provider == 'payme':
        checkout_url = generate_payme_url(payment)
    else:
        checkout_url = generate_click_url(payment)

    return Response({
        'success': True,
        'payment_id': str(payment.id),
        'checkout_url': checkout_url,
        'amount': float(payment.amount),
        'provider': provider
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, payment_id):
    """To'lov holatini tekshirish"""
    try:
        payment = Payment.objects.get(id=payment_id, user=request.user)
        return Response({
            'payment_id': str(payment.id),
            'status': payment.status,
            'amount': float(payment.amount),
            'provider': payment.provider,
            'created_at': payment.created_at.isoformat(),
            'paid_at': payment.paid_at.isoformat() if payment.paid_at else None
        })
    except Payment.DoesNotExist:
        return Response({'error': 'Tolov topilmadi'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_history(request):
    """Foydalanuvchi to'lovlari tarixi"""
    payments = Payment.objects.filter(user=request.user).order_by('-created_at')[:20]

    data = [{
        'id': str(p.id),
        'amount': float(p.amount),
        'status': p.status,
        'status_display': p.get_status_display(),
        'provider': p.provider,
        'provider_display': p.get_provider_display(),
        'payment_type': p.payment_type,
        'created_at': p.created_at.isoformat(),
        'paid_at': p.paid_at.isoformat() if p.paid_at else None
    } for p in payments]

    return Response(data)


# ==================== PAYME ====================

PAYME_MERCHANT_ID = getattr(settings, 'PAYME_MERCHANT_ID', '')
PAYME_SECRET_KEY = getattr(settings, 'PAYME_SECRET_KEY', '')
PAYME_TEST_MODE = getattr(settings, 'PAYME_TEST_MODE', True)


def generate_payme_url(payment):
    """Payme checkout URL yaratish"""
    # Base64 encode merchant data
    merchant_data = f"m={PAYME_MERCHANT_ID};ac.order_id={payment.id};a={payment.amount_in_tiyin}"
    encoded = base64.b64encode(merchant_data.encode()).decode()

    if PAYME_TEST_MODE:
        base_url = "https://checkout.test.paycom.uz"
    else:
        base_url = "https://checkout.paycom.uz"

    return f"{base_url}/{encoded}"


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def payme_webhook(request):
    """Payme Merchant API endpoint"""

    # Auth tekshirish
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if not verify_payme_auth(auth_header):
        return Response({
            'error': {'code': -32504, 'message': 'Unauthorized'}
        })

    data = request.data
    method = data.get('method')
    params = data.get('params', {})
    request_id = data.get('id')

    if method == 'CheckPerformTransaction':
        return payme_check_perform(params, request_id)
    elif method == 'CreateTransaction':
        return payme_create(params, request_id)
    elif method == 'PerformTransaction':
        return payme_perform(params, request_id)
    elif method == 'CancelTransaction':
        return payme_cancel(params, request_id)
    elif method == 'CheckTransaction':
        return payme_check(params, request_id)
    else:
        return Response({
            'error': {'code': -32601, 'message': 'Method not found'},
            'id': request_id
        })


def verify_payme_auth(auth_header):
    """Payme auth tekshirish"""
    if not auth_header.startswith('Basic '):
        return False

    try:
        credentials = base64.b64decode(auth_header[6:]).decode()
        username, password = credentials.split(':')
        return username == 'Paycom' and password == PAYME_SECRET_KEY
    except:
        return False


def payme_check_perform(params, request_id):
    """CheckPerformTransaction - to'lov mumkinligini tekshirish"""
    order_id = params.get('account', {}).get('order_id')
    amount = params.get('amount')

    try:
        payment = Payment.objects.get(id=order_id)

        if payment.status == 'completed':
            return Response({
                'error': {'code': -31099, 'message': 'Order already paid'},
                'id': request_id
            })

        if payment.amount_in_tiyin != amount:
            return Response({
                'error': {'code': -31001, 'message': 'Invalid amount'},
                'id': request_id
            })

        return Response({
            'result': {'allow': True},
            'id': request_id
        })

    except Payment.DoesNotExist:
        return Response({
            'error': {'code': -31050, 'message': 'Order not found'},
            'id': request_id
        })


def payme_create(params, request_id):
    """CreateTransaction - transaksiya yaratish"""
    payme_id = params.get('id')
    order_id = params.get('account', {}).get('order_id')
    amount = params.get('amount')
    create_time = params.get('time')

    try:
        payment = Payment.objects.get(id=order_id)

        # Mavjud transaksiya bormi
        existing = PaymeTransaction.objects.filter(payme_id=payme_id).first()
        if existing:
            return Response({
                'result': {
                    'create_time': existing.create_time,
                    'transaction': str(existing.id),
                    'state': existing.state
                },
                'id': request_id
            })

        # Yangi transaksiya
        transaction = PaymeTransaction.objects.create(
            payment=payment,
            payme_id=payme_id,
            create_time=create_time,
            state=1
        )

        payment.status = 'processing'
        payment.provider_transaction_id = payme_id
        payment.save()

        return Response({
            'result': {
                'create_time': transaction.create_time,
                'transaction': str(transaction.id),
                'state': transaction.state
            },
            'id': request_id
        })

    except Payment.DoesNotExist:
        return Response({
            'error': {'code': -31050, 'message': 'Order not found'},
            'id': request_id
        })


def payme_perform(params, request_id):
    """PerformTransaction - to'lovni tasdiqlash"""
    payme_id = params.get('id')

    try:
        transaction = PaymeTransaction.objects.get(payme_id=payme_id)

        if transaction.state == 2:
            return Response({
                'result': {
                    'transaction': str(transaction.id),
                    'perform_time': transaction.perform_time,
                    'state': transaction.state
                },
                'id': request_id
            })

        if transaction.state != 1:
            return Response({
                'error': {'code': -31008, 'message': 'Transaction cancelled'},
                'id': request_id
            })

        # TASDIQLASH
        perform_time = int(time.time() * 1000)
        transaction.state = 2
        transaction.perform_time = perform_time
        transaction.save()

        # Payment yangilash
        payment = transaction.payment
        payment.status = 'completed'
        payment.paid_at = timezone.now()
        payment.save()

        # Appointment yangilash (agar bor bo'lsa)
        if payment.appointment:
            payment.appointment.payment_status = 'paid'
            payment.appointment.save()

        return Response({
            'result': {
                'transaction': str(transaction.id),
                'perform_time': perform_time,
                'state': 2
            },
            'id': request_id
        })

    except PaymeTransaction.DoesNotExist:
        return Response({
            'error': {'code': -31003, 'message': 'Transaction not found'},
            'id': request_id
        })


def payme_cancel(params, request_id):
    """CancelTransaction - bekor qilish"""
    payme_id = params.get('id')
    reason = params.get('reason')

    try:
        transaction = PaymeTransaction.objects.get(payme_id=payme_id)

        cancel_time = int(time.time() * 1000)

        if transaction.state == 1:
            transaction.state = -1
        elif transaction.state == 2:
            transaction.state = -2

        transaction.cancel_time = cancel_time
        transaction.reason = reason
        transaction.save()

        # Payment yangilash
        payment = transaction.payment
        payment.status = 'cancelled'
        payment.save()

        return Response({
            'result': {
                'transaction': str(transaction.id),
                'cancel_time': cancel_time,
                'state': transaction.state
            },
            'id': request_id
        })

    except PaymeTransaction.DoesNotExist:
        return Response({
            'error': {'code': -31003, 'message': 'Transaction not found'},
            'id': request_id
        })


def payme_check(params, request_id):
    """CheckTransaction - transaksiya holatini tekshirish"""
    payme_id = params.get('id')

    try:
        transaction = PaymeTransaction.objects.get(payme_id=payme_id)

        return Response({
            'result': {
                'create_time': transaction.create_time,
                'perform_time': transaction.perform_time,
                'cancel_time': transaction.cancel_time,
                'transaction': str(transaction.id),
                'state': transaction.state,
                'reason': transaction.reason
            },
            'id': request_id
        })

    except PaymeTransaction.DoesNotExist:
        return Response({
            'error': {'code': -31003, 'message': 'Transaction not found'},
            'id': request_id
        })


# ==================== CLICK ====================

CLICK_MERCHANT_ID = getattr(settings, 'CLICK_MERCHANT_ID', '')
CLICK_SERVICE_ID = getattr(settings, 'CLICK_SERVICE_ID', '')
CLICK_SECRET_KEY = getattr(settings, 'CLICK_SECRET_KEY', '')


def generate_click_url(payment):
    """Click checkout URL yaratish"""
    params = {
        'service_id': CLICK_SERVICE_ID,
        'merchant_id': CLICK_MERCHANT_ID,
        'amount': str(payment.amount),
        'transaction_param': str(payment.id),
        'return_url': f"{settings.FRONTEND_URL}/payment/success",
    }

    query = '&'.join([f"{k}={v}" for k, v in params.items()])
    return f"https://my.click.uz/services/pay?{query}"


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def click_prepare(request):
    """Click Prepare - to'lovni tayyorlash"""
    click_trans_id = request.data.get('click_trans_id')
    service_id = request.data.get('service_id')
    merchant_trans_id = request.data.get('merchant_trans_id')
    amount = request.data.get('amount')
    action = request.data.get('action')
    sign_time = request.data.get('sign_time')
    sign_string = request.data.get('sign_string')

    # Sign tekshirish
    expected_sign = hashlib.md5(
        f"{click_trans_id}{service_id}{CLICK_SECRET_KEY}{merchant_trans_id}{amount}{action}{sign_time}".encode()
    ).hexdigest()

    if sign_string != expected_sign:
        return Response({
            'error': -1,
            'error_note': 'Invalid sign'
        })

    try:
        payment = Payment.objects.get(id=merchant_trans_id)

        if payment.status == 'completed':
            return Response({
                'error': -4,
                'error_note': 'Already paid'
            })

        if float(amount) != float(payment.amount):
            return Response({
                'error': -2,
                'error_note': 'Invalid amount'
            })

        # Transaction yaratish
        ClickTransaction.objects.create(
            payment=payment,
            click_trans_id=click_trans_id,
            service_id=service_id,
            merchant_trans_id=merchant_trans_id,
            amount=amount,
            action=action,
            sign_time=sign_time
        )

        payment.status = 'processing'
        payment.provider_transaction_id = click_trans_id
        payment.save()

        return Response({
            'error': 0,
            'error_note': 'Success',
            'click_trans_id': click_trans_id,
            'merchant_trans_id': merchant_trans_id,
            'merchant_prepare_id': str(payment.id)
        })

    except Payment.DoesNotExist:
        return Response({
            'error': -5,
            'error_note': 'Order not found'
        })


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def click_complete(request):
    """Click Complete - to'lovni yakunlash"""
    click_trans_id = request.data.get('click_trans_id')
    service_id = request.data.get('service_id')
    merchant_trans_id = request.data.get('merchant_trans_id')
    amount = request.data.get('amount')
    action = request.data.get('action')
    sign_time = request.data.get('sign_time')
    sign_string = request.data.get('sign_string')
    error = request.data.get('error')

    # Sign tekshirish
    expected_sign = hashlib.md5(
        f"{click_trans_id}{service_id}{CLICK_SECRET_KEY}{merchant_trans_id}{merchant_trans_id}{amount}{action}{sign_time}".encode()
    ).hexdigest()

    if sign_string != expected_sign:
        return Response({
            'error': -1,
            'error_note': 'Invalid sign'
        })

    try:
        payment = Payment.objects.get(id=merchant_trans_id)

        if error and int(error) != 0:
            payment.status = 'failed'
            payment.save()
            return Response({
                'error': -9,
                'error_note': 'Transaction failed'
            })

        # TASDIQLASH
        ClickTransaction.objects.create(
            payment=payment,
            click_trans_id=click_trans_id,
            service_id=service_id,
            merchant_trans_id=merchant_trans_id,
            amount=amount,
            action=action,
            sign_time=sign_time
        )

        payment.status = 'completed'
        payment.paid_at = timezone.now()
        payment.save()

        # Appointment yangilash
        if payment.appointment:
            payment.appointment.payment_status = 'paid'
            payment.appointment.save()

        return Response({
            'error': 0,
            'error_note': 'Success',
            'click_trans_id': click_trans_id,
            'merchant_trans_id': merchant_trans_id,
            'merchant_confirm_id': str(payment.id)
        })

    except Payment.DoesNotExist:
        return Response({
            'error': -5,
            'error_note': 'Order not found'
        })