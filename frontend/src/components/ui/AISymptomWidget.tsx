// src/components/AISymptomWidget.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, ChevronRight, MessageCircle, Activity } from 'lucide-react';

interface QuickSymptom {
  name: string;
  icon: string;
}

const QUICK_SYMPTOMS: QuickSymptom[] = [
  { name: "Bosh og'rig'i", icon: "🤕" },
  { name: "Isitma", icon: "🤒" },
  { name: "Yo'tal", icon: "😷" },
  { name: "Qorin og'rig'i", icon: "🤢" },
];

export default function AISymptomWidget() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (inputValue.trim()) {
      navigate(`/symptom-checker?symptom=${encodeURIComponent(inputValue)}`);
    } else {
      navigate('/symptom-checker');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-2xl p-5 text-white shadow-xl overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center mr-3">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Shifokor</h3>
            <p className="text-white/80 text-sm">Alomatlarni tahlil qiling</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-white/20 rounded-full flex items-center">
          <Sparkles className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">AI</span>
        </div>
      </div>

      {/* Input */}
      <div className="relative mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Alomatlaringizni yozing..."
          className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Quick Symptoms */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_SYMPTOMS.map((symptom) => (
          <button
            key={symptom.name}
            onClick={() => navigate(`/symptom-checker?symptom=${encodeURIComponent(symptom.name)}`)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full text-sm font-medium transition-all flex items-center"
          >
            <span className="mr-1">{symptom.icon}</span>
            {symptom.name}
          </button>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={() => navigate('/symptom-checker')}
        className="w-full py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-all flex items-center justify-center shadow-lg"
      >
        <MessageCircle className="h-5 w-5 mr-2" />
        Tekshirishni boshlash
      </button>

      {/* Footer */}
      <div className="flex items-center justify-center mt-3 text-white/60 text-xs">
        <Activity className="h-3 w-3 mr-1" />
        <span>24/7 AI yordam</span>
        <span className="mx-2">•</span>
        <span>🔒 Xavfsiz</span>
      </div>
    </div>
  );
}