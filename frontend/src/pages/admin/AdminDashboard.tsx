// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCog, Calendar, CreditCard, TrendingUp,
  TrendingDown, Activity, DollarSign, Clock, CheckCircle,
  XCircle, AlertCircle, ChevronRight, BarChart3, PieChart, Loader2
} from 'lucide-react';
import api from '../../services/api';

interface Stats {
  total_patients: number;
  total_doctors: number;
  active_doctors: number;
  total_appointments: number;
  today_appointments: number;
  today_pending: number;
  today_completed: number;
  today_cancelled: number;
  week_appointments: number;
  month_appointments: number;
  total_revenue: number;
  month_revenue: number;
  today_revenue: number;
  new_patients_month: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'payment' | 'registration' | 'cancellation';
  title: string;
  description: string;
  time: string;
  status: string;
}

interface TopDoctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string | null;
  patients: number;
  appointments: number;
  rating: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [topDoctors, setTopDoctors] = useState<TopDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Xayrli tong');
    else if (hour < 18) setGreeting('Xayrli kun');
    else setGreeting('Xayrli kech');
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, activityRes, doctorsRes] = await Promise.all([
          api.get('/admin-panel/dashboard/stats/'),
          api.get('/admin-panel/dashboard/activity/'),
          api.get('/admin-panel/dashboard/top-doctors/')
        ]);
        setStats(statsRes.data);
        setRecentActivities(activityRes.data);
        setTopDoctors(doctorsRes.data);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'payment': return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'registration': return <Users className="h-5 w-5 text-purple-500" />;
      case 'cancellation': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} mlrd`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} mln`;
    }
    return amount.toLocaleString();
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
      <div className="mb-6 lg:mb-8">
        <p className="text-gray-500">{greeting}, Admin!</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        {/* Patients */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +{stats?.new_patients_month || 0}
            </div>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{(stats?.total_patients || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500">Jami bemorlar</p>
        </div>

        {/* Doctors */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <UserCog className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <Activity className="h-4 w-4 mr-1" />
              {stats?.active_doctors || 0} faol
            </div>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats?.total_doctors || 0}</p>
          <p className="text-sm text-gray-500">Shifokorlar</p>
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Bugun: {stats?.today_appointments || 0}</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{(stats?.total_appointments || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500">Jami qabullar</p>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">Bugun: {formatCurrency(stats?.today_revenue || 0)}</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{formatCurrency(stats?.month_revenue || 0)}</p>
          <p className="text-sm text-gray-500">Oylik daromad</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Overview */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Bugungi ko'rsatkichlar</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats?.today_appointments || 0}</p>
                <p className="text-sm text-gray-500">Jami qabullar</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats?.today_pending || 0}</p>
                <p className="text-sm text-gray-500">Kutilmoqda</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats?.today_completed || 0}</p>
                <p className="text-sm text-gray-500">Yakunlangan</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats?.today_cancelled || 0}</p>
                <p className="text-sm text-gray-500">Bekor qilingan</p>
              </div>
            </div>
          </div>

          {/* Top Doctors */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Top shifokorlar</h2>
              <Link to="/admin/doctors" className="text-blue-600 text-sm font-medium flex items-center">
                Barchasi <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {topDoctors.length > 0 ? topDoctors.slice(0, 5).map((doctor, index) => (
                <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    {doctor.avatar ? (
                      <img src={doctor.avatar} alt={doctor.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold">{index + 1}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{doctor.name}</p>
                      <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{doctor.patients} bemor</p>
                    <p className="text-sm text-yellow-600">⭐ {doctor.rating.toFixed(1)}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <UserCog className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Shifokorlar mavjud emas</p>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Chart Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Daromad statistikasi</h2>
              <select className="px-3 py-1 border border-gray-200 rounded-lg text-sm">
                <option>Oxirgi 7 kun</option>
                <option>Oxirgi 30 kun</option>
                <option>Oxirgi 3 oy</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Grafik tez orada qo'shiladi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Tezkor harakatlar</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/doctors"
                className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition"
              >
                <UserCog className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm text-gray-700 text-center">Shifokorlar</span>
              </Link>
              <Link
                to="/admin/patients"
                className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
              >
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm text-gray-700 text-center">Bemorlar</span>
              </Link>
              <Link
                to="/admin/appointments"
                className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition"
              >
                <Calendar className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm text-gray-700 text-center">Qabullar</span>
              </Link>
              <Link
                to="/admin/payments"
                className="flex flex-col items-center p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition"
              >
                <CreditCard className="h-8 w-8 text-yellow-600 mb-2" />
                <span className="text-sm text-gray-700 text-center">To'lovlar</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">So'nggi faoliyat</h2>
            <div className="space-y-4">
              {recentActivities.length > 0 ? recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Faoliyat mavjud emas</p>
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <h2 className="font-bold mb-4">Tizim holati</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-green-100">Server</span>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></span>
                  <span className="font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-100">Database</span>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></span>
                  <span className="font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-100">API</span>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></span>
                  <span className="font-medium">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}