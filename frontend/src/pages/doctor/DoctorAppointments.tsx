// src/pages/doctor/DoctorAppointments.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Search, Filter, Clock, User,
  CheckCircle, XCircle, Phone, FileText,
  Menu, Heart, X, LogOut, Activity, Users,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import apiClient from '../../api/client';

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  date: string;
  time: string;
  status: string;
  payment_status: string;
  reason: string;
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'pending' | 'confirmed' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/doctors/appointments/');
      setAppointments(response.data);
    } catch (err) {
      // Demo data
      setAppointments([
        { id: '1', patient_name: 'Ali Valiyev', patient_email: 'ali@test.uz', patient_phone: '+998901234567', date: '2024-01-22', time: '09:00', status: 'confirmed', payment_status: 'paid', reason: 'Yurak tekshiruvi' },
        { id: '2', patient_name: 'Madina Karimova', patient_email: 'madina@test.uz', patient_phone: '+998907654321', date: '2024-01-22', time: '10:00', status: 'pending', payment_status: 'pending', reason: 'Konsultatsiya' },
        { id: '3', patient_name: 'Bobur Alimov', patient_email: 'bobur@test.uz', patient_phone: '+998901112233', date: '2024-01-22', time: '11:30', status: 'confirmed', payment_status: 'paid', reason: 'Qayta tekshiruv' },
        { id: '4', patient_name: 'Nilufar Saidova', patient_email: 'nilufar@test.uz', patient_phone: '+998905556677', date: '2024-01-23', time: '14:00', status: 'pending', payment_status: 'pending', reason: 'Dori yozish' },
        { id: '5', patient_name: 'Sardor Rahimov', patient_email: 'sardor@test.uz', patient_phone: '+998909998877', date: '2024-01-21', time: '15:00', status: 'completed', payment_status: 'paid', reason: 'Tekshiruv natijasi' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await apiClient.patch(`/api/appointments/${id}/`, { status: 'confirmed' });
      fetchAppointments();
    } catch (err) {
      // Demo update
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Qabulni bekor qilmoqchimisiz?')) return;
    try {
      await apiClient.patch(`/api/appointments/${id}/`, { status: 'cancelled' });
      fetchAppointments();
    } catch (err) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await apiClient.patch(`/api/appointments/${id}/`, { status: 'completed' });
      fetchAppointments();
    } catch (err) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' } : a));
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
      month: 'short',
      day: 'numeric'
    });
  };

  const menuItems = [
    { icon: Activity, label: 'Dashboard', link: '/doctor/dashboard' },
    { icon: Calendar, label: 'Qabullar', link: '/doctor/appointments', active: true },
    { icon: Users, label: 'Bemorlar', link: '/doctor/patients' },
    { icon: Clock, label: 'Ish jadvali', link: '/doctor/schedule' },
    { icon: FileText, label: 'Tibbiy yozuvlar', link: '/doctor/records' },
    { icon: User, label: 'Profil', link: '/doctor/profile' },
  ];

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      if (apt.date !== today) return false;
    } else if (filter !== 'all' && apt.status !== filter) {
      return false;
    }
    if (search && !apt.patient_name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
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
          <p className="text-xs text-gray-500 mt-1">Shifokor Panel</p>
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
                  placeholder="Bemor qidirish..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'Barchasi' },
                  { key: 'today', label: 'Bugun' },
                  { key: 'pending', label: 'Kutilmoqda' },
                  { key: 'confirmed', label: 'Tasdiqlangan' },
                  { key: 'completed', label: 'Yakunlangan' }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key as any)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === f.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Appointments List */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Qabullar topilmadi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                          <User className="h-7 w-7 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{apt.patient_name}</h3>
                          <p className="text-sm text-gray-500">{apt.reason}</p>
                          <div className="flex items-center space-x-3 mt-1 text-sm text-gray-400">
                            <span className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {apt.patient_phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatDate(apt.date)}</p>
                        <p className="text-lg font-bold text-blue-600">{apt.time}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(apt.status)}`}>
                          {getStatusLabel(apt.status)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                      {apt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirm(apt.id)}
                            className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center justify-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Tasdiqlash
                          </button>
                          <button
                            onClick={() => handleCancel(apt.id)}
                            className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 flex items-center justify-center"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Bekor qilish
                          </button>
                        </>
                      )}

                      {apt.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleComplete(apt.id)}
                            className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 flex items-center justify-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Yakunlash
                          </button>
                          <Link
                            to={`/doctor/medical-record/new?appointment=${apt.id}`}
                            className="flex-1 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 flex items-center justify-center"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Tibbiy yozuv
                          </Link>
                        </>
                      )}

                      {apt.status === 'completed' && (
                        <Link
                          to={`/doctor/medical-record/new?appointment=${apt.id}`}
                          className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Tibbiy yozuvni ko'rish
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}