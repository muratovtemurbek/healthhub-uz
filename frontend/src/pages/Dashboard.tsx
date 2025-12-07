// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar, Bell, User, Search, ChevronRight,
  Stethoscope, Pill, FileText, Activity, Wind,
  Heart, Clock, TrendingUp, MapPin, MessageCircle,
  Building2, BarChart3, Flame, AlertCircle, Bot,
  Brain, Sparkles, Send, Mic
} from 'lucide-react';
import apiClient from '../api/client';

// AISymptomWidget
import AISymptomWidget from '../components/ui/AISymptomWidget';

interface DashboardData {
  user: {
    name: string;
    avatar?: string;
  };
  next_appointment: {
    has_appointment: boolean;
    doctor_name?: string;
    specialty?: string;
    date?: string;
    time?: string;
    days_left?: number;
  } | null;
  today_medicines: {
    total: number;
    taken: number;
    pending: number;
    next_dose?: {
      medicine: string;
      time: string;
      dosage: string;
    };
  };
  air_quality: {
    aqi: number;
    level: string;
    city: string;
    icon: string;
  };
  health_score: {
    score: number;
    trend: 'up' | 'down';
    change: number;
  };
  unread_messages: number;
  unread_notifications: number;
}

const QUICK_ACTIONS = [
  { id: 'doctors', icon: Stethoscope, label: 'Shifokorlar', path: '/doctors', color: 'bg-blue-500' },
  { id: 'medicines', icon: Pill, label: 'Dorilar', path: '/medicine-reminders', color: 'bg-purple-500' },
  { id: 'hospitals', icon: Building2, label: 'Kasalxonalar', path: '/hospitals', color: 'bg-green-500' },
  { id: 'documents', icon: FileText, label: 'Hujjatlar', path: '/documents', color: 'bg-teal-500' },
  { id: 'analytics', icon: BarChart3, label: 'Statistika', path: '/analytics', color: 'bg-orange-500' },
  { id: 'air', icon: Wind, label: 'Havo sifati', path: '/air-quality', color: 'bg-cyan-500' },
];

