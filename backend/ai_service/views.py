# ai_service/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.conf import settings
from django.utils import timezone

# Models
from .models import SymptomCheck, Symptom, MedicalCondition, AIConsultation

# Gemini API
try:
    import google.generativeai as genai

    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# Doctor models
try:
    from doctors.models import Doctor, Specialization

    DOCTORS_AVAILABLE = True
except ImportError:
    DOCTORS_AVAILABLE = False

# ==================== SYMPTOM-CONDITION MAPPING ====================
SYMPTOM_CONDITION_MAP = {
    # Bosh
    "bosh og'rig'i": {
        "conditions": ["Migren", "Gipertoniya", "Sinuzit", "Stress", "Ko'z charchashi"],
        "specializations": ["Nevrolog", "Terapevt"],
        "urgency": "normal",
        "first_aid": ["Qorong'i xonada dam oling", "Ko'p suv iching", "Paratsetamol ichishingiz mumkin"]
    },
    "bosh aylanishi": {
        "conditions": ["Anemiya", "Gipotoniya", "Ichki quloq muammosi", "Stress"],
        "specializations": ["Nevrolog", "Terapevt", "LOR"],
        "urgency": "normal",
        "first_aid": ["O'tiring yoki yoting", "Boshingizni past tuting", "Suv iching"]
    },
    "ko'z og'rig'i": {
        "conditions": ["Kon'yunktivit", "Glaukoma", "Ko'z charchashi"],
        "specializations": ["Oftalmolog"],
        "urgency": "normal",
        "first_aid": ["Ko'zni ishqalamang", "Ekranlarga qaramang", "Sovuq kompress qo'ying"]
    },
    "kuchli bosh og'rig'i": {
        "conditions": ["Insult", "Meningit", "Gipertoniya krizi"],
        "specializations": ["Nevrolog", "Tez yordam"],
        "urgency": "emergency",
        "first_aid": ["DARHOL 103 ga qo'ng'iroq qiling!", "Harakatsiz yoting", "Yordam kelishini kuting"]
    },

    # Ko'krak
    "ko'krak og'rig'i": {
        "conditions": ["Yurak kasalligi", "Gastrit", "Muskulyar og'riq", "Angor pektoris"],
        "specializations": ["Kardiolog", "Terapevt"],
        "urgency": "high",
        "first_aid": ["O'tiring va dam oling", "Nitroglitserin bo'lsa - til ostiga", "103 ga qo'ng'iroq qiling"]
    },
    "nafas qisilishi": {
        "conditions": ["Astma", "Pnevmoniya", "Yurak yetishmovchiligi", "Bronxit"],
        "specializations": ["Pulmonolog", "Kardiolog"],
        "urgency": "high",
        "first_aid": ["Tik o'tiring", "Kiyimlarni bo'shating", "Derazani oching"]
    },
    "yurak urishi tezlashishi": {
        "conditions": ["Taxikardiya", "Aritmiya", "Stress", "Gipertireoz"],
        "specializations": ["Kardiolog"],
        "urgency": "high",
        "first_aid": ["Chuqur nafas oling", "O'tiring va tinchlaning", "Sovuq suv iching"]
    },

    # Qorin
    "qorin og'rig'i": {
        "conditions": ["Gastrit", "Appenditsit", "Icak kasalligi", "Oshqozon yarasi"],
        "specializations": ["Gastroenterolog", "Terapevt"],
        "urgency": "normal",
        "first_aid": ["Yemang va ichmang", "Yoting", "Issiq kompress qo'ying"]
    },
    "ko'ngil aynishi": {
        "conditions": ["Gastrit", "Zaharlanish", "Homiladorlik", "Migren"],
        "specializations": ["Gastroenterolog", "Terapevt"],
        "urgency": "normal",
        "first_aid": ["Toza havoda nafas oling", "Oz-ozdan suv iching", "Yengil ovqat yeng"]
    },
    "ich ketishi": {
        "conditions": ["Infeksiya", "Zaharlanish", "Disbakterioz"],
        "specializations": ["Gastroenterolog", "Infeksionist"],
        "urgency": "normal",
        "first_aid": ["Ko'p suyuqlik iching", "Rehydron tayyorlang", "Yengil dieta saqlang"]
    },
    "qusish": {
        "conditions": ["Zaharlanish", "Gastrit", "Infeksiya"],
        "specializations": ["Gastroenterolog", "Infeksionist"],
        "urgency": "normal",
        "first_aid": ["Ovqat yemang", "Oz-ozdan suv iching", "Dam oling"]
    },

    # Umumiy
    "isitma": {
        "conditions": ["Gripp", "ORVI", "Infeksiya", "Yallig'lanish"],
        "specializations": ["Terapevt", "Infeksionist"],
        "urgency": "normal",
        "first_aid": ["Ko'p suyuqlik iching", "38.5°C dan oshsa paratsetamol", "Dam oling"]
    },
    "yo'tal": {
        "conditions": ["Bronxit", "Pnevmoniya", "ORVI", "Allergiya"],
        "specializations": ["Pulmonolog", "Terapevt", "LOR"],
        "urgency": "normal",
        "first_aid": ["Iliq suyuqlik iching", "Xonani namlang", "Asal bilan choy iching"]
    },
    "burun bitishi": {
        "conditions": ["Rinit", "Sinuzit", "Allergiya", "ORVI"],
        "specializations": ["LOR", "Allergolog"],
        "urgency": "low",
        "first_aid": ["Tuzli suv bilan yuvning", "Ko'proq suyuqlik iching", "Xonani namlang"]
    },
    "tomoq og'rig'i": {
        "conditions": ["Angina", "Faringit", "ORVI"],
        "specializations": ["LOR", "Terapevt"],
        "urgency": "normal",
        "first_aid": ["Tuzli suv bilan chayqang", "Iliq choy iching", "Kam gapiring"]
    },
    "holsizlik": {
        "conditions": ["Anemiya", "Vitamin yetishmovchiligi", "Depressiya", "Qalqonsimon bez"],
        "specializations": ["Terapevt", "Endokrinolog"],
        "urgency": "low",
        "first_aid": ["Dam oling", "To'g'ri ovqatlaning", "Tahlil topshiring"]
    },
    "uyqu buzilishi": {
        "conditions": ["Insomnia", "Stress", "Depressiya"],
        "specializations": ["Nevrolog", "Psixolog"],
        "urgency": "low",
        "first_aid": ["Uxlashdan oldin ekranlarga qaramang", "Iliq suv bilan vanna qiling", "Xonani shamollating"]
    },
    "charchoq": {
        "conditions": ["Anemiya", "Vitamin yetishmovchiligi", "Qalqonsimon bez kasalligi"],
        "specializations": ["Terapevt", "Endokrinolog"],
        "urgency": "low",
        "first_aid": ["Yetarli uxlang", "Vitaminlar iching", "Sport bilan shug'ullaning"]
    },

    # Teri
    "teri toshishi": {
        "conditions": ["Allergiya", "Dermatit", "Infeksiya"],
        "specializations": ["Dermatolog", "Allergolog"],
        "urgency": "normal",
        "first_aid": ["Qichimang", "Sovuq kompress qo'ying", "Antihistamin dori iching"]
    },
    "qichishish": {
        "conditions": ["Allergiya", "Dermatit", "Parazitlar"],
        "specializations": ["Dermatolog"],
        "urgency": "low",
        "first_aid": ["Qichimang", "Namlantiruvchi krem suring", "Issiq suv bilan yuvinmang"]
    },

    # Oyoq-qo'l
    "bo'g'im og'rig'i": {
        "conditions": ["Artrit", "Artroz", "Revmatizm"],
        "specializations": ["Revmatolog", "Ortoped"],
        "urgency": "normal",
        "first_aid": ["Og'riq joyga sovuq qo'ying", "Dam oling", "Og'riq qoldiruvchi iching"]
    },
    "bel og'rig'i": {
        "conditions": ["Osteoxondroz", "Disk churrasi", "Muskulyar og'riq"],
        "specializations": ["Nevrolog", "Ortoped"],
        "urgency": "normal",
        "first_aid": ["Qattiq yuzaga yoting", "Issiq kompress qo'ying", "Og'ir ko'tarmang"]
    },
    "oyoq shishi": {
        "conditions": ["Buyrak kasalligi", "Yurak yetishmovchiligi", "Varikoz"],
        "specializations": ["Kardiolog", "Nefrolog", "Flebolog"],
        "urgency": "normal",
        "first_aid": ["Oyoqlarni yuqori ko'taring", "Tuz iste'molini kamaytiring", "Shifokorga boring"]
    },

    # Shoshilinch
    "hushdan ketish": {
        "conditions": ["Epilepsiya", "Insult", "Gipoglikemiya"],
        "specializations": ["Nevrolog", "Tez yordam"],
        "urgency": "emergency",
        "first_aid": ["103 ga qo'ng'iroq qiling!", "Bemorni yoniga yotqizing", "Tilini tekshiring"]
    },
    "qon ketishi": {
        "conditions": ["Jarohat", "Ichki qon ketish"],
        "specializations": ["Jarroh", "Tez yordam"],
        "urgency": "emergency",
        "first_aid": ["103 ga qo'ng'iroq qiling!", "Qon ketayotgan joyni bosing", "Oyoqlarni ko'taring"]
    },
    "tutqanoq": {
        "conditions": ["Epilepsiya", "Gipoglikemiya", "Miya kasalligi"],
        "specializations": ["Nevrolog", "Tez yordam"],
        "urgency": "emergency",
        "first_aid": ["103 ga qo'ng'iroq qiling!", "Atrofdagi xavfli narsalarni olib tashlang", "Bemorni ushlamang"]
    },
}

