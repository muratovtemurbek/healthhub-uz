# ai_service/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.conf import settings
from doctors.models import Doctor, Specialization

# Gemini API
try:
    import google.generativeai as genai

    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class AIConsultationViewSet(viewsets.ViewSet):
    """AI Shifokor - Alomatlarni tahlil qilish va shifokorga yo'naltirish"""
    permission_classes = [AllowAny]

    def list(self, request):
        return Response({
            'message': 'AI Shifokor API',
            'description': 'Alomatlaringizni kiriting, biz sizga yordam beramiz',
            'endpoints': {
                'analyze': 'POST /api/ai/consultations/analyze/',
            }
        })

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def analyze(self, request):
        """Alomatlarni tahlil qilish va shifokorga yo'naltirish"""
        symptoms = request.data.get('symptoms', '').strip()

        if not symptoms:
            return Response({
                'error': 'Iltimos, alomatlaringizni kiriting'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # AI tahlil
            analysis_result = self._analyze_symptoms(symptoms)

            # Mos shifokorlarni topish
            recommended_doctors = self._find_doctors(analysis_result.get('specialization_key'))

            return Response({
                'success': True,
                'symptoms': symptoms,
                'analysis': analysis_result.get('analysis'),
                'severity': analysis_result.get('severity'),
                'severity_color': self._get_severity_color(analysis_result.get('severity')),
                'first_aid': analysis_result.get('first_aid'),
                'home_treatment': analysis_result.get('home_treatment'),
                'warning_signs': analysis_result.get('warning_signs'),
                'specialization': analysis_result.get('specialization'),
                'recommended_doctors': recommended_doctors,
                'disclaimer': '⚠️ Bu AI tahlili faqat ma\'lumot uchun. Aniq tashxis uchun shifokorga murojaat qiling.'
            })

        except Exception as e:
            print(f"AI Error: {e}")
            return Response({
                'success': False,
                'error': 'AI tahlilida xatolik yuz berdi',
                'fallback': self._get_fallback_response(symptoms)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def analyze_symptoms(self, request):
        """Alias"""
        return self.analyze(request)

    def _analyze_symptoms(self, symptoms: str) -> dict:
        """Gemini AI bilan tahlil"""

        # Gemini API bilan
        if GEMINI_AVAILABLE:
            api_key = getattr(settings, 'GEMINI_API_KEY', None)
            if api_key:
                try:
                    return self._analyze_with_gemini(symptoms, api_key)
                except Exception as e:
                    print(f"Gemini error: {e}")

        # Fallback - lokal tahlil
        return self._local_analysis(symptoms)

    def _analyze_with_gemini(self, symptoms: str, api_key: str) -> dict:
        """Gemini API bilan tahlil"""
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        prompt = f"""
Sen professional tibbiy AI assistantsan. O'zbek tilida javob ber.

Bemor alomatlari: {symptoms}

Quyidagi JSON formatida javob ber (faqat JSON, boshqa hech narsa yo'q):
{{
    "analysis": "Alomatlar tahlili - nimani ko'rsatishi mumkin",
    "severity": "past/o'rta/yuqori/jiddiy",
    "first_aid": [
        "1-yordam ko'rsatmasi 1",
        "1-yordam ko'rsatmasi 2",
        "1-yordam ko'rsatmasi 3"
    ],
    "home_treatment": [
        "Uy sharoitida davolash 1",
        "Uy sharoitida davolash 2"
    ],
    "warning_signs": [
        "Qachon shifokorga shoshilinch murojaat qilish kerak 1",
        "Qachon shifokorga shoshilinch murojaat qilish kerak 2"
    ],
    "specialization": "Tavsiya etiladigan shifokor turi (masalan: Terapevt, Kardiolog, Nevrolog)",
    "specialization_key": "terapevt/kardiolog/nevrolog/pediatr/dermatolog/lor/ginekolog/stomatolog/oftalmolog/urolog/psixiatr/travmatolog"
}}
"""

        response = model.generate_content(prompt)
        text = response.text.strip()

        # JSON parse
        import json
        if text.startswith('```'):
            text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]

        result = json.loads(text)
        return result

    def _local_analysis(self, symptoms: str) -> dict:
        """Lokal tahlil - Gemini ishlamasa"""
        symptoms_lower = symptoms.lower()

        # Alomatlar bo'yicha tahlil
        if any(w in symptoms_lower for w in ['yurak', 'ko\'krak', 'nafas', 'qisish', 'bosim']):
            return {
                'analysis': 'Ko\'krak sohasida og\'riq yoki nafas qisilishi yurak-qon tomir muammolarini ko\'rsatishi mumkin.',
                'severity': 'yuqori',
                'first_aid': [
                    '🚨 Darhol o\'tiring yoki yoting',
                    '💊 Agar nitroglitserin bo\'lsa, til ostiga qo\'ying',
                    '📞 Tez yordam chaqiring (103)',
                    '👔 Kiyimlarni bo\'shating, havo kirsin'
                ],
                'home_treatment': [
                    'Dam oling, harakat qilmang',
                    'Xonani shamollating'
                ],
                'warning_signs': [
                    '⚠️ Ko\'krak og\'rig\'i 5 daqiqadan ko\'p davom etsa',
                    '⚠️ Nafas olish qiyinlashsa',
                    '⚠️ Chap qo\'l yoki jag\' og\'risa'
                ],
                'specialization': 'Kardiolog',
                'specialization_key': 'kardiolog'
            }

        elif any(w in symptoms_lower for w in ['bosh', 'migren', 'bosh aylanishi']):
            return {
                'analysis': 'Bosh og\'rig\'i turli sabablarga ko\'ra paydo bo\'lishi mumkin: stress, charchoq, bosim o\'zgarishi.',
                'severity': 'o\'rta',
                'first_aid': [
                    '🛏️ Qorong\'i, tinch xonada dam oling',
                    '💧 Ko\'p suv iching (kamida 2 stakan)',
                    '🧊 Peshonaga sovuq kompress qo\'ying',
                    '💊 Paratsetamol yoki ibuprofen ichishingiz mumkin'
                ],
                'home_treatment': [
                    'Ekranlarga (telefon, kompyuter) kam qarang',
                    'Yetarli uxlang (7-8 soat)',
                    'Stress kamaytiring'
                ],
                'warning_signs': [
                    '⚠️ Og\'riq juda kuchli va to\'satdan boshlansa',
                    '⚠️ Ko\'ngil aynishi, qusish bo\'lsa',
                    '⚠️ Ko\'rish buzilsa'
                ],
                'specialization': 'Nevrolog',
                'specialization_key': 'nevrolog'
            }

        elif any(w in symptoms_lower for w in ['harorat', 'isitma', 'temperatura', 'gripp', 'shamollash']):
            return {
                'analysis': 'Tana haroratining ko\'tarilishi organizmning infeksiyaga qarshi kurashi belgisi.',
                'severity': 'o\'rta',
                'first_aid': [
                    '🌡️ Haroratni o\'lchang va yozib qo\'ying',
                    '💧 Ko\'p suyuqlik iching (suv, choy, kompot)',
                    '💊 38.5°C dan oshsa paratsetamol ichish mumkin',
                    '🧣 Yengil kiyining, juda issiq o\'ramang'
                ],
                'home_treatment': [
                    'Dam oling, ko\'p uxlang',
                    'Xonani shamollating',
                    'Vitaminli oziq-ovqat iste\'mol qiling',
                    'Issiq choy, asal, limon iching'
                ],
                'warning_signs': [
                    '⚠️ Harorat 39°C dan oshsa',
                    '⚠️ 3 kundan ko\'p davom etsa',
                    '⚠️ Nafas olish qiyinlashsa'
                ],
                'specialization': 'Terapevt',
                'specialization_key': 'terapevt'
            }

        elif any(w in symptoms_lower for w in ['tomoq', 'angina', 'yutish']):
            return {
                'analysis': 'Tomoq og\'rig\'i virusli yoki bakterial infeksiya belgisi bo\'lishi mumkin.',
                'severity': 'o\'rta',
                'first_aid': [
                    '🧂 Tuzli iliq suv bilan tomoqni chayqang',
                    '🍯 Issiq choy + asal iching',
                    '💊 Tomoq uchun pastilkalar ishlating',
                    '🗣️ Kam gapiring, ovozni saqlang'
                ],
                'home_treatment': [
                    'Iliq ichimliklar iching',
                    'Qattiq, achchiq ovqatdan saqlaning',
                    'Xonada namlik saqlang'
                ],
                'warning_signs': [
                    '⚠️ Yutish juda og\'riq bo\'lsa',
                    '⚠️ Harorat 38.5°C dan oshsa',
                    '⚠️ Tomoqda oq dog\'lar paydo bo\'lsa'
                ],
                'specialization': 'LOR',
                'specialization_key': 'lor'
            }

        elif any(w in symptoms_lower for w in ['oshqozon', 'qorin', 'ich', 'ko\'ngil aynishi', 'qusish']):
            return {
                'analysis': 'Oshqozon-ichak muammolari turli sabablarga ko\'ra paydo bo\'lishi mumkin.',
                'severity': 'o\'rta',
                'first_aid': [
                    '🚫 Ovqat yemang (bir necha soat)',
                    '💧 Oz-ozdan suv iching',
                    '🛏️ Dam oling, yoting',
                    '💊 Faol ko\'mir ichishingiz mumkin'
                ],
                'home_treatment': [
                    'Yengil dieta saqlang (guruch suvi, quruq non)',
                    'Yog\'li, achchiq ovqatdan saqlaning',
                    'Ko\'p suyuqlik iching'
                ],
                'warning_signs': [
                    '⚠️ Qonda qusish bo\'lsa',
                    '⚠️ Kuchli qorin og\'rig\'i bo\'lsa',
                    '⚠️ 24 soatdan ko\'p davom etsa'
                ],
                'specialization': 'Terapevt',
                'specialization_key': 'terapevt'
            }

        elif any(w in symptoms_lower for w in ['tosh', 'qizarish', 'qichishish', 'allergiya']):
            return {
                'analysis': 'Teri muammolari allergiya, infeksiya yoki boshqa sabablardan bo\'lishi mumkin.',
                'severity': 'past',
                'first_aid': [
                    '🧊 Sovuq kompress qo\'ying',
                    '🚫 Qichimang, tirnash',
                    '💊 Antihistamin dori ichishingiz mumkin',
                    '🧴 Namlantiruvchi krem suring'
                ],
                'home_treatment': [
                    'Issiq suv bilan yuvinmang',
                    'Sintetik kiyimlardan saqlaning',
                    'Allergenlarsiz detergent ishlating'
                ],
                'warning_signs': [
                    '⚠️ Nafas olish qiyinlashsa',
                    '⚠️ Shishish kuchaysa',
                    '⚠️ Harorat ko\'tarilsa'
                ],
                'specialization': 'Dermatolog',
                'specialization_key': 'dermatolog'
            }

        elif any(w in symptoms_lower for w in ['bola', 'chaqaloq', 'bolam']):
            return {
                'analysis': 'Bolalardagi alomatlar alohida e\'tibor talab qiladi.',
                'severity': 'o\'rta',
                'first_aid': [
                    '🌡️ Haroratni o\'lchang',
                    '💧 Suyuqlik bering',
                    '👀 Bolaning ahvolini kuzating',
                    '📞 Pediatrga qo\'ng\'iroq qiling'
                ],
                'home_treatment': [
                    'Dam olishini ta\'minlang',
                    'Yengil kiyintiring',
                    'Oz-ozdan suyuqlik bering'
                ],
                'warning_signs': [
                    '⚠️ Harorat 38°C dan oshsa (1 yoshgacha)',
                    '⚠️ Bola juda bo\'shashsa',
                    '⚠️ Ovqat yemasa'
                ],
                'specialization': 'Pediatr',
                'specialization_key': 'pediatr'
            }

        else:
            return {
                'analysis': f'Sizning alomatlaringiz: "{symptoms}". Aniq tashxis uchun shifokor ko\'rigi kerak.',
                'severity': 'past',
                'first_aid': [
                    '🛏️ Dam oling',
                    '💧 Ko\'p suyuqlik iching',
                    '📝 Alomatlarni yozib boring',
                    '📞 Shifokorga murojaat qiling'
                ],
                'home_treatment': [
                    'Yetarli dam oling',
                    'Sog\'lom ovqatlaning',
                    'Stress kamaytiring'
                ],
                'warning_signs': [
                    '⚠️ Alomatlar kuchaysa',
                    '⚠️ Yangi alomatlar paydo bo\'lsa',
                    '⚠️ 2-3 kundan ko\'p davom etsa'
                ],
                'specialization': 'Terapevt',
                'specialization_key': 'terapevt'
            }

    def _find_doctors(self, specialization_key: str) -> list:
        """Mos shifokorlarni topish"""
        if not specialization_key:
            specialization_key = 'terapevt'

        # Mutaxassislik bo'yicha qidirish
        spec_mapping = {
            'terapevt': ['Terapevt', 'General Practitioner', 'Терапевт'],
            'kardiolog': ['Kardiolog', 'Cardiologist', 'Кардиолог'],
            'nevrolog': ['Nevrolog', 'Neurologist', 'Невролог'],
            'pediatr': ['Pediatr', 'Pediatrician', 'Педиатр'],
            'dermatolog': ['Dermatolog', 'Dermatologist', 'Дерматолог'],
            'lor': ['LOR', 'Otolaryngologist', 'ЛОР', 'ENT'],
            'ginekolog': ['Ginekolog', 'Gynecologist', 'Гинеколог'],
            'stomatolog': ['Stomatolog', 'Dentist', 'Стоматолог'],
            'oftalmolog': ['Oftalmolog', 'Ophthalmologist', 'Офтальмолог'],
            'urolog': ['Urolog', 'Urologist', 'Уролог'],
            'psixiatr': ['Psixiatr', 'Psychiatrist', 'Психиатр'],
            'travmatolog': ['Travmatolog', 'Traumatologist', 'Травматолог'],
        }

        search_names = spec_mapping.get(specialization_key.lower(), ['Terapevt'])

        doctors = []
        try:
            # Specialization topish
            for name in search_names:
                specs = Specialization.objects.filter(name__icontains=name) | \
                        Specialization.objects.filter(name_uz__icontains=name)

                for spec in specs:
                    spec_doctors = Doctor.objects.filter(
                        specialization=spec,
                        is_available=True
                    ).select_related('user', 'hospital')[:5]

                    for doc in spec_doctors:
                        if len(doctors) >= 3:
                            break
                        doctors.append({
                            'id': str(doc.id),
                            'name': f"{doc.user.first_name} {doc.user.last_name}".strip() if doc.user else "Shifokor",
                            'specialization': spec.name_uz or spec.name,
                            'hospital': doc.hospital.name if doc.hospital else "N/A",
                            'rating': str(doc.rating or 4.5),
                            'experience_years': doc.experience_years or 0,
                            'price': str(doc.consultation_price or 0),
                            'available': doc.is_available
                        })

            # Agar topilmasa, barcha faol shifokorlardan
            if not doctors:
                all_doctors = Doctor.objects.filter(is_available=True).select_related('user', 'specialization',
                                                                                      'hospital')[:3]
                for doc in all_doctors:
                    doctors.append({
                        'id': str(doc.id),
                        'name': f"{doc.user.first_name} {doc.user.last_name}".strip() if doc.user else "Shifokor",
                        'specialization': doc.specialization.name_uz if doc.specialization else "Terapevt",
                        'hospital': doc.hospital.name if doc.hospital else "N/A",
                        'rating': str(doc.rating or 4.5),
                        'experience_years': doc.experience_years or 0,
                        'price': str(doc.consultation_price or 0),
                        'available': True
                    })

        except Exception as e:
            print(f"Doctor search error: {e}")

        return doctors

    def _get_severity_color(self, severity: str) -> str:
        """Jiddiylik darajasi uchun rang"""
        colors = {
            'past': 'green',
            'o\'rta': 'yellow',
            'yuqori': 'orange',
            'jiddiy': 'red'
        }
        return colors.get(severity, 'gray')

    def _get_fallback_response(self, symptoms: str) -> dict:
        """Xatolik bo'lsa fallback"""
        return {
            'analysis': 'AI tahlilida vaqtinchalik muammo. Iltimos, shifokorga murojaat qiling.',
            'severity': 'noma\'lum',
            'first_aid': ['Shifokorga murojaat qiling', 'Dam oling'],
            'specialization': 'Terapevt',
            'recommended_doctors': []
        }