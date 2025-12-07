// src/pages/admin/AdminDoctors.tsx
import { useState } from 'react';
import {
  Search, Plus, Filter, MoreVertical, Star,
  Phone, Mail, Edit2, Trash2, Eye, CheckCircle,
  XCircle, Clock, UserCog
} from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  experience: number;
  patients: number;
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  joined: string;
}

export default function AdminDoctors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [doctors] = useState<Doctor[]>([
    { id: 1, name: 'Dr. Akbar Karimov', specialty: 'Kardiolog', phone: '+998 90 123 45 67', email: 'akbar@clinic.uz', experience: 15, patients: 156, rating: 4.9, status: 'active', joined: '2020-03-15' },
    { id: 2, name: 'Dr. Nodira Azimova', specialty: 'Pediatr', phone: '+998 91 234 56 78', email: 'nodira@clinic.uz', experience: 10, patients: 142, rating: 4.8, status: 'active', joined: '2021-01-20' },
    { id: 3, name: 'Dr. Jasur Toshev', specialty: 'Terapevt', phone: '+998 93 345 67 89', email: 'jasur@clinic.uz', experience: 8, patients: 128, rating: 4.7, status: 'active', joined: '2021-06-10' },
    { id: 4, name: 'Dr. Malika Rahimova', specialty: 'Dermatolog', phone: '+998 94 456 78 90', email: 'malika@clinic.uz', experience: 12, patients: 115, rating: 4.8, status: 'inactive', joined: '2019-11-05' },
    { id: 5, name: 'Dr. Sardor Umarov', specialty: 'Nevropatolog', phone: '+998 95 567 89 01', email: 'sardor@clinic.uz', experience: 6, patients: 98, rating: 4.6, status: 'active', joined: '2022-02-28' },
    { id: 6, name: 'Dr. Gulnora Saidova', specialty: 'Ginekolog', phone: '+998 97 678 90 12', email: 'gulnora@clinic.uz', experience: 14, patients: 189, rating: 4.9, status: 'active', joined: '2018-08-12' },
    { id: 7, name: 'Dr. Otabek Nazarov', specialty: 'Ortoped', phone: '+998 99 789 01 23', email: 'otabek@clinic.uz', experience: 5, patients: 67, rating: 4.5, status: 'pending', joined: '2024-01-10' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Faol';
      case 'inactive': return 'Nofaol';
      case 'pending': return 'Kutilmoqda';
      default: return status;
    }
  };

  const filteredDoctors = doctors.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase()) && !d.specialty.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: doctors.length,
    active: doctors.filter(d => d.status === 'active').length,
    inactive: doctors.filter(d => d.status === 'inactive').length,
    pending: doctors.filter(d => d.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Shifokorlar</h1>
          <p className="text-gray-500 mt-1">Barcha shifokorlarni boshqaring</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 lg:mt-0 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="h-5 w-5" />
          Yangi shifokor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Jami</p>
            </div>
            <UserCog className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-gray-500">Faol</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              <p className="text-sm text-gray-500">Nofaol</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-500">Kutilmoqda</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
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
              placeholder="Shifokor qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'inactive', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white'
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
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Shifokor</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Mutaxassislik</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Aloqa</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Bemorlar</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Reyting</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold">{doctor.name.split(' ')[1]?.charAt(0) || doctor.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-500">{doctor.experience} yil tajriba</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{doctor.specialty}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div>
                      <p className="text-sm text-gray-900">{doctor.phone}</p>
                      <p className="text-sm text-gray-500">{doctor.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="font-semibold text-gray-900">{doctor.patients}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-semibold text-gray-900">{doctor.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doctor.status)}`}>
                      {getStatusText(doctor.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Ko'rish">
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Tahrirlash">
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="O'chirish">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <UserCog className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Shifokorlar topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}