# Mutaxassislik nomlari
SPECIALIZATION_INFO = {
    "Kardiolog": {"uz": "Yurak shifokori", "icon": "❤️", "desc": "Yurak va qon tomir kasalliklarini davolaydi"},
    "Nevrolog": {"uz": "Asab shifokori", "icon": "🧠", "desc": "Asab tizimi kasalliklarini davolaydi"},
    "Terapevt": {"uz": "Umumiy amaliyot", "icon": "🩺", "desc": "Umumiy tekshiruv va davolash"},
    "Gastroenterolog": {"uz": "Oshqozon shifokori", "icon": "🫁", "desc": "Hazm tizimi kasalliklarini davolaydi"},
    "Pulmonolog": {"uz": "O'pka shifokori", "icon": "🌬️", "desc": "Nafas yo'llari kasalliklarini davolaydi"},
    "Dermatolog": {"uz": "Teri shifokori", "icon": "🩹", "desc": "Teri kasalliklarini davolaydi"},
    "Ortoped": {"uz": "Suyak shifokori", "icon": "🦴", "desc": "Suyak va bo'g'im kasalliklarini davolaydi"},
    "LOR": {"uz": "Quloq-burun-tomoq", "icon": "👂", "desc": "Quloq, burun, tomoq kasalliklarini davolaydi"},
    "Oftalmolog": {"uz": "Ko'z shifokori", "icon": "👁️", "desc": "Ko'z kasalliklarini davolaydi"},
    "Endokrinolog": {"uz": "Endokrinolog", "icon": "💉", "desc": "Gormonlar kasalliklarini davolaydi"},
    "Allergolog": {"uz": "Allergolog", "icon": "🤧", "desc": "Allergiya kasalliklarini davolaydi"},
    "Psixolog": {"uz": "Psixolog", "icon": "🧘", "desc": "Ruhiy muammolar bilan ishlaydi"},
    "Infeksionist": {"uz": "Infeksionist", "icon": "🦠", "desc": "Yuqumli kasalliklarni davolaydi"},
    "Pediatr": {"uz": "Bolalar shifokori", "icon": "👶", "desc": "Bolalar kasalliklarini davolaydi"},
    "Ginekolog": {"uz": "Ginekolog", "icon": "👩", "desc": "Ayollar sog'lig'i bo'yicha mutaxassis"},
    "Urolog": {"uz": "Urolog", "icon": "🚹", "desc": "Siydik yo'llari kasalliklarini davolaydi"},
    "Jarroh": {"uz": "Jarroh", "icon": "🔪", "desc": "Jarrohlik amaliyotlarini bajaradi"},
    "Tez yordam": {"uz": "Tez yordam", "icon": "🚑", "desc": "Shoshilinch tibbiy yordam"},
}


