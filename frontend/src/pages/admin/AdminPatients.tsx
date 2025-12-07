// src/pages/admin/AdminPatients.tsx
import { useState } from 'react';
import {
  Search, Plus, Filter, MoreVertical, Users,
  Phone, Mail, Edit2, Trash2, Eye, CheckCircle,
  XCircle, Calendar, MapPin
} from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  phone: string;
  email?: string;
  age: number;
  gender: 'male' | 'female';
  address: string;
  total_visits: number;
  last_visit: string;
  status: 'active' | 'inactive';
  registered: string;
}

export default function AdminPatients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [patients] = useState<Patient[]>([
    { id: 1, name: 'Aziza Karimova', phone: '+998 90 123 45 67', email: 'aziza@mail.uz', age: 34, gender: 'female', address: 'Toshkent, Chilonzor', total_visits: 8, last_visit: '2024-01-20', status: 'active', registered: '2023-05-15' },
    { id: 2, name: 'Bobur Aliyev', phone: '+998 91 234 56 78', age: 45, gender: 'male', address: 'Toshkent, Yunusobod', total_visits: 12, last_visit: '2024-01-19', status: 'active', registered: '2022-11-20' },
    { id: 3, name: 'Dilnoza Rahimova', phone: '+998 93 345 67 89', email: 'dilnoza@mail.uz', age: 28, gender: 'female', address: 'Toshkent, Mirzo Ulugbek', total_visits: 5, last_visit: '2024-01-18', status: 'active', registered: '2023-08-10' },
    { id: 4, name: 'Eldor Toshmatov', phone: '+998 94 456 78 90', age: 52, gender: 'male', address: 'Toshkent, Shayxontohur', total_visits: 15, last_visit: '2024-01-15', status: 'active', registered: '2021-03-05' },
    { id: 5, name: 'Feruza Umarova', phone: '+998 95 567 89 01', age: 41, gender: 'female', address: 'Toshkent, Yakkasaroy', total_visits: 6, last_visit: '2024-01-14', status: 'inactive', registered: '2023-01-25' },
    { id: 6, name: 'Gulnora Saidova', phone: '+998 97 678 90 12', email: 'gulnora@mail.uz', age: 38, gender: 'female', address: 'Toshkent, Sergeli', total_visits: 9, last_visit: '2024-01-12', status: 'active', registered: '2022-06-18' },
    { id: 7, name: 'Husan Qodirov', phone: '+998 99 789 01 23', age: 55, gender: 'male', address: 'Toshkent, Olmazor', total_visits: 3, last_visit: '2023-12-20', status: 'inactive', registered: '2023-10-01' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredPatients = patients.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.phone.includes(searchQuery)) return false;
    return true;
  });

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    inactive: patients.filter(p => p.status === 'inactive').length,
    thisMonth: patients.filter(p => new Date(p.registered).getMonth() === new Date().getMonth()).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Bemorlar</h1>
          <p className="text-gray-500 mt-1">Barcha bemorlarni boshqaring</p>
        </div>
        <button className="mt-4 lg:mt-0 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="h-5 w-5" />
          Yangi bemor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Jami bemorlar</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
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
              <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
              <p className="text-sm text-gray-500">Bu oy</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
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
              placeholder="Bemor qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Barchasi' : status === 'active' ? 'Faol' : 'Nofaol'}
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
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Aloqa</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Manzil</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Tashriflar</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Oxirgi tashrif</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold">{patient.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-500">{patient.age} yosh • {patient.gender === 'male' ? 'Erkak' : 'Ayol'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div>
                      <p className="text-sm text-gray-900">{patient.phone}</p>
                      {patient.email && <p className="text-sm text-gray-500">{patient.email}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {patient.address}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{patient.total_visits}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-600">{patient.last_visit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status === 'active' ? 'Faol' : 'Nofaol'}
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

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Bemorlar topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}