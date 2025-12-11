# ai_service/throttling.py
from rest_framework.throttling import SimpleRateThrottle


class AIServiceThrottle(SimpleRateThrottle):
    """
    AI service endpointlari uchun maxsus throttle.
    Anonim foydalanuvchilar uchun qattiqroq limit.
    """
    scope = 'ai_service'

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            # Authenticated foydalanuvchi - user ID asosida
            ident = request.user.pk
        else:
            # Anonim - IP asosida
            ident = self.get_ident(request)

        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class AIServiceAnonThrottle(SimpleRateThrottle):
    """
    Faqat anonim foydalanuvchilar uchun qattiqroq limit.
    Soatiga 10 ta so'rov.
    """
    scope = 'ai_anon'
    rate = '10/hour'

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return None  # Authenticated users skip this throttle

        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }


class SymptomCheckThrottle(SimpleRateThrottle):
    """
    Symptom check uchun kunlik limit.
    """
    scope = 'symptom_check'
    rate = '50/day'

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)

        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
