# air_quality/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
import requests
import random
import logging
import os

logger = logging.getLogger(__name__)

# IQAir API key
IQAIR_API_KEY = getattr(settings, 'IQAIR_API_KEY', None) or os.environ.get('IQAIR_API_KEY', '')

# Cache (oddiy dict - production da Redis ishlating)
_cache = {}
CACHE_TIMEOUT = 30 * 60  # 30 minut (soniyada)


def get_cache(key):
    """Cache dan olish"""
    if key in _cache:
        data, expires = _cache[key]
        if timezone.now().timestamp() < expires:
            return data
        del _cache[key]
    return None


def set_cache(key, data, timeout=CACHE_TIMEOUT):
    """Cache ga yozish"""
    expires = timezone.now().timestamp() + timeout
    _cache[key] = (data, expires)


def get_aqi_info(aqi: int) -> dict:
    """AQI qiymatiga qarab ma'lumot"""
    if aqi <= 50:
        return {
            'level': 'Yaxshi',
            'level_en': 'Good',
            'level_color': 'green',
            'recommendation': 'Tashqarida faoliyat uchun qulay.',
            'diseases': [],
            'icon': '😊',
            'bg_gradient': 'from-green-400 to-green-600'
        }
    elif aqi <= 100:
        return {
            'level': "O'rtacha",
            'level_en': 'Moderate',
            'level_color': 'yellow',
            'recommendation': "Sezgir odamlar ehtiyot bo'lishi kerak.",
            'diseases': ['Astma (ehtiyotkorlik)'],
            'icon': '😐',
            'bg_gradient': 'from-yellow-400 to-yellow-600'
        }
    elif aqi <= 150:
        return {
            'level': 'Sezgir guruhlar uchun zararli',
            'level_en': 'Unhealthy for Sensitive Groups',
            'level_color': 'orange',
            'recommendation': 'Astma va yurak kasalligi bo\'lganlar ehtiyot bo\'lsin.',
            'diseases': ['Astma', 'Bronxit', 'Allergiya'],
            'icon': '😷',
            'bg_gradient': 'from-orange-400 to-orange-600'
        }
    elif aqi <= 200:
        return {
            'level': 'Zararli',
            'level_en': 'Unhealthy',
            'level_color': 'red',
            'recommendation': 'Tashqarida uzoq vaqt bo\'lishdan saqlaning.',
            'diseases': ['Astma', 'Bronxit', 'Allergiya', 'Yurak kasalliklari'],
            'icon': '🤢',
            'bg_gradient': 'from-red-500 to-red-700'
        }
    elif aqi <= 300:
        return {
            'level': 'Juda zararli',
            'level_en': 'Very Unhealthy',
            'level_color': 'purple',
            'recommendation': 'Tashqariga chiqishdan saqlaning.',
            'diseases': ['Astma', 'Bronxit', "O'pka kasalliklari", 'Yurak kasalliklari'],
            'icon': '🤮',
            'bg_gradient': 'from-purple-600 to-purple-800'
        }
    else:
        return {
            'level': 'Xavfli',
            'level_en': 'Hazardous',
            'level_color': 'maroon',
            'recommendation': 'Uyda qoling! Derazalarni yoping.',
            'diseases': ['Barcha nafas kasalliklari', 'Yurak kasalliklari', "O'tkir allergiya"],
            'icon': '☠️',
            'bg_gradient': 'from-red-900 to-gray-900'
        }