// AI Chat Widget Component
function AIChatWidget() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const quickQuestions = [
    "Bosh og'rig'i",
    "Uyqu muammosi",
    "Immunitet",
  ];

  const handleSend = () => {
    if (message.trim()) {
      navigate(`/ai-chat?q=${encodeURIComponent(message)}`);
    } else {
      navigate('/ai-chat');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mr-3">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Assistent</h3>
              <div className="flex items-center text-emerald-100 text-sm">
                <span className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></span>
                Online
              </div>
            </div>
          </div>
          <div className="px-3 py-1 bg-white/20 rounded-full flex items-center">
            <Sparkles className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">AI</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Bot message */}
        <div className="flex items-start mb-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
            <Bot className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2">
            <p className="text-sm text-gray-700">
              Salom! Sizga qanday yordam bera olaman? 🏥
            </p>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => navigate(`/ai-chat?q=${encodeURIComponent(q)}`)}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs hover:bg-emerald-100 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Savolingizni yozing..."
              className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/ai-chat')}
          className="w-full mt-3 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-700 transition flex items-center justify-center"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Suhbatni boshlash
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Xayrli tong');
    else if (hour < 18) setGreeting('Xayrli kun');
    else setGreeting('Xayrli kech');

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, widgetsRes] = await Promise.all([
        apiClient.get('/api/accounts/profile/'),
        apiClient.get('/api/accounts/dashboard/widgets/').catch(() => null)
      ]);

      const profile = profileRes.data;
      const widgets = widgetsRes?.data || {};

      setData({
        user: {
          name: profile.first_name || profile.full_name || 'Foydalanuvchi',
        },
        next_appointment: widgets.next_appointment || null,
        today_medicines: widgets.today_medicines || { total: 3, taken: 2, pending: 1 },
        air_quality: widgets.air_quality || { aqi: 75, level: "O'rtacha", city: 'Toshkent', icon: '😐' },
        health_score: widgets.health_score || { score: 78, trend: 'up', change: 6 },
        unread_messages: widgets.unread_messages?.count || 0,
        unread_notifications: widgets.notifications?.unread_count || 0,
      });
    } catch (error) {
      setData({
        user: { name: 'Foydalanuvchi' },
        next_appointment: {
          has_appointment: true,
          doctor_name: 'Dr. Akbar Karimov',
          specialty: 'Kardiolog',
          date: '2024-01-25',
          time: '14:00',
          days_left: 3,
        },
        today_medicines: { total: 3, taken: 2, pending: 1, next_dose: { medicine: 'Lisinopril', time: '20:00', dosage: '10mg' } },
        air_quality: { aqi: 85, level: "O'rtacha", city: 'Toshkent', icon: '😐' },
        health_score: { score: 78, trend: 'up', change: 6 },
        unread_messages: 2,
        unread_notifications: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-4 lg:pt-6 pb-6 lg:pb-8">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div>
              <p className="text-blue-200 text-sm lg:text-base">{greeting} 👋</p>
              <h1 className="text-xl lg:text-3xl font-bold">{data?.user.name}</h1>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <button
                onClick={() => navigate('/chat')}
                className="relative p-2 lg:p-3 bg-white/20 rounded-full hover:bg-white/30 transition"
              >
                <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6" />
                {data?.unread_messages && data.unread_messages > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {data.unread_messages}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 lg:p-3 bg-white/20 rounded-full hover:bg-white/30 transition"
              >
                <Bell className="h-5 w-5 lg:h-6 lg:w-6" />
                {data?.unread_notifications && data.unread_notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {data.unread_notifications}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search */}
          <button
            onClick={() => navigate('/doctors')}
            className="w-full lg:max-w-xl flex items-center bg-white/20 rounded-xl px-4 py-3 lg:py-4 text-white/80 hover:bg-white/30 transition"
          >
            <Search className="h-5 w-5 mr-3" />
            <span className="text-sm lg:text-base">Shifokor yoki kasallik qidirish...</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 -mt-2 lg:-mt-4">
        {/* Desktop: 2 columns, Mobile: 1 column */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">

          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 hidden lg:block">Tezkor harakatlar</h2>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                {QUICK_ACTIONS.map(action => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.id}
                      to={action.path}
                      className="flex flex-col items-center p-3 lg:p-4 rounded-xl hover:bg-gray-50 transition"
                    >
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 ${action.color} rounded-xl flex items-center justify-center mb-2`}>
                        <Icon className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                      </div>
                      <span className="text-xs lg:text-sm text-gray-600 text-center">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* AI Widgets - Desktop: side by side, Mobile: stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <AIChatWidget />
              <AISymptomWidget />
            </div>

            {/* Next Appointment */}
            {data?.next_appointment?.has_appointment && (
              <Link
                to="/appointments"
                className="block bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 lg:p-6 text-white hover:from-blue-600 hover:to-blue-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-xl flex items-center justify-center mr-3 lg:mr-4">
                      <Calendar className="h-6 w-6 lg:h-8 lg:w-8" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm lg:text-base">Keyingi qabul</p>
                      <p className="font-semibold text-lg lg:text-xl">{data.next_appointment.doctor_name}</p>
                      <p className="text-sm lg:text-base text-white/80">{data.next_appointment.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl lg:text-4xl font-bold">{data.next_appointment.days_left}</p>
                    <p className="text-sm lg:text-base text-white/80">kun qoldi</p>
                  </div>
                </div>
              </Link>
            )}

            {/* Today's Medicines */}
            <Link
              to="/medicine-reminders"
              className="block bg-white rounded-2xl shadow-sm p-4 lg:p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 lg:w-14 lg:h-14 bg-purple-100 rounded-xl flex items-center justify-center mr-3 lg:mr-4">
                    <Pill className="h-5 w-5 lg:h-7 lg:w-7 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base lg:text-lg">Bugungi dorilar</h3>
                    <p className="text-sm lg:text-base text-gray-500">
                      {data?.today_medicines.taken}/{data?.today_medicines.total} ichildi
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
              </div>

              {/* Progress */}
              <div className="h-2 lg:h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${((data?.today_medicines.taken || 0) / (data?.today_medicines.total || 1)) * 100}%` }}
                />
              </div>

              {data?.today_medicines.next_dose && data.today_medicines.pending > 0 && (
                <div className="mt-3 lg:mt-4 flex items-center text-sm lg:text-base">
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-orange-500 mr-2" />
                  <span className="text-gray-600">
                    Keyingi: <span className="font-medium">{data.today_medicines.next_dose.medicine}</span> - {data.today_medicines.next_dose.time}
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Right Column - Sidebar (Desktop only shows as sidebar, mobile shows inline) */}
          <div className="space-y-4 lg:space-y-6 mt-4 lg:mt-0">

            {/* Health Score & Air Quality */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
              {/* Health Score */}
              <Link
                to="/analytics"
                className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2 lg:mb-3">
                  <Heart className="h-5 w-5 lg:h-6 lg:w-6 text-red-500" />
                  <div className={`flex items-center text-sm lg:text-base ${data?.health_score.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 mr-0.5" />
                    +{data?.health_score.change}
                  </div>
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900">{data?.health_score.score}</p>
                <p className="text-xs lg:text-sm text-gray-500 mt-1">Sog'liq ballari</p>
              </Link>

              {/* Air Quality */}
              <Link
                to="/air-quality"
                className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2 lg:mb-3">
                  <Wind className="h-5 w-5 lg:h-6 lg:w-6 text-cyan-500" />
                  <span className="text-2xl lg:text-3xl">{data?.air_quality.icon}</span>
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900">{data?.air_quality.aqi}</p>
                <p className="text-xs lg:text-sm text-gray-500 mt-1">{data?.air_quality.level} • {data?.air_quality.city}</p>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-base lg:text-lg">Statistika</h3>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-4">
                <Link to="/appointments" className="flex lg:flex-row flex-col items-center lg:justify-between p-2 lg:p-3 hover:bg-gray-50 rounded-xl transition">
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-blue-500 lg:mr-3 mb-1 lg:mb-0" />
                    <span className="hidden lg:block text-gray-600">Qabullar</span>
                  </div>
                  <p className="text-lg lg:text-xl font-bold text-gray-900">12</p>
                  <p className="text-xs text-gray-500 lg:hidden">Qabullar</p>
                </Link>
                <Link to="/documents" className="flex lg:flex-row flex-col items-center lg:justify-between p-2 lg:p-3 hover:bg-gray-50 rounded-xl transition">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 text-teal-500 lg:mr-3 mb-1 lg:mb-0" />
                    <span className="hidden lg:block text-gray-600">Hujjatlar</span>
                  </div>
                  <p className="text-lg lg:text-xl font-bold text-gray-900">8</p>
                  <p className="text-xs text-gray-500 lg:hidden">Hujjatlar</p>
                </Link>
                <Link to="/doctors" className="flex lg:flex-row flex-col items-center lg:justify-between p-2 lg:p-3 hover:bg-gray-50 rounded-xl transition">
                  <div className="flex items-center">
                    <Stethoscope className="h-6 w-6 text-green-500 lg:mr-3 mb-1 lg:mb-0" />
                    <span className="hidden lg:block text-gray-600">Shifokorlar</span>
                  </div>
                  <p className="text-lg lg:text-xl font-bold text-gray-900">5</p>
                  <p className="text-xs text-gray-500 lg:hidden">Shifokorlar</p>
                </Link>
              </div>
            </div>

            {/* Nearby Hospitals */}
            <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <h3 className="font-semibold text-gray-900 text-base lg:text-lg">Yaqin atrofdagi</h3>
                <Link to="/hospitals" className="text-blue-600 text-sm font-medium hover:underline">
                  Barchasi
                </Link>
              </div>
              <div className="space-y-2 lg:space-y-3">
                {[
                  { id: 1, name: 'Dori-Darmon Dorixonasi', type: 'Dorixona', distance: '1.2 km', is_24: true },
                  { id: 2, name: 'Premium Med Clinic', type: 'Klinika', distance: '2.5 km', is_24: false },
                  { id: 3, name: 'City Hospital', type: 'Kasalxona', distance: '3.8 km', is_24: true },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 lg:p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                        <Building2 className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm lg:text-base">{item.name}</p>
                        <p className="text-xs lg:text-sm text-gray-500">{item.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm lg:text-base font-medium text-gray-900">{item.distance}</p>
                      {item.is_24 && <p className="text-xs text-green-600">24 soat</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}