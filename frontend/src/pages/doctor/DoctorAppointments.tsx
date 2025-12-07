// src/pages/doctor/DoctorAppointments.tsx
import { useState } from 'react';
import {
  Calendar, Clock, User, Phone, FileText,
  CheckCircle, XCircle, MoreVertical, Search,
  Filter, ChevronLeft, ChevronRight, Video
} from 'lucide-react';

interface Appointment {
  id: number;
  patient_name: string;
  patient_phone: string;
  patient_age: number;
  date: string;
  time: string;
  type: 'consultation' | 'checkup' | 'follow_up' | 'online';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  symptoms?: string;
  notes?: string;
}

export default function DoctorAppointments() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [appointments] = useState<Appointment[]>([
    { id: 1, patient_name: 'Aziza Karimova', patient_phone: '+998 90 123 45 67', patient_age: 34, date: '2024-01-20', time: '09:00', type: 'consultation', status: 'completed', symptoms: "Bosh og'rig'i, ko'ngil aynish" },
    { id: 2, patient_name: 'Bobur Aliyev', patient_phone: '+998 91 234 56 78', patient_age: 45, date: '2024-01-20', time: '09:30', type: 'follow_up', status: 'completed' },
    { id: 3, patient_name: 'Dilnoza Rahimova', patient_phone: '+998 93 345 67 89', patient_age: 28, date: '2024-01-20', time: '10:00', type: 'consultation', status: 'completed', symptoms: 'Yurak urishi tezlashishi' },
    { id: 4, patient_name: 'Eldor Toshmatov', patient_phone: '+998 94 456 78 90', patient_age: 52, date: '2024-01-20', time: '10:30', type: 'checkup', status: 'confirmed' },
    { id: 5, patient_name: 'Feruza Umarova', patient_phone: '+998 95 567 89 01', patient_age: 41, date: '2024-01-20', time: '11:00', type: 'online', status: 'confirmed', symptoms: 'Qon bosimi' },
    { id: 6, patient_name: 'Gulnora Saidova', patient_phone: '+998 97 678 90 12', patient_age: 38, date: '2024-01-20', time: '14:00', type: 'consultation', status: 'pending', symptoms: 'Uyqusizlik' },
    { id: 7, patient_name: 'Husan Qodirov', patient_phone: '+998 99 789 01 23', patient_age: 55, date: '2024-01-20', time: '14:30', type: 'follow_up', status: 'pending' },
    { id: 8, patient_name: 'Iroda Nazarova', patient_phone: '+998 90 890 12 34', patient_age: 29, date: '2024-01-20', time: '15:00', type: 'consultation', status: 'cancelled', symptoms: 'Allergiya' },
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
      case 'completed': return 'Yakunlandi';
      case 'confirmed': return 'Tasdiqlangan';
      case 'pending': return 'Kutilmoqda';
      case 'cancelled': return 'Bekor qilingan';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'consultation': return 'Konsultatsiya';
      case 'checkup': return "Tibbiy ko'rik";
      case 'follow_up': return 'Qayta tekshiruv';
      case 'online': return 'Online';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'online') return <Video className="h-4 w-4 text-purple-500" />;
    return null;
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter !== 'all' && apt.status !== filter) return false;
    if (searchQuery && !apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Qabullar</h1>
        <p className="text-gray-500 mt-1">Barcha qabullarni boshqaring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Jami</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-500">Yakunlangan</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">Kutilmoqda</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-sm text-gray-500">Bekor qilingan</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Bemor qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date picker */}
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

          {/* Status filter */}
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  filter === status
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

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 lg:px-6 py-4 text-sm font-semibold text-gray-900">Bemor</th>
                <th className="text-left px-4 lg:px-6 py-4 text-sm font-semibold text-gray-900">Vaqt</th>
                <th className="text-left px-4 lg:px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Turi</th>
                <th className="text-left px-4 lg:px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Alomatlar</th>
                <th className="text-left px-4 lg:px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-right px-4 lg:px-6 py-4 text-sm font-semibold text-gray-900">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold">{apt.patient_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{apt.patient_name}</p>
                        <p className="text-sm text-gray-500">{apt.patient_age} yosh • {apt.patient_phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <p className="font-semibold text-gray-900">{apt.time}</p>
                    <p className="text-sm text-gray-500">{apt.date}</p>
                  </td>
                  <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(apt.type)}
                      <span className="text-gray-700">{getTypeText(apt.type)}</span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
                    <p className="text-gray-600 text-sm max-w-xs truncate">{apt.symptoms || '-'}</p>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {getStatusText(apt.status)}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {apt.status === 'pending' && (
                        <>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Tasdiqlash">
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Bekor qilish">
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                          Boshlash
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="h-5 w-5" />
                      </button>
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