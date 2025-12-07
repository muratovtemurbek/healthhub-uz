// src/pages/SymptomChecker.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Brain, AlertTriangle, CheckCircle,
  ChevronRight, Loader2, Activity, Stethoscope,
  AlertCircle, Clock, Plus, X, Sparkles,
  RefreshCw, Phone, Lightbulb
} from 'lucide-react';
import apiClient from '../api/client';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface SymptomItem {
  name: string;
  icon: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  rating: string;
  experience_years: number;
  price: string;
}

interface AnalysisResult {
  success: boolean;
  symptoms: string;
  analysis: string;
  severity: string;
  severity_color: string;
  first_aid: string[];
  home_treatment: string[];
  warning_signs: string[];
  specialization: string;
  recommended_doctors: Doctor[];
  disclaimer: string;
}

// Demo symptoms data
const DEMO_SYMPTOMS: Record<string, SymptomItem[]> = {
  bosh: [
    { name: "Bosh og'rig'i", icon: "🤕" },
    { name: "Bosh aylanishi", icon: "😵" },
    { name: "Ko'z og'rig'i", icon: "👁️" },
    { name: "Migren", icon: "🤯" },
  ],
  kokrak: [
    { name: "Ko'krak og'rig'i", icon: "💔" },
    { name: "Nafas qisilishi", icon: "😮‍💨" },
    { name: "Yurak urishi tezlashishi", icon: "💓" },
    { name: "Yo'tal", icon: "😷" },
  ],
  qorin: [
    { name: "Qorin og'rig'i", icon: "🤢" },
    { name: "Ko'ngil aynishi", icon: "🤮" },
    { name: "Ich ketishi", icon: "🚽" },
    { name: "Ich qotishi", icon: "😣" },
  ],
  umumiy: [
    { name: "Isitma", icon: "🤒" },
    { name: "Holsizlik", icon: "😴" },
    { name: "Tomoq og'rig'i", icon: "😫" },
    { name: "Burun bitishi", icon: "🤧" },
  ],
  teri: [
    { name: "Teri toshishi", icon: "🔴" },
    { name: "Qichishish", icon: "🤚" },
  ],
  oyoq_qol: [
    { name: "Bo'g'im og'rig'i", icon: "🦵" },
    { name: "Bel og'rig'i", icon: "🔙" },
    { name: "Oyoq shishi", icon: "🦶" },
  ],
};

const CATEGORIES: Category[] = [
  { id: "bosh", name: "Bosh", icon: "🧠" },
  { id: "kokrak", name: "Ko'krak", icon: "❤️" },
  { id: "qorin", name: "Qorin", icon: "🫁" },
  { id: "umumiy", name: "Umumiy", icon: "🩺" },
  { id: "teri", name: "Teri", icon: "🩹" },
  { id: "oyoq_qol", name: "Oyoq-Qo'l", icon: "🦴" },
];

