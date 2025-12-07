// src/pages/doctor/DoctorDashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Users, Clock, TrendingUp, CheckCircle,
  XCircle, AlertCircle, ChevronRight, Star, Activity,
  Stethoscope, FileText, MessageCircle, Bell, DollarSign,
  UserCheck, UserX, CalendarCheck, BarChart3
} from 'lucide-react';

interface Appointment {
  id: number;
  patient_name: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed';
  symptoms?: string;
}

export default function DoctorDashboard() {
  const [stats] = useState({
    today_appointments: 8,
    pending_appointments: 3,
    completed_today: 5,
    cancelled_today: 1,
    total_patients: 156,
    new_patients_week: 12,
    rating: 4.8,
    reviews_count: 89,
    earnings_month: 15600000,
    unread_messages: 4,
  });

  const [todayAppointments] = useState<Appointment[]>([
    { id: 1, patient_name: 'Aziza Karimova', time: '09:00', type: 'Konsultatsiya', status: 'completed', symptoms: "Bosh og'rig'i" },
    { id: 2, patient_name: 'Bobur Aliyev', time: '09:30', type: 'Qayta tekshiruv', status: 'completed' },
    { id: 3, patient_name: 'Dilnoza Rahimova', time: '10:00', type: 'Konsultatsiya', status: 'completed' },
    { id: 4, patient_name: 'Eldor Toshmatov', time: '10:30', type: 'Konsultatsiya', status: 'completed' },
    { id: 5, patient_name: 'Feruza Umarova', time: '11:00', type: "Tibbiy ko'rik", status: 'completed' },
    { id: 6, patient_name: 'Gulnora Saidova', time: '14:00', type: 'Konsultatsiya', status: 'in_progress', symptoms: 'Yurak urishi' },
    { id: 7, patient_name: 'Husan Qodirov', time: '14:30', type: 'Qayta tekshiruv', status: 'confirmed' },
    { id: 8, patient_name: 'Iroda Nazarova', time: '15:00', type: 'Konsultatsiya', status: 'pending', symptoms: 'Qon bosimi' },
  ]);

  const [recentPatients] = useState([
    { id: 1, name: 'Aziza Karimova', last_visit: 'Bugun', diagnosis: 'Migren', status: 'stable' },
    { id: 2, name: 'Bobur Aliyev', last_visit: 'Kecha', diagnosis: 'Gipertoniya', status: 'improving' },
    { id: 3, name: 'Dilnoza Rahimova', last_visit: '2 kun oldin', diagnosis: 'Aritmiya', status: 'monitoring' },
  ]);

  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Xayrli tong');
    else if (hour < 18) setGreeting('Xayrli kun');
    else setGreeting('Xayrli kech');

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-yellow-100 text-yellow-700';
      case 'pending': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Yakunlandi';
      case 'in_progress': return 'Jarayonda';
      case 'confirmed': return 'Tasdiqlangan';
      case 'pending': return 'Kutilmoqda';
      default: return status;
    }
  };

  const getPatientStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'text-green-600';
      case 'improving': return 'text-blue-600';
      case 'monitoring': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-gray-500 text-sm lg:text-base">{greeting}, doktor! 👨‍⚕️</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="mt-2 lg:mt-0 flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {currentTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-gray-500">
                {currentTime.toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs lg:text-sm text-green-600 font-medium">+3 yangi</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.today_appointments}</p>
          <p className="text-sm text-gray-500">Bugungi qabullar</p>
        </div>

        {/* Patients */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs lg:text-sm text-green-600 font-medium">+{stats.new_patients_week}</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.total_patients}</p>
          <p className="text-sm text-gray-500">Jami bemorlar</p>
        </div>

        {/* Rating */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-xs lg:text-sm text-gray-500">{stats.reviews_count} sharh</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.rating}</p>
          <p className="text-sm text-gray-500">Reyting</p>
        </div>

        {/* Earnings */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">
            {(stats.earnings_month / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm text-gray-500">Oylik daromad</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm">
          <div className="p-4 lg:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">Bugungi jadval</h2>
              <Link to="/doctor/appointments" className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                Barchasi <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Bajarildi: {stats.completed_today}/{stats.today_appointments}</span>
                <span className="text-gray-900 font-medium">
                  {Math.round((stats.completed_today / stats.today_appointments) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(stats.completed_today / stats.today_appointments) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {todayAppointments.map((apt) => (
              <div
                key={apt.id}
                className={`p-4 lg:p-5 hover:bg-gray-50 transition ${apt.status === 'in_progress' ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4 text-lg font-semibold text-gray-600">
                      {apt.patient_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{apt.patient_name}</p>
                      <p className="text-sm text-gray-500">{apt.type}</p>
                      {apt.symptoms && (
                        <p className="text-xs text-orange-600 mt-0.5">⚠️ {apt.symptoms}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{apt.time}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {getStatusText(apt.status)}
                    </span>
                  </div>
                </div>
                {apt.status === 'in_progress' && (
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                      Yakunlash
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                      Yozuv
                    </button>
                  </div>
                )}
                {apt.status === 'confirmed' && (
                  <div className="mt-3">
                    <button className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
                      Qabulni boshlash
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
            <h3 className="font-bold text-gray-900 mb-4">Tezkor harakatlar</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/doctor/schedule"
                className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
              >
                <Clock className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-sm text-gray-700">Jadval</span>
              </Link>
              <Link
                to="/doctor/patients"
                className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition"
              >
                <Users className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-sm text-gray-700">Bemorlar</span>
              </Link>
              <Link
                to="/doctor/records"
                className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition"
              >
                <FileText className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-sm text-gray-700">Yozuvlar</span>
              </Link>
              <Link
                to="/doctor/chat"
                className="relative flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition"
              >
                <MessageCircle className="h-6 w-6 text-orange-600 mb-2" />
                <span className="text-sm text-gray-700">Xabarlar</span>
                {stats.unread_messages > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {stats.unread_messages}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">So'nggi bemorlar</h3>
              <Link to="/doctor/patients" className="text-blue-600 text-sm font-medium">
                Barchasi
              </Link>
            </div>
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 font-semibold text-gray-600">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{patient.name}</p>
                      <p className="text-xs text-gray-500">{patient.diagnosis}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{patient.last_visit}</p>
                    <p className={`text-xs font-medium ${getPatientStatusColor(patient.status)}`}>
                      {patient.status === 'stable' ? '✓ Barqaror' :
                       patient.status === 'improving' ? '↑ Yaxshilanmoqda' : '👁 Kuzatuvda'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today Summary */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 lg:p-6 text-white">
            <h3 className="font-bold mb-4">Bugungi natijalar</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
                  <span className="text-white/80">Yakunlangan</span>
                </div>
                <span className="font-bold">{stats.completed_today}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-yellow-300" />
                  <span className="text-white/80">Kutilmoqda</span>
                </div>
                <span className="font-bold">{stats.pending_appointments}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-red-300" />
                  <span className="text-white/80">Bekor qilingan</span>
                </div>
                <span className="font-bold">{stats.cancelled_today}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}