// src/pages/admin/AdminAppointments.tsx
import { useState } from 'react';
import {
  Search, Filter, Calendar, Clock, CheckCircle,
  XCircle, AlertCircle, MoreVertical, ChevronLeft,
  ChevronRight, Eye, User, UserCog
} from 'lucide-react';

interface Appointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  fee: number;
}

export default function AdminAppointments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [appointments] = useState<Appointment[]>([
    { id: 1, patient_name: 'Aziza Karimova', doctor_name: 'Dr. Akbar Karimov', specialty: 'Kardiolog', date: '2024-01-20', time: '09:00', type: 'Konsultatsiya', status: 'completed', fee: 150000 },
    { id: 2, patient_name: 'Bobur Aliyev', doctor_name: 'Dr. Nodira Azimova', specialty: 'Pediatr', date: '2024-01-20', time: '09:30', type: 'Qayta tekshiruv', status: 'completed', fee: 100000 },
    { id: 3, patient_name: 'Dilnoza Rahimova', doctor_name: 'Dr. Jasur Toshev', specialty: 'Terapevt', date: '2024-01-20', time: '10:00', type: 'Konsultatsiya', status: 'confirmed', fee: 120000 },
    { id: 4, patient_name: 'Eldor Toshmatov', doctor_name: 'Dr. Akbar Karimov', specialty: 'Kardiolog', date: '2024-01-20', time: '10:30', type: "Ko'rik", status: 'confirmed', fee: 150000 },
    { id: 5, patient_name: 'Feruza Umarova', doctor_name: 'Dr. Malika Rahimova', specialty: 'Dermatolog', date: '2024-01-20', time: '11:00', type: 'Konsultatsiya', status: 'pending', fee: 130000 },
    { id: 6, patient_name: 'Gulnora Saidova', doctor_name: 'Dr. Sardor Umarov', specialty: 'Nevropatolog', date: '2024-01-20', time: '14:00', type: 'Konsultatsiya', status: 'pending', fee: 140000 },
    { id: 7, patient_name: 'Husan Qodirov', doctor_name: 'Dr. Jasur Toshev', specialty: 'Terapevt', date: '2024-01-20', time: '14:30', type: 'Qayta tekshiruv', status: 'cancelled', fee: 120000 },
    { id: 8, patient_name: 'Iroda Nazarova', doctor_name: 'Dr. Gulnora Saidova', specialty: 'Ginekolog', date: '2024-01-20', time: '15:00', type: 'Konsultatsiya', status: 'pending', fee: 160000 },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Yakunlangan';
      case 'confirmed': return 'Tasdiqlangan';
      case 'pending': return 'Kutilmoqda';
      case 'cancelled': return 'Bekor qilingan';
      default: return status;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!apt.patient_name.toLowerCase().includes(query) && !apt.doctor_name.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  const stats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    revenue: appointments.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.fee, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Qabullar</h1>
        <p className="text-gray-500 mt-1">Barcha qabullarni boshqaring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Jami</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-gray-500">Yakunlangan</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-500">Kutilmoqda</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              <p className="text-sm text-gray-500">Bekor qilingan</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm col-span-2 lg:col-span-1">
          <div>
            <p className="text-2xl font-bold text-gray-900">{(stats.revenue / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-gray-500">Daromad (so'm)</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Bemor yoki shifokor qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Barchasi' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Bemor</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Shifokor</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Sana/Vaqt</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Turi</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Narx</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{apt.patient_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <UserCog className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{apt.doctor_name}</p>
                        <p className="text-sm text-gray-500">{apt.specialty}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div>
                      <p className="font-medium text-gray-900">{apt.date}</p>
                      <p className="text-sm text-gray-500">{apt.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-700">{apt.type}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="font-medium text-gray-900">{apt.fee.toLocaleString()} so'm</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {getStatusText(apt.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="h-5 w-5" />
                      </button>
                      {apt.status === 'pending' && (
                        <>
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Qabullar topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}