# ==================== ANALYSIS FUNCTION ====================
def analyze_symptoms_local(symptoms: list, age: int = None, gender: str = None, severity: str = "moderate") -> dict:
    """Alomatlarni lokal tahlil qilish"""
    if not symptoms:
        return {"error": True, "message": "Alomatlar kiritilmagan"}

    result = {
        "possible_conditions": [],
        "recommended_specializations": [],
        "urgency_level": "low",
        "recommendations": [],
        "warning_signs": [],
        "first_aid": [],
        "next_steps": []
    }

    all_conditions = {}
    all_specs = {}
    all_first_aid = []
    max_urgency = "low"
    urgency_order = {"low": 0, "normal": 1, "high": 2, "emergency": 3}

    for symptom in symptoms:
        symptom_lower = symptom.lower().strip()

        # To'g'ridan-to'g'ri moslik
        if symptom_lower in SYMPTOM_CONDITION_MAP:
            data = SYMPTOM_CONDITION_MAP[symptom_lower]

            for condition in data["conditions"]:
                if condition in all_conditions:
                    all_conditions[condition]["count"] += 1
                    all_conditions[condition]["symptoms"].append(symptom)
                else:
                    all_conditions[condition] = {"name": condition, "count": 1, "symptoms": [symptom]}

            for spec in data["specializations"]:
                if spec in all_specs:
                    all_specs[spec]["count"] += 1
                else:
                    all_specs[spec] = {"name": spec, "count": 1}

            if data.get("first_aid"):
                all_first_aid.extend(data["first_aid"])

            if urgency_order.get(data["urgency"], 0) > urgency_order.get(max_urgency, 0):
                max_urgency = data["urgency"]

        # Qisman moslik
        else:
            for key, data in SYMPTOM_CONDITION_MAP.items():
                if symptom_lower in key or key in symptom_lower:
                    for condition in data["conditions"][:2]:
                        if condition not in all_conditions:
                            all_conditions[condition] = {"name": condition, "count": 1, "symptoms": [symptom]}
                    break

    # Natijalarni formatlash
    sorted_conditions = sorted(all_conditions.values(), key=lambda x: x["count"], reverse=True)[:5]
    sorted_specs = sorted(all_specs.values(), key=lambda x: x["count"], reverse=True)[:3]

    for i, cond in enumerate(sorted_conditions):
        probability = min(95, 40 + cond["count"] * 15)
        result["possible_conditions"].append({
            "name": cond["name"],
            "probability": probability,
            "matching_symptoms": cond["symptoms"],
            "description": f"{cond['name']} - {', '.join(cond['symptoms'])} alomatlari bilan bog'liq"
        })

    for spec in sorted_specs:
        spec_info = SPECIALIZATION_INFO.get(spec["name"], {})
        result["recommended_specializations"].append({
            "name": spec["name"],
            "name_uz": spec_info.get("uz", spec["name"]),
            "icon": spec_info.get("icon", "👨‍⚕️"),
            "description": spec_info.get("desc", ""),
            "priority": spec["count"]
        })

    result["urgency_level"] = max_urgency
    result["first_aid"] = list(set(all_first_aid))[:5]

    # Tavsiyalar
    if max_urgency == "emergency":
        result["recommendations"] = [
            "🚨 SHOSHILINCH! Darhol tez tibbiy yordam chaqiring (103)",
            "Harakatsiz qoling va yordam kelishini kuting",
            "Yaqinlaringizga xabar bering"
        ]
        result["warning_signs"] = ["Bu alomatlar jiddiy holat belgisi!", "O'z-o'zini davolashga urinmang!"]
    elif max_urgency == "high":
        result["recommendations"] = [
            "⚠️ Bugun shifokorga ko'rinishingiz tavsiya etiladi",
            "Holat yomonlashsa, tez yordamga qo'ng'iroq qiling",
            "Dam oling va kuzatib boring"
        ]
        result["warning_signs"] = ["Alomatlar kuchaysa, darhol shifokorga murojaat qiling"]
    elif max_urgency == "normal":
        result["recommendations"] = [
            "📋 1-2 kun ichida shifokorga ko'rinish tavsiya etiladi",
            "Ko'proq dam oling va suyuqlik iching",
            "Alomatlarni kuzatib boring"
        ]
    else:
        result["recommendations"] = [
            "📝 Alomatlar davom etsa, shifokorga murojaat qiling",
            "Sog'lom turmush tarzi saqlang",
            "Yetarli dam oling"
        ]

    # Keyingi qadamlar
    if sorted_specs:
        main_spec = sorted_specs[0]["name"]
        spec_info = SPECIALIZATION_INFO.get(main_spec, {})
        result["next_steps"] = [
            f"🏥 {spec_info.get('uz', main_spec)}ga yoziling",
            "📱 HealthHub orqali online navbat oling",
            "📋 Tahlillar topshirishga tayyorlaning"
        ]

    return result


