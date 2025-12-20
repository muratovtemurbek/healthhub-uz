import json
import time
import google.generativeai as genai
from django.conf import settings
from doctors.models import Doctor
from medicines.models import Medicine
from appointments.models import Appointment

# Gemini konfiguratsiya
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    GEMINI_CONFIGURED = True
except Exception:
    GEMINI_CONFIGURED = False


class HealthAgent:
    """AI Agent - Google Gemini bilan (retry logic bilan)"""

    # Modellar ro'yxati - fallback uchun
    MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash-exp', 'gemini-2.0-flash']

    def __init__(self, user=None):
        self.user = user
        self.current_model_index = 0
        self.model = self._get_model()
        self.context = {
            'user_symptoms': '',
            'recommended_specialization': None,
        }

    def _get_model(self):
        """Joriy modelni olish"""
        model_name = self.MODELS[self.current_model_index]
        return genai.GenerativeModel(model_name)

    def _try_next_model(self):
        """Keyingi modelga o'tish"""
        if self.current_model_index < len(self.MODELS) - 1:
            self.current_model_index += 1
            self.model = self._get_model()
            return True
        return False

    def _generate_with_retry(self, prompt: str, max_retries: int = 2) -> str:
        """Retry logic bilan content generatsiya"""
        last_error = None

        for _ in range(len(self.MODELS)):
            for attempt in range(max_retries):
                try:
                    response = self.model.generate_content(prompt)
                    return response.text
                except Exception as e:
                    last_error = e
                    error_str = str(e).lower()

                    # Quota xatosi
                    if '429' in str(e) or 'quota' in error_str or 'rate' in error_str:
                        print(f"Gemini quota error: {e}")
                        time.sleep(1)
                        break  # Boshqa modelga o'tish

                    print(f"Gemini error (attempt {attempt + 1}): {e}")
                    time.sleep(0.5)

            # Keyingi modelga o'tish
            if not self._try_next_model():
                break

        raise last_error or Exception("Gemini API bilan bog'lanib bo'lmadi")

    def _clean_json(self, text: str) -> str:
        """JSON ni tozalash"""
        text = text.strip()
        if '```json' in text:
            text = text.split('```json')[1].split('```')[0]
        elif '```' in text:
            parts = text.split('```')
            if len(parts) >= 2:
                text = parts[1]
        return text.strip()

    def analyze_symptoms(self, symptoms: str) -> dict:
        """Alomatlarni tahlil qilish"""
        prompt = f"""Sen tajribali tibbiy AI assistantsan. Quyidagi alomatlarni tahlil qil.

Alomatlar: {symptoms}

FAQAT quyidagi JSON formatda javob ber, boshqa hech narsa yozma:
{{
    "severity": "past",
    "possible_conditions": ["kasallik1", "kasallik2"],
    "recommended_specialization": "Terapevt",
    "urgency": "oddiy",
    "home_remedies": ["tavsiya1", "tavsiya2"],
    "warning_signs": ["ogohlantirish1"]
}}

severity: "past", "o'rta", "yuqori", "jiddiy" dan biri
urgency: "oddiy", "tez", "shoshilinch" dan biri
recommended_specialization: Terapevt, Kardiolog, Nevrolog, Pediatr, Ginekolog, Dermatolog, Oftalmolog, LOR, Travmatolog, Psixolog dan biri"""

        try:
            response_text = self._generate_with_retry(prompt)
            text = self._clean_json(response_text)
            result = json.loads(text)
            self.context['user_symptoms'] = symptoms
            self.context['recommended_specialization'] = result.get('recommended_specialization')
            return result
        except Exception as e:
            print(f"Analyze error: {e}")
            return {
                "severity": "o'rta",
                "possible_conditions": ["Shifokor ko'rigi talab etiladi"],
                "recommended_specialization": "Terapevt",
                "urgency": "oddiy",
                "home_remedies": ["Dam oling", "Ko'p suyuqlik iching"],
                "warning_signs": ["Holat yomonlashsa shifokorga boring"]
            }

    def find_doctors(self, specialization: str = None, limit: int = 5) -> list:
        """Shifokorlarni topish"""
        spec = specialization or self.context.get('recommended_specialization')

        queryset = Doctor.objects.filter(is_available=True)

        if spec:
            # Faqat name_uz bilan qidirish
            queryset = queryset.filter(specialization__name_uz__icontains=spec)

        # Agar topilmasa, barcha shifokorlarni qaytarish
        if not queryset.exists():
            queryset = Doctor.objects.filter(is_available=True)

        doctors = queryset.order_by('-rating')[:limit]

        return [{
            'id': d.id,
            'name': f"{d.user.first_name} {d.user.last_name}",
            'specialization': d.specialization.name_uz if d.specialization else '',
            'hospital': d.hospital.name if d.hospital else '',
            'rating': float(d.rating) if d.rating else 4.5,
            'experience': d.experience_years or 0,
            'price': float(d.consultation_price) if d.consultation_price else 150000,
        } for d in doctors]

    def search_medicines(self, query: str) -> list:
        """Dori qidirish"""
        from django.db.models import Q
        medicines = Medicine.objects.filter(
            Q(name__icontains=query) | Q(generic_name__icontains=query)
        )[:10]

        return [{
            'id': m.id,
            'name': m.name,
            'generic_name': m.generic_name or '',
            'manufacturer': m.manufacturer or '',
        } for m in medicines]

    def process_message(self, user_message: str) -> dict:
        """Xabarni qayta ishlash"""

        prompt = f"""Sen HealthHub UZ AI agentisan. O'zbek tilida javob ber.

Foydalanuvchi: {user_message}

FAQAT quyidagi JSON formatda javob ber:
{{
    "intent": "symptoms",
    "response": "O'zbek tilida iliq javob",
    "action": {{"type": "analyze"}},
    "suggestions": ["taklif1", "taklif2"]
}}

intent qiymatlari:
- "symptoms" - agar foydalanuvchi kasallik/alomat haqida yozsa
- "find_doctor" - agar shifokor so'rasa
- "medicine_search" - agar dori haqida so'rasa
- "general_chat" - agar umumiy savol bo'lsa

action.type qiymatlari:
- "analyze" - alomatlarni tahlil qilish
- "search_doctors" - shifokor qidirish
- "search_medicine" - dori qidirish
- "none" - hech narsa qilmaslik"""

        try:
            response_text = self._generate_with_retry(prompt)
            text = self._clean_json(response_text)

            try:
                result = json.loads(text)
            except:
                result = {
                    "intent": "general_chat",
                    "response": "Sizga qanday yordam bera olaman? Alomatlaringizni ayting yoki shifokor tanlashda yordam beraman.",
                    "action": {"type": "none"},
                    "suggestions": ["Alomatlarim bor", "Shifokor kerak", "Dori qidirish"]
                }

            # Action bajarish
            action_type = result.get('action', {}).get('type', 'none')
            action_result = None

            if action_type == 'analyze':
                action_result = self.analyze_symptoms(user_message)
                if action_result and 'error' not in action_result:
                    action_result['recommended_doctors'] = self.find_doctors()

            elif action_type == 'search_doctors':
                action_result = self.find_doctors()

            elif action_type == 'search_medicine':
                action_result = self.search_medicines(user_message)

            return {
                "success": True,
                "intent": result.get('intent'),
                "response": result.get('response'),
                "action_result": action_result,
                "suggestions": result.get('suggestions', []),
                "context": self.context
            }

        except Exception as e:
            print(f"Process error: {e}")
            return {
                "success": False,
                "error": str(e),
                "response": "Xatolik yuz berdi. Qayta urinib ko'ring.",
                "suggestions": ["Qayta urinish"]
            }