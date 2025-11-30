# ai_service/ai_helper.py
import anthropic
from django.conf import settings
import json


class HealthAI:
    def __init__(self):
        # API key hali yo'q, keyinroq qo'shamiz
        self.client = None
        try:
            if settings.ANTHROPIC_API_KEY:
                self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        except:
            pass

    def analyze_symptoms(self, symptoms: str, age: int, gender: str,
                         medical_history: list = None) -> dict:
        """
        AI-powered symptom analysis
        """
        if not self.client:
            # Fallback to rule-based system
            return self._fallback_analysis(symptoms, age, gender)

        prompt = f"""
        Siz O'zbekiston tibbiyot ekspertisiz. Bemorning ma'lumotlarini tahlil qiling:

        BEMOR MA'LUMOTLARI:
        - Yosh: {age}
        - Jins: {'Erkak' if gender == 'male' else 'Ayol'}
        - Alomatlar: {symptoms}
        - Tibbiy tarix: {medical_history or 'Yo\'q'}

        QUYIDAGILARNI TAHLIL QILING:

        1. MUMKIN BO'LGAN KASALLIKLAR (ehtimollik % bilan):
           - Eng ehtimollik 3 ta kasallik
           - Har birining asosiy belgilari

        2. SHOSHILINCH HOLAT BAHOLASH:
           - Xavf darajasi (1-10)
           - 8+ bo'lsa: ZUDLIK BILAN TONG'ICH YORDAM!
           - 5-7: Bugun shifokorga boring
           - 1-4: Bir necha kun kuzating

        3. MUTAXASSIS TAVSIYASI:
           - Qaysi shifokorga murojaat qilish kerak
           - Tashxis uchun qanday testlar kerak bo'lishi mumkin

        4. BIRINCHI YORDAM:
           - Uyda qiladigan 3-4 ta maslahat
           - Qilmaslik kerak bo'lgan narsalar

        5. OGOHLANTIRISH:
           - Qanday belgilar paydo bo'lsa zudlik bilan tibbiy yordam kerak

        JSON formatda javob bering:
        {{
            "possible_conditions": [
                {{
                    "name": "Kasallik nomi",
                    "probability": 85,
                    "key_symptoms": ["belgi1", "belgi2"],
                    "description": "Qisqacha tavsif"
                }}
            ],
            "urgency": {{
                "level": 7,
                "category": "urgent",
                "message": "Bugun shifokorga boring"
            }},
            "recommended_specialist": {{
                "type": "terapevt",
                "reason": "Sabab"
            }},
            "first_aid": [
                "Ko'p suyuqlik iching",
                "Dam oling"
            ],
            "warnings": [
                "Agar harorat 39+ bo'lsa zudlik bilan"
            ],
            "tests_needed": [
                "Umumiy qon tahlili"
            ]
        }}
        """

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            result = json.loads(response.content[0].text)

            # Add urgency category
            urgency = result['urgency']['level']
            if urgency >= 8:
                result['urgency']['category'] = 'emergency'
                result['urgency']['color'] = 'red'
            elif urgency >= 5:
                result['urgency']['category'] = 'urgent'
                result['urgency']['color'] = 'orange'
            else:
                result['urgency']['category'] = 'routine'
                result['urgency']['color'] = 'green'

            return result

        except Exception as e:
            print(f"AI Error: {e}")
            return self._fallback_analysis(symptoms, age, gender)

    def _fallback_analysis(self, symptoms: str, age: int, gender: str) -> dict:
        """
        Simple rule-based fallback
        """
        symptoms_lower = symptoms.lower()

        # Emergency keywords
        emergency_keywords = ['yurak', 'nafas', 'qon', 'bosh aylanish', 'hushsizlik', 'ko\'krak og\'rig\'i']
        urgent_keywords = ['harorat', 'og\'riq', 'qayt', 'diareya', 'bosh og\'rig\'i']

        urgency_level = 3
        for keyword in emergency_keywords:
            if keyword in symptoms_lower:
                urgency_level = 9
                break

        if urgency_level < 9:
            for keyword in urgent_keywords:
                if keyword in symptoms_lower:
                    urgency_level = 6
                    break

        return {
            "possible_conditions": [
                {
                    "name": "Umumiy holsizlik",
                    "probability": 60,
                    "key_symptoms": [symptoms[:50]],
                    "description": "Aniqroq tashxis uchun shifokorga murojaat qiling"
                }
            ],
            "urgency": {
                "level": urgency_level,
                "category": "emergency" if urgency_level >= 8 else "urgent" if urgency_level >= 5 else "routine",
                "message": "Zudlik bilan shifoxonaga boring!" if urgency_level >= 8 else "Shifokorga murojaat qiling" if urgency_level >= 5 else "Bir necha kun kuzating",
                "color": "red" if urgency_level >= 8 else "orange" if urgency_level >= 5 else "green"
            },
            "recommended_specialist": {
                "type": "terapevt",
                "reason": "Umumiy ko'rik uchun"
            },
            "first_aid": [
                "Dam oling",
                "Ko'p suyuqlik iching",
                "Haroratni kuzatib boring"
            ],
            "warnings": [
                "Ahvol yomonlashsa zudlik bilan shifokorga murojaat qiling"
            ],
            "tests_needed": []
        }