# ==================== AI CONSULTATION VIEWSET ====================
class AIConsultationViewSet(viewsets.ViewSet):
    """AI Shifokor - Alomatlarni tahlil qilish"""
    permission_classes = [AllowAny]

    def list(self, request):
        return Response({
            'message': 'AI Shifokor API',
            'endpoints': {
                'analyze': 'POST /api/ai/consultations/analyze/',
                'symptoms_check': 'POST /api/ai/symptoms/check/',
                'symptoms_list': 'GET /api/ai/symptoms/list/',
            }
        })

    @action(detail=False, methods=['post'])
    def analyze(self, request):
        """Alomatlarni tahlil qilish (text input)"""
        symptoms_text = request.data.get('symptoms', '').strip()

        if not symptoms_text:
            return Response({'error': 'Iltimos, alomatlaringizni kiriting'}, status=400)

        try:
            # Gemini bilan tahlil
            if GEMINI_AVAILABLE:
                api_key = getattr(settings, 'GEMINI_API_KEY', None)
                if api_key:
                    try:
                        result = self._analyze_with_gemini(symptoms_text, api_key)
                        doctors = self._find_doctors(result.get('specialization_key', 'terapevt'))

                        # Bazaga saqlash
                        if request.user.is_authenticated:
                            AIConsultation.objects.create(
                                user=request.user,
                                symptoms=symptoms_text,
                                ai_analysis=result.get('analysis', ''),
                                urgency_level=result.get('severity', "o'rta"),
                                recommended_specialist=result.get('specialization', 'Terapevt'),
                                first_aid_tips=result.get('first_aid', []),
                                warnings=result.get('warning_signs', [])
                            )

                        return Response({
                            'success': True,
                            'symptoms': symptoms_text,
                            **result,
                            'recommended_doctors': doctors,
                            'disclaimer': '⚠️ Bu AI tahlili faqat ma\'lumot uchun.'
                        })
                    except Exception as e:
                        print(f"Gemini error: {e}")

            # Lokal tahlil
            result = self._local_analysis(symptoms_text)
            doctors = self._find_doctors(result.get('specialization_key', 'terapevt'))

            return Response({
                'success': True,
                'symptoms': symptoms_text,
                **result,
                'recommended_doctors': doctors,
                'disclaimer': '⚠️ Bu AI tahlili faqat ma\'lumot uchun.'
            })

        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)

    def _analyze_with_gemini(self, symptoms: str, api_key: str) -> dict:
        """Gemini API bilan tahlil"""
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        prompt = f"""
Sen professional tibbiy AI assistantsan. O'zbek tilida javob ber.

Bemor alomatlari: {symptoms}

Quyidagi JSON formatida javob ber (faqat JSON):
{{
    "analysis": "Alomatlar tahlili",
    "severity": "past/o'rta/yuqori/jiddiy",
    "first_aid": ["1-yordam 1", "1-yordam 2"],
    "home_treatment": ["Uy davolash 1", "Uy davolash 2"],
    "warning_signs": ["Ogohlantirish 1", "Ogohlantirish 2"],
    "specialization": "Shifokor turi",
    "specialization_key": "terapevt/kardiolog/nevrolog/..."
}}
"""
        response = model.generate_content(prompt)
        text = response.text.strip()

        import json
        if text.startswith('```'):
            text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]

        return json.loads(text)

    def _local_analysis(self, symptoms: str) -> dict:
        """Lokal tahlil"""
        symptoms_lower = symptoms.lower()

        if any(w in symptoms_lower for w in ['yurak', 'ko\'krak', 'nafas']):
            return {
                'analysis': 'Ko\'krak og\'rig\'i yurak muammolarini ko\'rsatishi mumkin.',
                'severity': 'yuqori',
                'first_aid': ['O\'tiring va dam oling', '103 ga qo\'ng\'iroq qiling'],
                'specialization': 'Kardiolog',
                'specialization_key': 'kardiolog'
            }
        elif any(w in symptoms_lower for w in ['bosh', 'migren']):
            return {
                'analysis': 'Bosh og\'rig\'i stress yoki bosim sababli bo\'lishi mumkin.',
                'severity': 'o\'rta',
                'first_aid': ['Dam oling', 'Suv iching', 'Paratsetamol iching'],
                'specialization': 'Nevrolog',
                'specialization_key': 'nevrolog'
            }
        elif any(w in symptoms_lower for w in ['isitma', 'gripp']):
            return {
                'analysis': 'Isitma infeksiya belgisi bo\'lishi mumkin.',
                'severity': 'o\'rta',
                'first_aid': ['Ko\'p suyuqlik iching', '38.5°C dan oshsa paratsetamol'],
                'specialization': 'Terapevt',
                'specialization_key': 'terapevt'
            }
        else:
            return {
                'analysis': f'Sizning alomatlaringiz: "{symptoms}". Shifokorga murojaat qiling.',
                'severity': 'past',
                'first_aid': ['Dam oling', 'Suyuqlik iching'],
                'specialization': 'Terapevt',
                'specialization_key': 'terapevt'
            }

    def _find_doctors(self, specialization_key: str) -> list:
        """Shifokorlarni topish"""
        if not DOCTORS_AVAILABLE:
            return []

        doctors = []
        try:
            spec_mapping = {
                'terapevt': ['Terapevt', 'General'],
                'kardiolog': ['Kardiolog', 'Cardio'],
                'nevrolog': ['Nevrolog', 'Neuro'],
                'pediatr': ['Pediatr'],
                'dermatolog': ['Dermatolog'],
                'lor': ['LOR', 'ENT'],
            }

            search_names = spec_mapping.get(specialization_key.lower(), ['Terapevt'])

            for name in search_names:
                specs = Specialization.objects.filter(name__icontains=name)
                for spec in specs:
                    for doc in Doctor.objects.filter(specialization=spec, is_available=True)[:3]:
                        doctors.append({
                            'id': str(doc.id),
                            'name': f"Dr. {doc.user.first_name} {doc.user.last_name}" if doc.user else "Shifokor",
                            'specialization': spec.name_uz or spec.name,
                            'hospital': doc.hospital.name if doc.hospital else "N/A",
                            'rating': float(doc.rating or 4.5),
                            'price': int(doc.consultation_price or 0)
                        })
                        if len(doctors) >= 3:
                            break
        except Exception as e:
            print(f"Doctor search error: {e}")

        return doctors


