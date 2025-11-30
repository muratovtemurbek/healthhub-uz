// src/pages/admin/AdminAppointments.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Search, Eye, ChevronLeft, ChevronRight,
  Menu, Heart, X, LogOut, BarChart3, Users, UserCheck,
  CreditCard, Hospital, Settings, CheckCircle, Clock,
  XCircle, User, MapPin
} from 'lucide-react';
import apiClient from '../../api/client';

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  doctor_name: string;
  doctor_specialty: string;
  date: string;
  time: string;
  status: string;
  payment_status: string;
  reason: string;
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [filter, search]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/appointments/');
      setAppointments(response.data.results || response.data);
    } catch (err) {
      // Demo data
      setAppointments([
        { id: '1', patient_name: 'Ali Valiyev', patient_email: 'ali@test.uz', doctor_name: 'Dr. Jasur Toshmatov', doctor_specialty: 'Kardiolog', date: '2024-01-22', time: '10:00', status: 'confirmed', payment_status: 'paid', reason: 'Yurak tekshiruvi' },
        { id: '2', patient_name: 'Madina Karimova', patient_email: 'madina@test.uz', doctor_name: 'Dr. Nilufar Saidova', doctor_specialty: 'Terapevt', date: '2024-01-22', time: '11:30', status: 'pending', payment_status: 'pending', reason: 'Umumiy tekshiruv' },
        { id: '3', patient_name: 'Bobur Alimov', patient_email: 'bobur@test.uz', doctor_name: 'Dr. Sardor Rahimov', doctor_specialty: 'Nevrolog', date: '2024-01-21', time: '14:00', status: 'completed', payment_status: 'paid', reason: 'Bosh ogrigi' },
        { id: '4', patient_name: 'Gulnora Azimova', patient_email: 'gulnora@test.uz', doctor_name: 'Dr. Jasur Toshmatov', doctor_specialty: 'Kardiolog', date: '2024-01-21', time: '09:00', status: 'cancelled', payment_status: 'refunded', reason: 'Konsultatsiya' },
      ]);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', link: '/admin/dashboard' },
    { icon: Users, label: 'Foydalanuvchilar', link: '/admin/users' },
    { icon: UserCheck, label: 'Shifokorlar', link: '/admin/doctors' },
    { icon: Calendar, label: 'Qabullar', link: '/admin/appointments', active: true },
    { icon: CreditCard, label: 'Tolovlar', link: '/admin/payments' },
    { icon: Hospital, label: 'Kasalxonalar', link: '/admin/hospitals' },
    { icon: Settings, label: 'Sozlamalar', link: '/admin/settings' },
  ];

  const filteredAppointments = appointments.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (search && !a.patient_name.toLowerCase().includes(search.toLowerCase()) && !a.doctor_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

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
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item, idx) => (
              <li key={idx}>
                <Link to={item.link} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <Link to="/login" className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Chiqish</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Qabullar</h1>
                <p className="text-sm text-gray-500">Barcha qabullarni boshqarish</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {f === 'all' ? 'Barchasi' : getStatusLabel(f)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Bemor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Shifokor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Sana/Vaqt</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Holat</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tolov</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Qabullar topilmadi
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{apt.patient_name}</p>
                              <p className="text-sm text-gray-500">{apt.patient_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{apt.doctor_name}</p>
                            <p className="text-sm text-gray-500">{apt.doctor_specialty}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{formatDate(apt.date)}</p>
                            <p className="text-sm text-gray-500">{apt.time}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                            {getStatusLabel(apt.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            apt.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                            apt.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {apt.payment_status === 'paid' ? 'Tolangan' : apt.payment_status === 'pending' ? 'Kutilmoqda' : apt.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Eye className="h-4 w-4 text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
