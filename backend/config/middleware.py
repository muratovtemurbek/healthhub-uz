# config/middleware.py
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    DRF uchun standart xatolik formati.
    Barcha xatoliklar quyidagi formatda qaytariladi:
    {
        "success": false,
        "error": "xatolik xabari",
        "code": "ERROR_CODE"
    }
    """
    # DRF default handler
    response = exception_handler(exc, context)

    if response is not None:
        # Error log
        logger.error(f"API Error: {exc} | Context: {context.get('view', 'Unknown')}")

        # Standart format
        error_data = {
            'success': False,
            'error': '',
            'code': 'UNKNOWN_ERROR'
        }

        # Detail field ni olish
        if hasattr(response, 'data'):
            if isinstance(response.data, dict):
                if 'detail' in response.data:
                    error_data['error'] = str(response.data['detail'])
                elif 'error' in response.data:
                    error_data['error'] = str(response.data['error'])
                elif 'non_field_errors' in response.data:
                    error_data['error'] = str(response.data['non_field_errors'][0])
                else:
                    # Field specific errors
                    errors = []
                    for field, msgs in response.data.items():
                        if isinstance(msgs, list):
                            errors.append(f"{field}: {msgs[0]}")
                        else:
                            errors.append(f"{field}: {msgs}")
                    error_data['error'] = '; '.join(errors) if errors else 'Xatolik yuz berdi'
            elif isinstance(response.data, list):
                error_data['error'] = str(response.data[0]) if response.data else 'Xatolik yuz berdi'
            else:
                error_data['error'] = str(response.data)

        # HTTP status code ga qarab error code belgilash
        status_code = response.status_code
        if status_code == 400:
            error_data['code'] = 'BAD_REQUEST'
        elif status_code == 401:
            error_data['code'] = 'UNAUTHORIZED'
        elif status_code == 403:
            error_data['code'] = 'FORBIDDEN'
        elif status_code == 404:
            error_data['code'] = 'NOT_FOUND'
        elif status_code == 405:
            error_data['code'] = 'METHOD_NOT_ALLOWED'
        elif status_code == 429:
            error_data['code'] = 'RATE_LIMIT_EXCEEDED'
        elif status_code >= 500:
            error_data['code'] = 'SERVER_ERROR'
            # Production da ichki xatolik tafsilotlarini ko'rsatmaslik
            from django.conf import settings
            if not settings.DEBUG:
                error_data['error'] = 'Serverda xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.'

        response.data = error_data

    return response
