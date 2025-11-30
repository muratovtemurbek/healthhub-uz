import json
import google.generativeai as genai
from django.conf import settings
from doctors.models import Doctor
from medicines.models import Medicine
from appointments.models import Appointment

# Gemini konfiguratsiya
genai.configure(api_key=settings.GEMINI_API_KEY)


class HealthAgent:
    """AI Agent - Google Gemini bilan"""

    def __init__(self, user=None):
        self.user = user
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.context = {
            'user_symptoms': '',
            'recommended_specialization': None,
        }

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
            response = self.model.generate_content(prompt)
            text = self._clean_json(response.text)
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
            response = self.model.generate_content(prompt)
            text = self._clean_json(response.text)

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