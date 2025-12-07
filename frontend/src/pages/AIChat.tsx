import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Send, Bot, User, Loader2, AlertCircle,
  Heart, Stethoscope, Clock, Star, MapPin,
  AlertTriangle, CheckCircle, Info, ChevronRight
} from 'lucide-react';
import apiClient from '../api/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: any;
  timestamp: Date;
}

export default function AIChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Faqat bemor uchun
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.user_type === 'doctor' || user.user_type === 'admin') {
      navigate('/dashboard');
      return;
    }

    // Welcome message
    setMessages([{
      id: 'welcome-1',
      role: 'assistant',
      content: 'welcome',
      data: { type: 'welcome' },
      timestamp: new Date()
    }]);
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const symptoms = input.trim();
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.post('/api/ai/consultations/analyze/', {
        symptoms: symptoms
      });

      const data = response.data;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'analysis',
        data: data,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AI Error:', err);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'error',
        data: { error: err.response?.data?.error || 'Xatolik yuz berdi' },
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'past':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'o\'rta':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'yuqori':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'jiddiy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'past':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'o\'rta':
        return <Info className="h-5 w-5 text-yellow-600" />;
      case 'yuqori':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'jiddiy':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderMessage = (message: Message, messageIndex: number) => {
    if (message.role === 'user') {
      return (
        <div key={`msg-${message.id}-${messageIndex}`} className="flex justify-end mb-4">
          <div className="max-w-[80%] flex items-start space-x-2 flex-row-reverse space-x-reverse">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm">
              <p>{message.content}</p>
              <p className="text-xs text-blue-200 mt-2">
                {message.timestamp.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Welcome message
    if (message.data?.type === 'welcome') {
      return (
        <div key={`msg-${message.id}-${messageIndex}`} className="flex justify-start mb-4">
          <div className="max-w-[90%]">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div className="bg-white p-5 rounded-2xl rounded-tl-sm shadow-sm border">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  Assalomu alaykum! 👋
                </h3>
                <p className="text-gray-600 mb-4">
                  Men AI Shifokor yordamchisiman. Alomatlaringizni yozing, men sizga:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Dastlabki tahlil beraman
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    1-yordam ko'rsatmalarini aytaman
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Mos shifokorga yo'naltirib beraman
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 Masalan: "Boshim og'riyapti, haroratim 38°C, tomoqim og'riyapti"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Error message
    if (message.content === 'error') {
      return (
        <div key={`msg-${message.id}-${messageIndex}`} className="flex justify-start mb-4">
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl">
            <div className="flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{message.data?.error || 'Xatolik yuz berdi'}</span>
            </div>
          </div>
        </div>
      );
    }

    // Analysis message
    if (message.content === 'analysis' && message.data) {
      const data = message.data;
      return (
        <div key={`msg-${message.id}-${messageIndex}`} className="flex justify-start mb-4">
          <div className="max-w-[95%] w-full">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-7 w-7 text-white" />
              </div>

              <div className="flex-1 space-y-4">
                {/* Severity Badge */}
                <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getSeverityStyle(data.severity)}`}>
                  {getSeverityIcon(data.severity)}
                  <span className="ml-2 font-medium capitalize">
                    Jiddiylik: {data.severity || 'noma\'lum'}
                  </span>
                </div>

                {/* Analysis */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
                    Tahlil
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{data.analysis}</p>
                </div>

                {/* First Aid */}
                {data.first_aid && data.first_aid.length > 0 && (
                  <div className="bg-green-50 p-5 rounded-2xl border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <Heart className="h-5 w-5 mr-2" />
                      1-Yordam Ko'rsatmalari
                    </h4>
                    <ul className="space-y-2">
                      {data.first_aid.map((item: string, index: number) => (
                        <li key={`first-aid-${messageIndex}-${index}`} className="flex items-start text-green-700">
                          <span className="mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Home Treatment */}
                {data.home_treatment && data.home_treatment.length > 0 && (
                  <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3">
                      🏠 Uy Sharoitida Davolash
                    </h4>
                    <ul className="space-y-2">
                      {data.home_treatment.map((item: string, index: number) => (
                        <li key={`home-treatment-${messageIndex}-${index}`} className="flex items-start text-blue-700">
                          <span className="mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warning Signs */}
                {data.warning_signs && data.warning_signs.length > 0 && (
                  <div className="bg-red-50 p-5 rounded-2xl border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Qachon Shifokorga Shoshilinch Murojaat Qilish Kerak
                    </h4>
                    <ul className="space-y-2">
                      {data.warning_signs.map((item: string, index: number) => (
                        <li key={`warning-${messageIndex}-${index}`} className="flex items-start text-red-700">
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Specialization */}
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200">
                  <p className="text-purple-800 font-medium">
                    👨‍⚕️ Tavsiya etilgan mutaxassis: <strong>{data.specialization}</strong>
                  </p>
                </div>

                {/* Recommended Doctors */}
                {data.recommended_doctors && data.recommended_doctors.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Stethoscope className="h-5 w-5 mr-2 text-green-600" />
                      Tavsiya Etilgan Shifokorlar
                    </h4>
                    <div className="space-y-3">
                      {data.recommended_doctors.map((doctor: any, doctorIndex: number) => (
                        <Link
                          key={`doctor-${messageIndex}-${doctorIndex}-${doctor.id}`}
                          to={`/book-appointment/${doctor.id}`}
                          className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">👨‍⚕️</span>
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900">{doctor.name}</h5>
                                <p className="text-sm text-blue-600">{doctor.specialization}</p>
                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {doctor.hospital}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center text-yellow-500 mb-1">
                                <Star className="h-4 w-4 fill-yellow-400" />
                                <span className="ml-1 text-gray-700">{doctor.rating}</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {doctor.experience_years} yil
                              </p>
                              <p className="text-sm font-semibold text-green-600 mt-1">
                                {Number(doctor.price).toLocaleString()} so'm
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-end text-blue-600 text-sm">
                            <span>Navbatga yozilish</span>
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                {data.disclaimer && (
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <p className="text-yellow-800 text-sm">{data.disclaimer}</p>
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  {message.timestamp.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">AI Shifokor</h1>
              <p className="text-xs text-green-600 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Online
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => renderMessage(message, index))}

          {loading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    <span className="text-gray-500">Alomatlarni tahlil qilmoqda...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4 sticky bottom-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Alomatlaringizni yozing..."
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}