export default function SymptomChecker() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [severity, setSeverity] = useState('moderate');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms(prev => [...prev, symptom]);
    }
  };

  const addCustomSymptom = () => {
    const trimmed = customSymptom.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms(prev => [...prev, trimmed]);
      setCustomSymptom('');
    }
  };

  const generateDemoResult = (symptoms: string[]): AnalysisResult => {
    const symptomsText = symptoms.join(', ');
    const hasEmergency = symptoms.some(s =>
      s.toLowerCase().includes("ko'krak") ||
      s.toLowerCase().includes('nafas') ||
      s.toLowerCase().includes('yurak')
    );

    return {
      success: true,
      symptoms: symptomsText,
      analysis: hasEmergency
        ? "Ko'krak sohasidagi alomatlar yurak-qon tomir muammolarini ko'rsatishi mumkin. Darhol shifokorga murojaat qilish tavsiya etiladi."
        : `Sizning alomatlaringiz: "${symptomsText}". Bu alomatlar turli sabablarga ko'ra paydo bo'lishi mumkin.`,
      severity: hasEmergency ? 'yuqori' : "o'rta",
      severity_color: hasEmergency ? 'orange' : 'yellow',
      first_aid: hasEmergency ? [
        "🚨 Darhol o'tiring yoki yoting",
        "📞 Tez yordam chaqiring (103)",
        "💊 Nitroglitserin bo'lsa, til ostiga qo'ying",
        "👔 Kiyimlarni bo'shating"
      ] : [
        "🛏️ Dam oling",
        "💧 Ko'p suyuqlik iching",
        "📝 Alomatlarni yozib boring",
        "📞 Shifokorga murojaat qiling"
      ],
      home_treatment: [
        "Yetarli dam oling",
        "Sog'lom ovqatlaning",
        "Stress kamaytiring",
        "Muntazam uyqu rejimiga rioya qiling"
      ],
      warning_signs: hasEmergency ? [
        "Ko'krak og'rig'i 5 daqiqadan ko'p davom etsa",
        "Nafas olish qiyinlashsa",
        "Chap qo'l yoki jag' og'risa"
      ] : [
        "Alomatlar kuchaysa",
        "Yangi alomatlar paydo bo'lsa",
        "2-3 kundan ko'p davom etsa"
      ],
      specialization: hasEmergency ? 'Kardiolog' : 'Terapevt',
      recommended_doctors: [
        {
          id: '1',
          name: hasEmergency ? 'Dr. Akbar Karimov' : 'Dr. Malika Rahimova',
          specialization: hasEmergency ? 'Kardiolog' : 'Terapevt',
          hospital: 'Toshkent Tibbiyot Markazi',
          rating: '4.9',
          experience_years: 15,
          price: '150000'
        },
        {
          id: '2',
          name: 'Dr. Bobur Alimov',
          specialization: hasEmergency ? 'Kardiolog' : 'Terapevt',
          hospital: 'Respublika Shifoxonasi',
          rating: '4.8',
          experience_years: 12,
          price: '120000'
        }
      ],
      disclaimer: "⚠️ Bu AI tahlili faqat ma'lumot uchun. Aniq tashxis uchun shifokorga murojaat qiling."
    };
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Kamida bitta alomat tanlang');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/ai/consultations/analyze/', {
        symptoms: selectedSymptoms.join(', '),
        age: age ? parseInt(age) : null,
        gender,
      });

      // API response ni to'g'ri formatlash
      const apiResult = response.data;
      setResult({
        success: apiResult.success ?? true,
        symptoms: apiResult.symptoms || selectedSymptoms.join(', '),
        analysis: apiResult.analysis || "Tahlil natijasi",
        severity: apiResult.severity || "o'rta",
        severity_color: apiResult.severity_color || 'yellow',
        first_aid: apiResult.first_aid || [],
        home_treatment: apiResult.home_treatment || [],
        warning_signs: apiResult.warning_signs || [],
        specialization: apiResult.specialization || 'Terapevt',
        recommended_doctors: apiResult.recommended_doctors || [],
        disclaimer: apiResult.disclaimer || "⚠️ Bu AI tahlili faqat ma'lumot uchun."
      });
      setStep(3);
    } catch (err) {
      console.log('API xatosi, demo natija ishlatilmoqda');
      setResult(generateDemoResult(selectedSymptoms));
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityConfig = (sev: string) => {
    switch (sev) {
      case 'jiddiy':
      case 'emergency':
        return { bg: 'bg-red-500', text: 'text-white', label: 'SHOSHILINCH!', desc: 'Darhol tez yordam chaqiring!' };
      case 'yuqori':
      case 'high':
        return { bg: 'bg-orange-500', text: 'text-white', label: 'Yuqori', desc: 'Bugun shifokorga boring' };
      case "o'rta":
      case 'normal':
        return { bg: 'bg-yellow-500', text: 'text-white', label: "O'rtacha", desc: '1-2 kun ichida shifokorga boring' };
      default:
        return { bg: 'bg-green-500', text: 'text-white', label: 'Past', desc: 'Alomatlar yengil' };
    }
  };

  const resetChecker = () => {
    setStep(1);
    setSelectedCategory(null);
    setSelectedSymptoms([]);
    setAge('');
    setGender('');
    setSeverity('moderate');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Symptom Checker</h1>
                <p className="text-xs text-gray-500">AI Tahlil</p>
              </div>
            </div>
          </div>
          {step > 1 && (
            <button onClick={resetChecker} className="p-2 hover:bg-gray-100 rounded-lg">
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((s) => (
            <div key={`step-${s}`} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 mx-2 rounded ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Alomatlar</span>
          <span>Ma'lumotlar</span>
          <span>Natija</span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pb-24">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            {error}
            <button onClick={() => setError('')} className="ml-auto">✕</button>
          </div>
        )}

        {/* Step 1: Select Symptoms */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Selected Symptoms */}
            {selectedSymptoms.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Tanlangan ({selectedSymptoms.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((symptom, idx) => (
                    <span
                      key={`selected-${idx}`}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm"
                    >
                      {symptom}
                      <button onClick={() => toggleSymptom(symptom)} className="ml-2 hover:text-blue-900">
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Input */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Alomatni yozing</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
                  placeholder="Masalan: bosh og'rig'i"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={addCustomSymptom} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Kategoriya</h3>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={`cat-${cat.id}`}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{cat.icon}</span>
                    <span className="text-xs font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms List */}
            {selectedCategory && DEMO_SYMPTOMS[selectedCategory] && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.name} alomatlari
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_SYMPTOMS[selectedCategory].map((symptom, idx) => (
                    <button
                      key={`symptom-${selectedCategory}-${idx}`}
                      onClick={() => toggleSymptom(symptom.name)}
                      className={`p-3 rounded-xl text-left transition-all flex items-center ${
                        selectedSymptoms.includes(symptom.name)
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl mr-2">{symptom.icon}</span>
                      <span className="text-sm font-medium">{symptom.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Continue */}
            {selectedSymptoms.length > 0 && (
              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
              >
                Davom etish
                <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            )}
          </div>
        )}

        {/* Step 2: Additional Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Qo'shimcha ma'lumotlar</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yoshingiz</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Masalan: 30"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jins</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setGender('male')}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        gender === 'male' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      👨 Erkak
                    </button>
                    <button
                      onClick={() => setGender('female')}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        gender === 'female' ? 'bg-pink-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      👩 Ayol
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Darajasi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'mild', label: 'Yengil', color: 'green' },
                      { id: 'moderate', label: "O'rtacha", color: 'yellow' },
                      { id: 'severe', label: "Og'ir", color: 'red' },
                    ].map((s) => (
                      <button
                        key={`severity-${s.id}`}
                        onClick={() => setSeverity(s.id)}
                        className={`py-3 rounded-xl text-sm font-medium transition-all ${
                          severity === s.id
                            ? s.color === 'green' ? 'bg-green-600 text-white' :
                              s.color === 'yellow' ? 'bg-yellow-500 text-white' :
                              'bg-red-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 border border-gray-300 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50"
              >
                Orqaga
              </button>
              <button
                onClick={analyzeSymptoms}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Tahlil...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    AI Tahlil
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <div className="space-y-6">
            {/* Severity */}
            {(() => {
              const config = getSeverityConfig(result.severity);
              return (
                <div className={`${config.bg} ${config.text} rounded-2xl p-6 shadow-lg`}>
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="h-8 w-8 mr-3" />
                    <div>
                      <h3 className="text-xl font-bold">{config.label}</h3>
                      <p className="text-sm opacity-90">{config.desc}</p>
                    </div>
                  </div>
                  {(result.severity === 'jiddiy' || result.severity === 'yuqori') && (
                    <a
                      href="tel:103"
                      className="mt-4 w-full py-3 bg-white text-red-600 rounded-xl font-bold text-center block hover:bg-gray-100"
                    >
                      <Phone className="h-5 w-5 inline mr-2" />
                      Tez yordam: 103
                    </a>
                  )}
                </div>
              );
            })()}

            {/* Analysis */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Tahlil
              </h3>
              <p className="text-gray-700">{result.analysis}</p>
            </div>

            {/* First Aid */}
            {result.first_aid && result.first_aid.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2 text-green-600" />
                  Birinchi yordam
                </h3>
                <div className="space-y-2">
                  {result.first_aid.map((tip, i) => (
                    <div key={`aid-${i}`} className="flex items-start p-3 bg-green-50 rounded-xl">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Home Treatment */}
            {result.home_treatment && result.home_treatment.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Uy sharoitida
                </h3>
                <div className="space-y-2">
                  {result.home_treatment.map((tip, i) => (
                    <div key={`home-${i}`} className="flex items-center p-3 bg-yellow-50 rounded-xl">
                      <CheckCircle className="h-5 w-5 mr-3 text-yellow-600" />
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Signs */}
            {result.warning_signs && result.warning_signs.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Ogohlantirish
                </h3>
                <ul className="space-y-2">
                  {result.warning_signs.map((sign, i) => (
                    <li key={`warn-${i}`} className="flex items-start text-red-600">
                      <span className="mr-2">⚠️</span>
                      {sign}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Doctors */}
            {result.recommended_doctors && result.recommended_doctors.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tavsiya: {result.specialization}
                </h3>
                <div className="space-y-3">
                  {result.recommended_doctors.map((doc, i) => (
                    <button
                      key={`doc-${doc.id}-${i}`}
                      onClick={() => navigate(`/book-appointment/${doc.id}`)}
                      className="w-full flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-white font-bold">{doc.name.charAt(4)}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-500">{doc.hospital}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <span>⭐ {doc.rating}</span>
                          <span className="mx-2">•</span>
                          <span>{doc.experience_years} yil</span>
                          <span className="mx-2">•</span>
                          <span>{parseInt(doc.price).toLocaleString()} so'm</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-gray-100 rounded-xl p-4 text-center text-sm text-gray-500">
              {result.disclaimer}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/doctors')}
                className="py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg"
              >
                Shifokor tanlash
              </button>
              <button
                onClick={resetChecker}
                className="py-4 border border-gray-300 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50"
              >
                Qayta tekshirish
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}