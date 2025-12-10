// src/pages/admin/AdminPatients.tsx
import { useState, useEffect } from 'react';
import {
  Search, Plus, Filter, MoreVertical, Users,
  Phone, Mail, Edit2, Trash2, Eye, CheckCircle,
  XCircle, Calendar, MapPin, Loader2, Power, PowerOff
} from 'lucide-react';
import api from '../../services/api';

interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  age: number | null;
  gender: 'male' | 'female' | null;
  address: string | null;
  total_visits: number;
  last_visit: string | null;
  status: 'active' | 'inactive';
  registered: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  new_this_week: number;
  new_this_month: number;
}

export default function AdminPatients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await api.get('/admin-panel/patients/', { params });
      setPatients(response.data);
    } catch (error) {
      console.error('Fetch patients error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin-panel/patients/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPatients(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [statusFilter, searchQuery]);

  const handleToggleStatus = async (patient: Patient) => {
    try {
      if (patient.status === 'active') {
        await api.post(`/admin-panel/patients/${patient.id}/deactivate/`);
      } else {
        await api.post(`/admin-panel/patients/${patient.id}/activate/`);
      }
      fetchPatients();
      fetchStats();
    } catch (error) {
      console.error('Toggle status error:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Bemorlar</h1>
          <p className="text-gray-500 mt-1">Barcha bemorlarni boshqaring</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              <p className="text-sm text-gray-500">Jami bemorlar</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
              <p className="text-sm text-gray-500">Faol</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-600">{stats?.inactive || 0}</p>
              <p className="text-sm text-gray-500">Nofaol</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats?.new_this_month || 0}</p>
              <p className="text-sm text-gray-500">Bu oy yangi</p>
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
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {patient.avatar ? (
                        <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold">{patient.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-500">
                          {patient.age ? `${patient.age} yosh` : ''}
                          {patient.age && patient.gender ? ' • ' : ''}
                          {patient.gender === 'male' ? 'Erkak' : patient.gender === 'female' ? 'Ayol' : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div>
                      <p className="text-sm text-gray-900">{patient.phone || '-'}</p>
                      {patient.email && <p className="text-sm text-gray-500">{patient.email}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    {patient.address ? (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {patient.address}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{patient.total_visits}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-600">{patient.last_visit || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status === 'active' ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(patient)}
                        className={`p-2 rounded-lg ${
                          patient.status === 'active'
                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={patient.status === 'active' ? 'Bloklash' : 'Faollashtirish'}
                      >
                        {patient.status === 'active' ? <PowerOff className="h-5 w-5" /> : <Power className="h-5 w-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {patients.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Bemorlar topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}