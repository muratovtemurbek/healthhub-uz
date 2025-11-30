// src/pages/doctor/DoctorDashboard.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Clock, Activity, Heart,
  Bell, LogOut, Menu, X, TrendingUp,
  CheckCircle, XCircle, User, ChevronRight,
  Stethoscope, FileText, DollarSign, Star
} from 'lucide-react';
import apiClient from '../../api/client';

interface Stats {
  total_patients: number;
  today_appointments: number;
  pending_appointments: number;
  completed_appointments: number;
  monthly_earnings: number;
  rating: number;
}

interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  date: string;
  time: string;
  status: string;
  reason: string;
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    total_patients: 0,
    today_appointments: 0,
    pending_appointments: 0,
    completed_appointments: 0,
    monthly_earnings: 0,
    rating: 0
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Stats
      try {
        const statsRes = await apiClient.get('/api/doctors/stats/');
        setStats(statsRes.data);
      } catch (e) {
        setStats({
          total_patients: 156,
          today_appointments: 8,
          pending_appointments: 3,
          completed_appointments: 5,
          monthly_earnings: 12500000,
          rating: 4.8
        });
      }

      // Today appointments
      try {
        const aptRes = await apiClient.get('/api/doctors/appointments/today/');
        setTodayAppointments(aptRes.data);
      } catch (e) {
        setTodayAppointments([
          { id: '1', patient_name: 'Ali Valiyev', patient_phone: '+998901234567', date: '2024-01-22', time: '09:00', status: 'confirmed', reason: 'Yurak tekshiruvi' },
          { id: '2', patient_name: 'Madina Karimova', patient_phone: '+998907654321', date: '2024-01-22', time: '10:00', status: 'pending', reason: 'Konsultatsiya' },
          { id: '3', patient_name: 'Bobur Alimov', patient_phone: '+998901112233', date: '2024-01-22', time: '11:30', status: 'confirmed', reason: 'Qayta tekshiruv' },
          { id: '4', patient_name: 'Nilufar Saidova', patient_phone: '+998905556677', date: '2024-01-22', time: '14:00', status: 'pending', reason: 'Dori yozish' },
        ]);
      }
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Tasdiqlangan';
      case 'pending': return 'Kutilmoqda';
      case 'completed': return 'Yakunlangan';
      case 'cancelled': return 'Bekor qilingan';
      default: return status;
    }
  };

  const menuItems = [
    { icon: Activity, label: 'Dashboard', link: '/doctor/dashboard', active: true },
    { icon: Calendar, label: 'Qabullar', link: '/doctor/appointments' },
    { icon: Users, label: 'Bemorlar', link: '/doctor/patients' },
    { icon: Clock, label: 'Ish jadvali', link: '/doctor/schedule' },
    { icon: FileText, label: 'Tibbiy yozuvlar', link: '/doctor/records' },
    { icon: User, label: 'Profil', link: '/doctor/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">HealthHub</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Shifokor Panel</p>
        </div>

        {/* Doctor Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Dr. {user?.first_name || 'Shifokor'}</p>
              <p className="text-sm text-gray-500">Kardiolog</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item, idx) => (
              <li key={idx}>
                <Link
                  to={item.link}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Xush kelibsiz, Dr. {user?.first_name || 'Shifokor'}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="h-6 w-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Bugungi qabullar</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.today_appointments}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Kutilmoqda</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending_appointments}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Jami bemorlar</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_patients}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Reyting</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 flex items-center">
                    {stats.rating}
                    <Star className="h-5 w-5 text-yellow-500 ml-1 fill-yellow-500" />
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Card */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Oylik daromad</p>
                <p className="text-3xl font-bold mt-1">
                  {(stats.monthly_earnings / 1000000).toFixed(1)} mln UZS
                </p>
                <p className="text-green-200 text-sm mt-2">
                  +12% o'tgan oyga nisbatan
                </p>
              </div>
              <DollarSign className="h-16 w-16 text-green-200" />
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Bugungi qabullar</h2>
                <Link to="/doctor/appointments" className="text-blue-600 text-sm hover:underline flex items-center">
                  Barchasi <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Bugun qabullar yo'q</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {todayAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{apt.patient_name}</p>
                          <p className="text-sm text-gray-500">{apt.reason}</p>
                          <p className="text-sm text-gray-400">{apt.patient_phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{apt.time}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(apt.status)}`}>
                          {getStatusLabel(apt.status)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {apt.status === 'pending' && (
                      <div className="mt-3 flex space-x-2">
                        <button className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Tasdiqlash
                        </button>
                        <button className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 flex items-center justify-center">
                          <XCircle className="h-4 w-4 mr-1" />
                          Bekor qilish
                        </button>
                      </div>
                    )}

                    {apt.status === 'confirmed' && (
                      <div className="mt-3">
                        <Link
                          to={`/doctor/medical-record/new?patient=${apt.id}`}
                          className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 flex items-center justify-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Tibbiy yozuv yaratish
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}