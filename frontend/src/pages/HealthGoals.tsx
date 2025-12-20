// src/pages/HealthGoals.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Target, Plus, TrendingUp, TrendingDown,
  Scale, Footprints, Droplets, Moon, Apple, Dumbbell,
  Calendar, CheckCircle, Circle, Loader2, Edit2, Trash2, X
} from 'lucide-react';
import api from '../services/api';

interface Goal {
  id: string;
  type: 'weight' | 'steps' | 'water' | 'sleep' | 'calories' | 'exercise';
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  end_date: string;
  progress: number;
  daily_logs: { date: string; value: number }[];
}

const goalTypes = [
  { type: 'weight', name: 'Vazn', icon: Scale, color: 'text-blue-600', bg: 'bg-blue-100', unit: 'kg' },
  { type: 'steps', name: 'Qadamlar', icon: Footprints, color: 'text-green-600', bg: 'bg-green-100', unit: 'qadam' },
  { type: 'water', name: 'Suv', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-100', unit: 'L' },
  { type: 'sleep', name: 'Uyqu', icon: Moon, color: 'text-purple-600', bg: 'bg-purple-100', unit: 'soat' },
  { type: 'calories', name: 'Kaloriya', icon: Apple, color: 'text-orange-600', bg: 'bg-orange-100', unit: 'kkal' },
  { type: 'exercise', name: 'Mashq', icon: Dumbbell, color: 'text-red-600', bg: 'bg-red-100', unit: 'min' },
];

export default function HealthGoals() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    type: 'weight' as const,
    target_value: 0,
    end_date: '',
  });
  const [logValue, setLogValue] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await api.get('/health-goals/');
      setGoals(response.data.results || []);
    } catch (error) {
      console.error('Error loading goals:', error);
      // Demo data
      setGoals([
        {
          id: '1',
          type: 'weight',
          title: 'Vazn kamaytirish',
          target_value: 75,
          current_value: 82,
          unit: 'kg',
          start_date: '2024-11-01',
          end_date: '2025-02-01',
          progress: 30,
          daily_logs: [
            { date: '2024-12-10', value: 82 },
            { date: '2024-12-09', value: 82.5 },
            { date: '2024-12-08', value: 83 },
          ]
        },
        {
          id: '2',
          type: 'steps',
          title: 'Kunlik qadamlar',
          target_value: 10000,
          current_value: 7500,
          unit: 'qadam',
          start_date: '2024-12-01',
          end_date: '2024-12-31',
          progress: 75,
          daily_logs: [
            { date: '2024-12-10', value: 7500 },
            { date: '2024-12-09', value: 8200 },
            { date: '2024-12-08', value: 6800 },
          ]
        },
        {
          id: '3',
          type: 'water',
          title: 'Suv ichish',
          target_value: 2.5,
          current_value: 2,
          unit: 'L',
          start_date: '2024-12-01',
          end_date: '2024-12-31',
          progress: 80,
          daily_logs: [
            { date: '2024-12-10', value: 2 },
            { date: '2024-12-09', value: 2.2 },
          ]
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.target_value || !newGoal.end_date) {
      alert('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    const goalTypeInfo = goalTypes.find(g => g.type === newGoal.type);

    try {
      const response = await api.post('/health-goals/', {
        type: newGoal.type,
        title: `${goalTypeInfo?.name} maqsadi`,
        target_value: newGoal.target_value,
        end_date: newGoal.end_date,
      });
      setGoals(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error adding goal:', error);
      // Demo
      const newGoalData: Goal = {
        id: Date.now().toString(),
        type: newGoal.type,
        title: `${goalTypeInfo?.name} maqsadi`,
        target_value: newGoal.target_value,
        current_value: 0,
        unit: goalTypeInfo?.unit || '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: newGoal.end_date,
        progress: 0,
        daily_logs: [],
      };
      setGoals(prev => [...prev, newGoalData]);
    }

    setShowAddModal(false);
    setNewGoal({ type: 'weight', target_value: 0, end_date: '' });
  };

  const addLog = async () => {
    if (!selectedGoal || !logValue) return;

    try {
      await api.post(`/health-goals/${selectedGoal.id}/log/`, {
        value: parseFloat(logValue),
        date: new Date().toISOString().split('T')[0],
      });
      await loadGoals();
    } catch (error) {
      console.error('Error adding log:', error);
      // Demo update
      setGoals(prev => prev.map(g => {
        if (g.id === selectedGoal.id) {
          return {
            ...g,
            current_value: parseFloat(logValue),
            daily_logs: [{ date: new Date().toISOString().split('T')[0], value: parseFloat(logValue) }, ...g.daily_logs],
          };
        }
        return g;
      }));
    }

    setShowLogModal(false);
    setSelectedGoal(null);
    setLogValue('');
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Maqsadni o\'chirmoqchimisiz?')) return;

    try {
      await api.delete(`/health-goals/${goalId}/`);
      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
      setGoals(prev => prev.filter(g => g.id !== goalId));
    }
  };

  const getGoalTypeInfo = (type: string) => {
    return goalTypes.find(g => g.type === type) || goalTypes[0];
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Sog'liq maqsadlari</h1>
              <p className="text-xs text-gray-500">Maqsadlaringizni kuzating</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4 mr-1" />
            Yangi
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Umumiy statistika */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">{goals.length}</p>
            <p className="text-xs text-gray-500">Maqsadlar</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">{goals.filter(g => g.progress >= 100).length}</p>
            <p className="text-xs text-gray-500">Bajarildi</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / (goals.length || 1))}%
            </p>
            <p className="text-xs text-gray-500">O'rtacha</p>
          </div>
        </div>

        {/* Maqsadlar ro'yxati */}
        {goals.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Maqsadlar yo'q</h3>
            <p className="text-gray-500 mb-4">Sog'liq maqsadingizni belgilang</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Maqsad qo'shish
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const typeInfo = getGoalTypeInfo(goal.type);
              const Icon = typeInfo.icon;

              return (
                <div key={goal.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${typeInfo.bg} rounded-xl flex items-center justify-center mr-3`}>
                        <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{goal.title}</p>
                        <p className="text-sm text-gray-500">
                          {goal.current_value} / {goal.target_value} {goal.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setSelectedGoal(goal);
                          setShowLogModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Yozuv qo'shish"
                      >
                        <Plus className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="O'chirish"
                      >
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(goal.progress)} transition-all`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* So'nggi yozuvlar */}
                  {goal.daily_logs.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                      <span className="text-xs text-gray-500">So'nggi:</span>
                      {goal.daily_logs.slice(0, 3).map((log, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                        >
                          {log.value} {goal.unit}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Muddat */}
                  <div className="flex items-center text-xs text-gray-400 mt-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{goal.start_date} - {goal.end_date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Motivatsiya */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 text-white">
          <p className="font-medium">Kunlik maslahat</p>
          <p className="text-sm opacity-90 mt-1">
            Kichik maqsadlardan boshlang. Har kuni 1% yaxshilanish - yil oxirida 37 baravar o'sish!
          </p>
        </div>
      </main>

      {/* Maqsad qo'shish modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Yangi maqsad</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Maqsad turi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maqsad turi</label>
                <div className="grid grid-cols-3 gap-2">
                  {goalTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.type}
                        onClick={() => setNewGoal(prev => ({ ...prev, type: type.type as any }))}
                        className={`p-3 rounded-xl border-2 transition-colors ${
                          newGoal.type === type.type
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mx-auto ${type.color}`} />
                        <p className="text-xs mt-1 text-gray-600">{type.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Maqsad qiymati */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maqsad ({goalTypes.find(g => g.type === newGoal.type)?.unit})
                </label>
                <input
                  type="number"
                  value={newGoal.target_value || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target_value: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Maqsad qiymatini kiriting"
                />
              </div>

              {/* Tugash sanasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tugash sanasi</label>
                <input
                  type="date"
                  value={newGoal.end_date}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 border rounded-xl hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={addGoal}
                className="flex-1 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
              >
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yozuv qo'shish modal */}
      {showLogModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bugungi natija</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {selectedGoal.title} ({selectedGoal.unit})
              </label>
              <input
                type="number"
                value={logValue}
                onChange={(e) => setLogValue(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
                placeholder={`Masalan: ${selectedGoal.target_value}`}
                autoFocus
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowLogModal(false);
                  setSelectedGoal(null);
                  setLogValue('');
                }}
                className="flex-1 py-2 border rounded-xl hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={addLog}
                className="flex-1 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