def fetch_from_iqair(city: str, state: str, country: str) -> dict:
    """IQAir API dan ma'lumot olish"""
    if not IQAIR_API_KEY:
        logger.warning("IQAir API key not configured")
        return None

    try:
        url = "http://api.airvisual.com/v2/city"
        params = {
            'city': city,
            'state': state,
            'country': country,
            'key': IQAIR_API_KEY
        }

        logger.info(f"IQAir API request: city={city}, state={state}, country={country}")
        response = requests.get(url, params=params, timeout=10)

        logger.info(f"IQAir API response status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                logger.info(f"IQAir API SUCCESS for {city}")
                return data['data']
            else:
                error_msg = data.get('data', {}).get('message', 'Unknown error')
                logger.warning(f"IQAir API error: {error_msg}")
        else:
            logger.warning(f"IQAir API HTTP {response.status_code}: {response.text[:200]}")

        return None

    except requests.exceptions.Timeout:
        logger.warning("IQAir API timeout")
        return None
    except requests.exceptions.RequestException as e:
        logger.warning(f"IQAir request error: {e}")
        return None
    except Exception as e:
        logger.error(f"IQAir unexpected error: {e}")
        return None


def get_demo_data(city: str = 'Toshkent') -> dict:
    """Demo ma'lumotlar"""
    base_aqi = {
        'Toshkent': 75, 'Tashkent': 75,
        'Samarqand': 55, 'Samarkand': 55,
        'Buxoro': 65, 'Bukhara': 65,
        "Farg'ona": 60, 'Fergana': 60,
        'Namangan': 58,
        'Andijon': 62, 'Andijan': 62,
    }.get(city, 70)

    aqi = base_aqi + random.randint(-15, 15)
    aqi = max(25, min(aqi, 180))

    aqi_info = get_aqi_info(aqi)

    return {
        'aqi': aqi,
        'level': aqi_info['level'],
        'level_en': aqi_info['level_en'],
        'level_color': aqi_info['level_color'],
        'recommendation': aqi_info['recommendation'],
        'diseases': aqi_info['diseases'],
        'icon': aqi_info['icon'],
        'bg_gradient': aqi_info['bg_gradient'],
        'main_pollutant': 'pm25',
        'main_pollutant_name': 'PM2.5',
        'weather': {
            'temperature': random.randint(18, 32),
            'humidity': random.randint(35, 65),
            'wind_speed': round(random.uniform(1.5, 6), 1),
            'pressure': random.randint(1012, 1022),
            'icon': '01d',
            'description': 'Ochiq havo'
        },
        'city': city,
        'country': "O'zbekiston",
        'is_demo': True,
        'timestamp': timezone.now().isoformat()
    }


# IQAir API uchun O'zbekiston shaharlari mapping
# IQAir API aniq shahar/state/country nomlarini talab qiladi
# To'g'ri nomlarni https://www.iqair.com/uzbekistan dan olish mumkin
CITY_MAPPING = {
    # Toshkent - IQAir da "Toshkent Shahri" state nomi bilan
    'Tashkent': {'city': 'Tashkent', 'state': 'Toshkent Shahri', 'country': 'Uzbekistan', 'name_uz': 'Toshkent'},
    'Toshkent': {'city': 'Tashkent', 'state': 'Toshkent Shahri', 'country': 'Uzbekistan', 'name_uz': 'Toshkent'},

    # Boshqa shaharlar
    'Samarkand': {'city': 'Samarkand', 'state': 'Samarkand', 'country': 'Uzbekistan', 'name_uz': 'Samarqand'},
    'Samarqand': {'city': 'Samarkand', 'state': 'Samarkand', 'country': 'Uzbekistan', 'name_uz': 'Samarqand'},
    'Bukhara': {'city': 'Bukhara', 'state': 'Bukhara', 'country': 'Uzbekistan', 'name_uz': 'Buxoro'},
    'Buxoro': {'city': 'Bukhara', 'state': 'Bukhara', 'country': 'Uzbekistan', 'name_uz': 'Buxoro'},
    'Namangan': {'city': 'Namangan', 'state': 'Namangan', 'country': 'Uzbekistan', 'name_uz': 'Namangan'},
    'Andijan': {'city': 'Andijan', 'state': 'Andijan', 'country': 'Uzbekistan', 'name_uz': 'Andijon'},
    'Andijon': {'city': 'Andijan', 'state': 'Andijan', 'country': 'Uzbekistan', 'name_uz': 'Andijon'},
    'Fergana': {'city': 'Fergana', 'state': 'Fergana', 'country': 'Uzbekistan', 'name_uz': "Farg'ona"},
    "Farg'ona": {'city': 'Fergana', 'state': 'Fergana', 'country': 'Uzbekistan', 'name_uz': "Farg'ona"},
    'Nukus': {'city': 'Nukus', 'state': 'Karakalpakstan', 'country': 'Uzbekistan', 'name_uz': 'Nukus'},
    'Karshi': {'city': 'Karshi', 'state': 'Kashkadarya', 'country': 'Uzbekistan', 'name_uz': 'Qarshi'},
    'Qarshi': {'city': 'Karshi', 'state': 'Kashkadarya', 'country': 'Uzbekistan', 'name_uz': 'Qarshi'},
    'Urgench': {'city': 'Urgench', 'state': 'Khorezm', 'country': 'Uzbekistan', 'name_uz': 'Urganch'},
    'Urganch': {'city': 'Urgench', 'state': 'Khorezm', 'country': 'Uzbekistan', 'name_uz': 'Urganch'},
    'Jizzakh': {'city': 'Jizzakh', 'state': 'Jizzakh', 'country': 'Uzbekistan', 'name_uz': 'Jizzax'},
    'Jizzax': {'city': 'Jizzakh', 'state': 'Jizzakh', 'country': 'Uzbekistan', 'name_uz': 'Jizzax'},
}


@api_view(['GET'])
@permission_classes([AllowAny])
def get_air_quality(request):
    """Havo sifati ma'lumotlari"""
    city_input = request.GET.get('city', 'Tashkent')

    # Shahar mapping dan olish
    city_info = CITY_MAPPING.get(city_input, None)

    if not city_info:
        # Default Tashkent
        city_info = CITY_MAPPING['Tashkent']

    city = city_info['city']
    state = city_info['state']
    country = city_info['country']
    city_name_uz = city_info.get('name_uz', city)

    # Cache tekshirish
    cache_key = f"aq_{city}_{state}"
    cached = get_cache(cache_key)
    if cached:
        logger.info(f"Cache HIT for {city}")
        return Response(cached)

    logger.info(f"Cache MISS for {city}, fetching from IQAir...")

    # IQAir API dan olish
    api_data = fetch_from_iqair(city, state, country)

    if api_data:
        pollution = api_data.get('current', {}).get('pollution', {})
        weather = api_data.get('current', {}).get('weather', {})

        aqi = pollution.get('aqius', 50)
        aqi_info = get_aqi_info(aqi)

        pollutant_names = {
            'p2': 'PM2.5', 'p1': 'PM10', 'o3': 'Ozon',
            'n2': 'NO2', 's2': 'SO2', 'co': 'CO'
        }
        main_pollutant = pollution.get('mainus', 'p2')

        result = {
            'aqi': aqi,
            'level': aqi_info['level'],
            'level_en': aqi_info['level_en'],
            'level_color': aqi_info['level_color'],
            'recommendation': aqi_info['recommendation'],
            'diseases': aqi_info['diseases'],
            'icon': aqi_info['icon'],
            'bg_gradient': aqi_info['bg_gradient'],
            'main_pollutant': main_pollutant,
            'main_pollutant_name': pollutant_names.get(main_pollutant, 'PM2.5'),
            'weather': {
                'temperature': weather.get('tp', 20),
                'humidity': weather.get('hu', 50),
                'wind_speed': weather.get('ws', 3),
                'pressure': weather.get('pr', 1015),
                'icon': weather.get('ic', '01d'),
                'description': ''
            },
            'city': city_name_uz,
            'country': "O'zbekiston",
            'is_demo': False,
            'timestamp': pollution.get('ts', timezone.now().isoformat())
        }

        set_cache(cache_key, result)
        logger.info(f"Real IQAir data cached for {city}")
        return Response(result)

    # Demo fallback
    logger.warning(f"Using DEMO data for {city} (IQAir API failed)")
    result = get_demo_data(city_name_uz)
    set_cache(cache_key, result, 300)  # 5 minut

    return Response(result)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_air_quality_history(request):
    """Oxirgi 7 kun tarixi"""
    from datetime import timedelta

    city = request.GET.get('city', 'Toshkent')
    history = []
    base_aqi = 70

    days_uz = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']

    for i in range(7):
        date = timezone.now() - timedelta(days=i)
        aqi = base_aqi + random.randint(-20, 20)
        aqi = max(25, min(aqi, 160))
        aqi_info = get_aqi_info(aqi)

        history.append({
            'date': date.strftime('%Y-%m-%d'),
            'day_name': days_uz[date.weekday()],
            'aqi': aqi,
            'level': aqi_info['level'],
            'level_color': aqi_info['level_color'],
            'icon': aqi_info['icon']
        })

    return Response({'city': city, 'history': history})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_cities(request):
    """Shaharlar ro'yxati"""
    cities = [
        {'name': 'Toshkent', 'name_en': 'Tashkent', 'state': 'Tashkent', 'is_capital': True},
        {'name': 'Samarqand', 'name_en': 'Samarkand', 'state': 'Samarkand', 'is_capital': False},
        {'name': 'Buxoro', 'name_en': 'Bukhara', 'state': 'Bukhara', 'is_capital': False},
        {'name': 'Namangan', 'name_en': 'Namangan', 'state': 'Namangan', 'is_capital': False},
        {'name': 'Andijon', 'name_en': 'Andijan', 'state': 'Andijan', 'is_capital': False},
        {'name': "Farg'ona", 'name_en': 'Fergana', 'state': 'Fergana', 'is_capital': False},
        {'name': 'Qarshi', 'name_en': 'Karshi', 'state': 'Qashqadaryo', 'is_capital': False},
        {'name': 'Nukus', 'name_en': 'Nukus', 'state': 'Karakalpakstan', 'is_capital': False},
        {'name': 'Urganch', 'name_en': 'Urgench', 'state': 'Khorezm', 'is_capital': False},
        {'name': 'Jizzax', 'name_en': 'Jizzakh', 'state': 'Jizzakh', 'is_capital': False},
    ]
    return Response(cities)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_recommendations(request):
    """Sog'liq tavsiyanomalar"""
    aqi = int(request.GET.get('aqi', 50))
    aqi_info = get_aqi_info(aqi)

    recommendations = {
        'general': aqi_info['recommendation'],
        'outdoor_activity': 'Tavsiya etiladi' if aqi <= 100 else 'Cheklang' if aqi <= 150 else 'Tavsiya etilmaydi',
        'mask_needed': aqi > 150,
        'windows': 'Ochiq qoldiring' if aqi <= 100 else 'Yoping',
        'air_purifier': aqi > 100,
        'sensitive_groups': [
            'Astma bemorlari',
            'Yurak kasalliklari',
            'Keksalar (60+ yosh)',
            'Bolalar (0-12 yosh)',
            'Homilador ayollar'
        ] if aqi > 100 else [],
        'tips': []
    }

    if aqi <= 50:
        recommendations['tips'] = [
            "Tashqarida sport bilan shug'ullaning",
            "Bolalarni tashqarida o'ynatishingiz mumkin",
            "Derazalarni ochiq qoldiring"
        ]
    elif aqi <= 100:
        recommendations['tips'] = [
            "Sezgir odamlar ehtiyot bo'lsin",
            "Uzoq muddatli tashqi faoliyatni cheklang",
            "Suv ko'proq iching"
        ]
    elif aqi <= 150:
        recommendations['tips'] = [
            "Tashqarida jismoniy faoliyatni kamaytiring",
            "N95 niqob taqing",
            "Uyda havo tozalagich ishlating"
        ]
    else:
        recommendations['tips'] = [
            "Iloji bo'lsa uyda qoling",
            "Derazalarni yoping",
            "Havo tozalagich ishlating",
            "N95 niqob taqing"
        ]

    return Response({
        'aqi': aqi,
        'level': aqi_info['level'],
        'diseases': aqi_info['diseases'],
        'recommendations': recommendations
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def test_iqair_api(request):
    """IQAir API ni test qilish uchun endpoint"""
    city = request.GET.get('city', 'Tashkent')

    result = {
        'api_key_configured': bool(IQAIR_API_KEY),
        'api_key_length': len(IQAIR_API_KEY) if IQAIR_API_KEY else 0,
        'city_requested': city,
    }

    city_info = CITY_MAPPING.get(city, CITY_MAPPING['Tashkent'])
    result['city_mapped'] = city_info

    # IQAir API ni sinab ko'rish
    api_data = fetch_from_iqair(city_info['city'], city_info['state'], city_info['country'])

    if api_data:
        result['api_status'] = 'SUCCESS'
        result['api_response'] = {
            'city': api_data.get('city'),
            'state': api_data.get('state'),
            'country': api_data.get('country'),
            'aqi': api_data.get('current', {}).get('pollution', {}).get('aqius'),
        }
    else:
        result['api_status'] = 'FAILED'
        result['api_response'] = None

    return Response(result)


@api_view(['GET'])
@permission_classes([AllowAny])
def clear_cache(request):
    """Cache ni tozalash"""
    global _cache
    old_count = len(_cache)
    _cache = {}
    return Response({
        'status': 'success',
        'message': f'Cache tozalandi. {old_count} ta yozuv o\'chirildi.',
        'cleared_count': old_count
    })