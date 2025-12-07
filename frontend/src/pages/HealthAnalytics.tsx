// src/pages/HealthAnalytics.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, TrendingDown, Activity, Calendar,
  Pill, DollarSign, Wind, Heart, ChevronRight,
  BarChart3, PieChart
} from 'lucide-react';
import apiClient from '../api/client';

interface HealthStats {
  summary: {
    total_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    total_spent: number;
    total_spent_display: string;
    doctors_visited: number;
    medicines_taken: number;
    adherence_rate: number;
  };
  health_score: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
    factors: Array<{ name: string; score: number; max: number }>;
  };
  appointments_by_specialty: Array<{ specialty: string; count: number }>;
  spending_by_category: Array<{ category: string; amount: number }>;
}

export default function HealthAnalytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get(`/api/accounts/analytics/health/?period=${period}`);
      setStats(res.data);
    } catch (error) {
      // Demo data
      setStats({
        summary: {
          total_appointments: 12,
          completed_appointments: 10,
          cancelled_appointments: 2,
          total_spent: 1850000,
          total_spent_display: "1,850,000 so'm",
          doctors_visited: 5,
          medicines_taken: 156,
          adherence_rate: 87,
        },
        health_score: {
          current: 78,
          previous: 72,
          change: 6,
          trend: 'up',
          factors: [
            { name: 'Dori rejimi', score: 85, max: 100 },
            { name: 'Qabullar', score: 90, max: 100 },
            { name: 'Faollik', score: 65, max: 100 },
            { name: 'Uyqu', score: 70, max: 100 },
          ]
        },
        appointments_by_specialty: [
          { specialty: 'Kardiolog', count: 4 },
          { specialty: 'Terapevt', count: 3 },
          { specialty: 'Nevrolog', count: 2 },
          { specialty: 'Dermatolog', count: 2 },
          { specialty: 'Umumiy', count: 1 },
        ],
        spending_by_category: [
          { category: 'Qabullar', amount: 1200000 },
          { category: 'Dorilar', amount: 450000 },
          { category: 'Tahlillar', amount: 200000 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalSpending = stats.spending_by_category.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center mb-4">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold">Sog'liq statistikasi</h1>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  period === p ? 'bg-white text-blue-600' : 'bg-white/20 text-white'
                }`}
              >
                {p === 'week' ? 'Hafta' : p === 'month' ? 'Oy' : 'Yil'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 -mt-2 space-y-4">
        {/* Health Score */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Sog'liq ballari</h3>
            <div className={`flex items-center ${stats.health_score.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {stats.health_score.trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              <span className="text-sm font-medium">+{stats.health_score.change}</span>
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                <circle
                  cx="64" cy="64" r="56"
                  stroke="#3b82f6" strokeWidth="12" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${stats.health_score.current * 3.52} 352`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{stats.health_score.current}</span>
                <span className="text-sm text-gray-500">/ 100</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {stats.health_score.factors.map((factor, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{factor.name}</span>
                  <span className="font-medium">{factor.score}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                {stats.summary.completed_appointments}/{stats.summary.total_appointments}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.summary.completed_appointments}</p>
            <p className="text-sm text-gray-500">Qabullar</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Pill className="h-5 w-5 text-purple-600" />
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                {stats.summary.adherence_rate}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.summary.medicines_taken}</p>
            <p className="text-sm text-gray-500">Dori ichildi</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.summary.doctors_visited}</p>
            <p className="text-sm text-gray-500">Shifokor</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{(stats.summary.total_spent / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-gray-500">Xarajatlar</p>
          </div>
        </div>

        {/* Appointments by Specialty */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Qabullar bo'yicha</h3>
          <div className="space-y-3">
            {stats.appointments_by_specialty.map((item, i) => {
              const maxCount = Math.max(...stats.appointments_by_specialty.map(a => a.count));
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.specialty}</span>
                    <span className="font-medium">{item.count} ta</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[i % colors.length]} rounded-full transition-all`}
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spending by Category */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Xarajatlar taqsimoti</h3>
          <div className="space-y-3">
            {stats.spending_by_category.map((item, i) => {
              const percentage = Math.round((item.amount / totalSpending) * 100);
              const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500'];
              return (
                <div key={i} className="flex items-center">
                  <div className={`w-3 h-3 ${colors[i % colors.length]} rounded-full mr-3`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.category}</span>
                      <span className="font-medium">{(item.amount / 1000).toFixed(0)}K ({percentage}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simple Pie visualization */}
          <div className="mt-4 flex justify-center">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                {stats.spending_by_category.reduce((acc, item, i) => {
                  const percentage = (item.amount / totalSpending) * 100;
                  const colors = ['#22c55e', '#3b82f6', '#a855f7'];
                  const prevPercentage = acc.offset;
                  acc.offset += percentage;
                  acc.elements.push(
                    <circle
                      key={i}
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke={colors[i % colors.length]}
                      strokeWidth="20"
                      strokeDasharray={`${percentage * 2.51} 251`}
                      strokeDashoffset={-prevPercentage * 2.51}
                    />
                  );
                  return acc;
                }, { offset: 0, elements: [] as React.ReactElement[] }).elements}
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => navigate('/appointments')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium">Qabullar grafigi</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          <div className="border-t" />
          <button
            onClick={() => navigate('/payments')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <PieChart className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium">To'lovlar tarixi</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </main>
    </div>
  );
}