// src/pages/admin/AdminPayments.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, Search, Filter, Download, Eye,
  ChevronLeft, ChevronRight, Menu, Heart, X,
  LogOut, BarChart3, Users, UserCheck, Calendar,
  Hospital, Settings, CheckCircle, Clock, XCircle,
  TrendingUp, DollarSign
} from 'lucide-react';
import apiClient from '../../api/client';

interface Payment {
  id: string;
  user_email: string;
  user_name: string;
  amount: number;
  status: string;
  provider: string;
  payment_type: string;
  created_at: string;
  paid_at: string | null;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, revenue: 0 });

  useEffect(() => {
    fetchPayments();
  }, [currentPage, filter, search]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/payments/');
      setPayments(response.data.results || response.data);
    } catch (err) {
      // Demo data
      setPayments([
        { id: '1', user_email: 'ali@test.uz', user_name: 'Ali Valiyev', amount: 150000, status: 'completed', provider: 'payme', payment_type: 'appointment', created_at: '2024-01-20T10:30:00', paid_at: '2024-01-20T10:35:00' },
        { id: '2', user_email: 'madina@test.uz', user_name: 'Madina Karimova', amount: 200000, status: 'completed', provider: 'click', payment_type: 'appointment', created_at: '2024-01-20T09:15:00', paid_at: '2024-01-20T09:20:00' },
        { id: '3', user_email: 'bobur@test.uz', user_name: 'Bobur Alimov', amount: 150000, status: 'pending', provider: 'payme', payment_type: 'appointment', created_at: '2024-01-20T11:00:00', paid_at: null },
        { id: '4', user_email: 'nilufar@test.uz', user_name: 'Nilufar Saidova', amount: 180000, status: 'completed', provider: 'click', payment_type: 'consultation', created_at: '2024-01-19T14:30:00', paid_at: '2024-01-19T14:35:00' },
        { id: '5', user_email: 'sardor@test.uz', user_name: 'Sardor Rahimov', amount: 150000, status: 'failed', provider: 'payme', payment_type: 'appointment', created_at: '2024-01-19T16:00:00', paid_at: null },
      ]);
      setStats({ total: 5, completed: 3, pending: 1, revenue: 680000 });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Tolangan';
      case 'pending': return 'Kutilmoqda';
      case 'failed': return 'Xatolik';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', link: '/admin/dashboard' },
    { icon: Users, label: 'Foydalanuvchilar', link: '/admin/users' },
    { icon: UserCheck, label: 'Shifokorlar', link: '/admin/doctors' },
    { icon: Calendar, label: 'Qabullar', link: '/admin/appointments' },
    { icon: CreditCard, label: 'Tolovlar', link: '/admin/payments', active: true },
    { icon: Hospital, label: 'Kasalxonalar', link: '/admin/hospitals' },
    { icon: Settings, label: 'Sozlamalar', link: '/admin/settings' },
  ];

  const filteredPayments = payments.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.user_email.includes(search) && !p.user_name.toLowerCase().includes(search.toLowerCase())) return false;
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
                <h1 className="text-xl font-bold text-gray-900">Tolovlar</h1>
                <p className="text-sm text-gray-500">Barcha tolovlarni boshqarish</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
              <Download className="h-5 w-5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Jami tolovlar</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tolangan</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Kutilmoqda</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Daromad</p>
                  <p className="text-2xl font-bold text-gray-900">{(stats.revenue / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

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
              <div className="flex space-x-2">
                {['all', 'completed', 'pending', 'failed'].map((f) => (
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Foydalanuvchi</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Summa</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Provider</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Holat</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Sana</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{payment.user_name}</p>
                          <p className="text-sm text-gray-500">{payment.user_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {payment.amount.toLocaleString()} UZS
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${payment.provider === 'payme' ? 'bg-cyan-100 text-cyan-700' : 'bg-blue-100 text-blue-700'}`}>
                          {payment.provider === 'payme' ? 'Payme' : 'Click'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit space-x-1 ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span>{getStatusLabel(payment.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Eye className="h-4 w-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}