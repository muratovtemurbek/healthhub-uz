// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, Calendar, CreditCard,
  TrendingUp, TrendingDown, Activity, Heart,
  Settings, LogOut, Bell, Menu, X,
  DollarSign, Hospital, Pill, ChevronRight,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import apiClient from '../../api/client';

interface Stats {
  total_users: number;
  total_doctors: number;
  total_appointments: number;
  total_payments: number;
  total_revenue: number;
  pending_appointments: number;
  today_appointments: number;
  monthly_revenue: number;
  users_growth: number;
  revenue_growth: number;
}

interface RecentUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  created_at: string;
}

interface RecentPayment {
  id: string;
  user_email: string;
  amount: number;
  status: string;
  provider: string;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_doctors: 0,
    total_appointments: 0,
    total_payments: 0,
    total_revenue: 0,
    pending_appointments: 0,
    today_appointments: 0,
    monthly_revenue: 0,
    users_growth: 0,
    revenue_growth: 0
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Stats
      try {
        const statsRes = await apiClient.get('/api/admin/stats/');
        setStats(statsRes.data);
      } catch (e) {
        // Demo data
        setStats({
          total_users: 1250,
          total_doctors: 48,
          total_appointments: 3420,
          total_payments: 2890,
          total_revenue: 458000000,
          pending_appointments: 24,
          today_appointments: 18,
          monthly_revenue: 85000000,
          users_growth: 12.5,
          revenue_growth: 8.3
        });
      }

      // Recent users
      try {
        const usersRes = await apiClient.get('/api/admin/users/?limit=5');
        setRecentUsers(usersRes.data.results || usersRes.data);
      } catch (e) {
        setRecentUsers([
          { id: '1', email: 'ali@test.uz', first_name: 'Ali', last_name: 'Valiyev', user_type: 'patient', created_at: new Date().toISOString() },
          { id: '2', email: 'madina@test.uz', first_name: 'Madina', last_name: 'Karimova', user_type: 'patient', created_at: new Date().toISOString() },
          { id: '3', email: 'jasur@test.uz', first_name: 'Jasur', last_name: 'Toshmatov', user_type: 'doctor', created_at: new Date().toISOString() },
        ]);
      }

      // Recent payments
      try {
        const paymentsRes = await apiClient.get('/api/admin/payments/?limit=5');
        setRecentPayments(paymentsRes.data.results || paymentsRes.data);
      } catch (e) {
        setRecentPayments([
          { id: '1', user_email: 'ali@test.uz', amount: 150000, status: 'completed', provider: 'payme', created_at: new Date().toISOString() },
          { id: '2', user_email: 'madina@test.uz', amount: 200000, status: 'completed', provider: 'click', created_at: new Date().toISOString() },
          { id: '3', user_email: 'bobur@test.uz', amount: 150000, status: 'pending', provider: 'payme', created_at: new Date().toISOString() },
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

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} mlrd`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} mln`;
    }
    return amount.toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', link: '/admin/dashboard', active: true },
    { icon: Users, label: 'Foydalanuvchilar', link: '/admin/users' },
    { icon: UserCheck, label: 'Shifokorlar', link: '/admin/doctors' },
    { icon: Calendar, label: 'Qabullar', link: '/admin/appointments' },
    { icon: CreditCard, label: 'Tolovlar', link: '/admin/payments' },
    { icon: Hospital, label: 'Kasalxonalar', link: '/admin/hospitals' },
    { icon: Settings, label: 'Sozlamalar', link: '/admin/settings' },
  ];

  const statCards = [
    {
      title: 'Jami foydalanuvchilar',
      value: stats.total_users,
      icon: Users,
      color: 'bg-blue-500',
      growth: stats.users_growth,
      link: '/admin/users'
    },
    {
      title: 'Shifokorlar',
      value: stats.total_doctors,
      icon: UserCheck,
      color: 'bg-green-500',
      link: '/admin/doctors'
    },
    {
      title: 'Jami qabullar',
      value: stats.total_appointments,
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/admin/appointments'
    },
    {
      title: 'Oylik daromad',
      value: stats.monthly_revenue,
      icon: DollarSign,
      color: 'bg-orange-500',
      isCurrency: true,
      growth: stats.revenue_growth,
      link: '/admin/payments'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
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
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>

        {/* Menu */}
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item, idx) => (
              <li key={idx}>
                <Link
                  to={item.link}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    item.active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
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
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Umumiy statistika</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="h-6 w-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">A</span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, idx) => (
              <Link
                key={idx}
                to={card.link}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {card.isCurrency ? formatCurrency(card.value) : card.value.toLocaleString()}
                      {card.isCurrency && <span className="text-sm font-normal text-gray-500"> UZS</span>}
                    </p>
                    {card.growth !== undefined && (
                      <div className={`flex items-center mt-2 text-sm ${card.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {card.growth >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                        <span>{Math.abs(card.growth)}% oylik</span>
                      </div>
                    )}
                  </div>
                  <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Bugungi qabullar</p>
                  <p className="text-3xl font-bold mt-1">{stats.today_appointments}</p>
                </div>
                <Calendar className="h-10 w-10 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Kutilayotgan</p>
                  <p className="text-3xl font-bold mt-1">{stats.pending_appointments}</p>
                </div>
                <Activity className="h-10 w-10 text-orange-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Jami daromad</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(stats.total_revenue)}</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-200" />
              </div>
            </div>
          </div>

          {/* Tables */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Yangi foydalanuvchilar</h2>
                  <Link to="/admin/users" className="text-blue-600 text-sm hover:underline flex items-center">
                    Barchasi <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentUsers.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {user.first_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.user_type === 'doctor' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.user_type === 'doctor' ? 'Shifokor' : 'Bemor'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Oxirgi tolovlar</h2>
                  <Link to="/admin/payments" className="text-blue-600 text-sm hover:underline flex items-center">
                    Barchasi <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.provider === 'payme' ? 'bg-cyan-100' : 'bg-blue-100'
                      }`}>
                        <CreditCard className={`h-5 w-5 ${
                          payment.provider === 'payme' ? 'text-cyan-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{payment.amount.toLocaleString()} UZS</p>
                        <p className="text-sm text-gray-500">{payment.user_email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payment.status === 'completed' ? 'Tolangan' : 'Kutilmoqda'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}