# ==================== SYMPTOM CHECK API ====================
@api_view(['POST'])
@permission_classes([AllowAny])
def check_symptoms(request):
    """
    Alomatlarni tekshirish API (list input)

    Request: {"symptoms": ["bosh og'rig'i", "isitma"], "age": 30, "gender": "male"}
    """
    symptoms = request.data.get('symptoms', [])
    age = request.data.get('age')
    gender = request.data.get('gender', '')
    severity = request.data.get('severity', 'moderate')

    if not symptoms:
        return Response({'error': 'Kamida bitta alomat kiriting'}, status=400)

    # Tahlil
    result = analyze_symptoms_local(symptoms, age, gender, severity)

    # Bazaga saqlash
    try:
        check = SymptomCheck.objects.create(
            user=request.user if request.user.is_authenticated else None,
            symptoms=symptoms,
            age=age,
            gender=gender,
            severity=severity,
            ai_response=result,
            is_emergency=(result.get('urgency_level') == 'emergency')
        )
        result['check_id'] = str(check.id)
    except Exception as e:
        print(f"Save error: {e}")
        result['check_id'] = None

    return Response(result)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_symptoms_list(request):
    """Alomatlar ro'yxatini olish"""
    category = request.query_params.get('category')

    symptoms_data = {
        "bosh": [
            {"name": "bosh og'rig'i", "icon": "🤕"},
            {"name": "bosh aylanishi", "icon": "😵"},
            {"name": "ko'z og'rig'i", "icon": "👁️"},
            {"name": "kuchli bosh og'rig'i", "icon": "🤯"},
        ],
        "kokrak": [
            {"name": "ko'krak og'rig'i", "icon": "💔"},
            {"name": "nafas qisilishi", "icon": "😮‍💨"},
            {"name": "yurak urishi tezlashishi", "icon": "💓"},
        ],
        "qorin": [
            {"name": "qorin og'rig'i", "icon": "🤢"},
            {"name": "ko'ngil aynishi", "icon": "🤮"},
            {"name": "ich ketishi", "icon": "🚽"},
            {"name": "qusish", "icon": "😣"},
        ],
        "umumiy": [
            {"name": "isitma", "icon": "🤒"},
            {"name": "yo'tal", "icon": "😷"},
            {"name": "burun bitishi", "icon": "🤧"},
            {"name": "tomoq og'rig'i", "icon": "😫"},
            {"name": "holsizlik", "icon": "😴"},
            {"name": "charchoq", "icon": "😵"},
        ],
        "teri": [
            {"name": "teri toshishi", "icon": "🔴"},
            {"name": "qichishish", "icon": "🤚"},
        ],
        "oyoq_qol": [
            {"name": "bo'g'im og'rig'i", "icon": "🦵"},
            {"name": "bel og'rig'i", "icon": "🔙"},
            {"name": "oyoq shishi", "icon": "🦶"},
        ],
    }

    categories = [
        {"id": "bosh", "name": "Bosh", "icon": "🧠"},
        {"id": "kokrak", "name": "Ko'krak", "icon": "❤️"},
        {"id": "qorin", "name": "Qorin", "icon": "🫁"},
        {"id": "umumiy", "name": "Umumiy", "icon": "🩺"},
        {"id": "teri", "name": "Teri", "icon": "🩹"},
        {"id": "oyoq_qol", "name": "Oyoq-Qo'l", "icon": "🦴"},
    ]

    if category and category in symptoms_data:
        return Response({"category": category, "symptoms": symptoms_data[category]})

    return Response({"categories": categories, "symptoms": symptoms_data})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_specializations(request):
    """Mutaxassisliklar ro'yxati"""
    specs = []
    for key, value in SPECIALIZATION_INFO.items():
        specs.append({
            "id": key.lower(),
            "name": key,
            "name_uz": value["uz"],
            "icon": value["icon"],
            "description": value["desc"]
        })
    return Response(specs)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_check_history(request):
    """Tekshiruv tarixi"""
    if not request.user.is_authenticated:
        return Response({"results": []})

    checks = SymptomCheck.objects.filter(user=request.user).order_by('-created_at')[:20]

    results = [{
        "id": str(c.id),
        "symptoms": c.symptoms,
        "urgency_level": c.ai_response.get("urgency_level", "normal"),
        "possible_conditions": [x["name"] for x in c.ai_response.get("possible_conditions", [])[:2]],
        "created_at": c.created_at.isoformat()
    } for c in checks]

    return Response({"results": results})


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_chat(request):
    """AI bilan chat"""
    message = request.data.get('message', '')

    if not message:
        return Response({'error': 'Xabar kiriting'}, status=400)

    message_lower = message.lower()

    if any(w in message_lower for w in ['salom', 'assalomu']):
        response = "Assalomu alaykum! Men HealthHub AI yordamchisiman. Alomatlaringizni aytib bering."
    elif any(w in message_lower for w in ["og'ri", "og'riq"]):
        response = "Og'riq haqida ko'proq ma'lumot bering: qayerda og'riyapti? qachondan beri?"
    elif any(w in message_lower for w in ["rahmat", "tashakkur"]):
        response = "Arzimaydi! Sog'lom bo'ling! 🏥"
    else:
        response = f"Tushundim. Aniqroq javob uchun alomatlaringizni ro'yxatdan tanlang."

    return Response({
        'message': response,
        'suggestions': ["Alomatlarimni tekshir", "Shifokor qidirish"]
    })