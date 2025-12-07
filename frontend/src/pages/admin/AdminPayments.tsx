// src/pages/admin/AdminPayments.tsx
import { useState } from 'react';
import {
  Search, Filter, CreditCard, DollarSign, TrendingUp,
  TrendingDown, CheckCircle, XCircle, Clock, Eye,
  Download, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';

interface Payment {
  id: number;
  patient_name: string;
  doctor_name: string;
  amount: number;
  method: 'payme' | 'click' | 'cash' | 'card';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  time: string;
  appointment_id: number;
}

export default function AdminPayments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const [payments] = useState<Payment[]>([
    { id: 1, patient_name: 'Aziza Karimova', doctor_name: 'Dr. Akbar Karimov', amount: 150000, method: 'payme', status: 'completed', date: '2024-01-20', time: '09:15', appointment_id: 1001 },
    { id: 2, patient_name: 'Bobur Aliyev', doctor_name: 'Dr. Nodira Azimova', amount: 100000, method: 'click', status: 'completed', date: '2024-01-20', time: '09:45', appointment_id: 1002 },
    { id: 3, patient_name: 'Dilnoza Rahimova', doctor_name: 'Dr. Jasur Toshev', amount: 120000, method: 'cash', status: 'completed', date: '2024-01-20', time: '10:20', appointment_id: 1003 },
    { id: 4, patient_name: 'Eldor Toshmatov', doctor_name: 'Dr. Akbar Karimov', amount: 150000, method: 'card', status: 'pending', date: '2024-01-20', time: '10:50', appointment_id: 1004 },
    { id: 5, patient_name: 'Feruza Umarova', doctor_name: 'Dr. Malika Rahimova', amount: 130000, method: 'payme', status: 'completed', date: '2024-01-19', time: '11:30', appointment_id: 1005 },
    { id: 6, patient_name: 'Gulnora Saidova', doctor_name: 'Dr. Sardor Umarov', amount: 140000, method: 'click', status: 'failed', date: '2024-01-19', time: '14:15', appointment_id: 1006 },
    { id: 7, patient_name: 'Husan Qodirov', doctor_name: 'Dr. Jasur Toshev', amount: 120000, method: 'payme', status: 'refunded', date: '2024-01-19', time: '15:00', appointment_id: 1007 },
    { id: 8, patient_name: 'Iroda Nazarova', doctor_name: 'Dr. Gulnora Saidova', amount: 160000, method: 'cash', status: 'completed', date: '2024-01-18', time: '09:00', appointment_id: 1008 },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Yakunlangan';
      case 'pending': return 'Kutilmoqda';
      case 'failed': return 'Muvaffaqiyatsiz';
      case 'refunded': return 'Qaytarilgan';
      default: return status;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'payme': return '💳 Payme';
      case 'click': return '📱 Click';
      case 'cash': return '💵 Naqd';
      case 'card': return '💳 Karta';
      default: return method;
    }
  };

  const filteredPayments = payments.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (methodFilter !== 'all' && p.method !== methodFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!p.patient_name.toLowerCase().includes(query) && !p.doctor_name.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  const stats = {
    total: payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0),
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    today: payments.filter(p => p.date === '2024-01-20' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">To'lovlar</h1>
          <p className="text-gray-500 mt-1">Barcha to'lovlarni boshqaring</p>
        </div>
        <button className="mt-4 lg:mt-0 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          <Download className="h-5 w-5" />
          Hisobot yuklab olish
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-green-500" />
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{(stats.total / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-gray-500">Jami daromad</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{(stats.today / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-500">Bugun</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-500">Yakunlangan</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">Kutilmoqda</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {['all', 'completed', 'pending', 'failed', 'refunded'].map((status) => (
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

          <div className="flex gap-2">
            {['all', 'payme', 'click', 'cash', 'card'].map((method) => (
              <button
                key={method}
                onClick={() => setMethodFilter(method)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  methodFilter === method
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {method === 'all' ? 'Hammasi' : method.charAt(0).toUpperCase() + method.slice(1)}
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
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Bemor</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Shifokor</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Summa</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Usul</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">Sana</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-600">#{payment.id.toString().padStart(4, '0')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{payment.patient_name}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-700">{payment.doctor_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{payment.amount.toLocaleString()} so'm</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-700">{getMethodIcon(payment.method)}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div>
                      <p className="text-gray-900">{payment.date}</p>
                      <p className="text-sm text-gray-500">{payment.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">To'lovlar topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}