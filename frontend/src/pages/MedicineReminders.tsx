// src/pages/MedicineReminders.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Pill, Clock, Calendar, Bell,
  Check, X, MoreVertical, Edit2, Trash2,
  ChevronRight, AlertCircle, Flame
} from 'lucide-react';
import apiClient from '../api/client';

interface Reminder {
  id: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  frequency_display: string;
  times: string[];
  start_date: string;
  end_date: string | null;
  status: 'active' | 'paused' | 'completed';
  with_food: boolean;
  before_food: boolean;
  notes: string;
  next_dose: string | null;
  taken_today: number;
  total_today: number;
  streak: number;
}

interface TodayDose {
  id: number;
  time: string;
  medicine_name: string;
  dosage: string;
  status: 'taken' | 'pending' | 'skipped';
  taken_at: string | null;
  with_food: boolean;
}

export default function MedicineReminders() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TodayDose[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, taken: 0, pending: 0, adherence_rate: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [remindersRes, todayRes] = await Promise.all([
        apiClient.get('/api/medicines/reminders/'),
        apiClient.get('/api/medicines/reminders/today/')
      ]);
      setReminders(remindersRes.data.reminders || []);
      setTodaySchedule(todayRes.data.schedule || []);
      setStats(todayRes.data.stats || {});
    } catch (error) {
      // Demo data
      setReminders([
        {
          id: 1,
          medicine_name: 'Lisinopril',
          dosage: '10mg - 1 tabletka',
          frequency: 'daily',
          frequency_display: 'Har kuni',
          times: ['08:00', '20:00'],
          start_date: '2024-01-01',
          end_date: '2024-03-01',
          status: 'active',
          with_food: true,
          before_food: false,
          notes: 'Qon bosimini nazorat qilish uchun',
          next_dose: '20:00',
          taken_today: 1,
          total_today: 2,
          streak: 15,
        },
        {
          id: 2,
          medicine_name: 'Vitamin D3',
          dosage: '1000 IU',
          frequency: 'daily',
          frequency_display: 'Har kuni',
          times: ['09:00'],
          start_date: '2024-01-01',
          end_date: null,
          status: 'active',
          with_food: true,
          before_food: false,
          notes: '',
          next_dose: 'Ertaga 09:00',
          taken_today: 1,
          total_today: 1,
          streak: 30,
        },
      ]);
      setTodaySchedule([
        { id: 1, time: '08:00', medicine_name: 'Lisinopril', dosage: '10mg', status: 'taken', taken_at: '08:05', with_food: true },
        { id: 2, time: '09:00', medicine_name: 'Vitamin D3', dosage: '1000 IU', status: 'taken', taken_at: '09:00', with_food: true },
        { id: 3, time: '20:00', medicine_name: 'Lisinopril', dosage: '10mg', status: 'pending', taken_at: null, with_food: true },
      ]);
      setStats({ total: 3, taken: 2, pending: 1, adherence_rate: 85 });
    } finally {
      setLoading(false);
    }
  };

  const markAsTaken = async (doseId: number) => {
    try {
      await apiClient.post(`/api/medicines/reminders/${doseId}/log/`, { action: 'taken' });
      setTodaySchedule(prev => prev.map(d =>
        d.id === doseId ? { ...d, status: 'taken', taken_at: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) } : d
      ));
      setStats(prev => ({ ...prev, taken: prev.taken + 1, pending: prev.pending - 1 }));
    } catch (error) {
      // Demo update
      setTodaySchedule(prev => prev.map(d =>
        d.id === doseId ? { ...d, status: 'taken', taken_at: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) } : d
      ));
    }
  };

  const skipDose = async (doseId: number) => {
    setTodaySchedule(prev => prev.map(d =>
      d.id === doseId ? { ...d, status: 'skipped' } : d
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center mb-4">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold">Dori eslatmalari</h1>
          </div>

          {/* Stats */}
          <div className="bg-white/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80">Bugungi rioya</span>
              <span className="text-2xl font-bold">{stats.adherence_rate}%</span>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span>{stats.taken} ichildi</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                <span>{stats.pending} kutilmoqda</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 -mt-2">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-1 flex mb-4">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'today' ? 'bg-purple-600 text-white' : 'text-gray-600'
            }`}
          >
            Bugun
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'all' ? 'bg-purple-600 text-white' : 'text-gray-600'
            }`}
          >
            Barcha dorilar
          </button>
        </div>

        {activeTab === 'today' ? (
          /* Today's Schedule */
          <div className="space-y-3">
            {todaySchedule.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Bugun dori yo'q</h3>
                <p className="text-gray-500 mt-1">Yangi eslatma qo'shing</p>
              </div>
            ) : (
              todaySchedule.map(dose => (
                <div
                  key={dose.id}
                  className={`bg-white rounded-2xl p-4 shadow-sm ${
                    dose.status === 'taken' ? 'border-l-4 border-green-500' :
                    dose.status === 'skipped' ? 'border-l-4 border-red-500 opacity-60' :
                    'border-l-4 border-yellow-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-3 ${
                        dose.status === 'taken' ? 'bg-green-100' :
                        dose.status === 'skipped' ? 'bg-red-100' :
                        'bg-yellow-100'
                      }`}>
                        <Pill className={`h-6 w-6 ${
                          dose.status === 'taken' ? 'text-green-600' :
                          dose.status === 'skipped' ? 'text-red-600' :
                          'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{dose.medicine_name}</h4>
                        <p className="text-sm text-gray-500">{dose.dosage}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{dose.time}</span>
                          {dose.with_food && <span className="ml-2">🍽️ Ovqat bilan</span>}
                        </div>
                      </div>
                    </div>

                    {dose.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => skipDose(dose.id)}
                          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          <X className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => markAsTaken(dose.id)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      </div>
                    ) : dose.status === 'taken' ? (
                      <div className="text-right">
                        <span className="text-green-600 text-sm font-medium">✓ Ichildi</span>
                        <p className="text-xs text-gray-400">{dose.taken_at}</p>
                      </div>
                    ) : (
                      <span className="text-red-500 text-sm">O'tkazildi</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* All Reminders */
          <div className="space-y-3">
            {reminders.map(reminder => (
              <div key={reminder.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                      <Pill className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{reminder.medicine_name}</h4>
                      <p className="text-sm text-gray-500">{reminder.dosage}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="flex items-center text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {reminder.times.join(', ')}
                        </span>
                        <span className="flex items-center text-orange-500">
                          <Flame className="h-3 w-3 mr-1" />
                          {reminder.streak} kun
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reminder.status === 'active' ? 'bg-green-100 text-green-700' :
                    reminder.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {reminder.status === 'active' ? 'Faol' :
                     reminder.status === 'paused' ? 'To\'xtatilgan' : 'Yakunlangan'}
                  </span>
                </div>

                {reminder.next_dose && reminder.status === 'active' && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Keyingi doza:</span>
                    <span className="text-sm font-medium text-purple-600">{reminder.next_dose}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add Modal */}
      {showAddModal && (
        <AddReminderModal
          onClose={() => setShowAddModal(false)}
          onAdd={() => { setShowAddModal(false); fetchData(); }}
        />
      )}
    </div>
  );
}

function AddReminderModal({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const [formData, setFormData] = useState({
    medicine_name: '',
    dosage: '',
    frequency: 'daily',
    times: ['08:00'],
    with_food: false,
    notes: '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!formData.medicine_name || !formData.dosage) {
      alert("Dori nomi va dozasini kiriting");
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/api/medicines/reminders/', {
        ...formData,
        start_date: new Date().toISOString().split('T')[0],
      });
      onAdd();
    } catch (error) {
      console.error('Error adding reminder:', error);
      // Demo mode - still close modal
      onAdd();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-96 sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-900">Yangi eslatma</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dori nomi</label>
            <input
              type="text"
              value={formData.medicine_name}
              onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl"
              placeholder="Masalan: Lisinopril"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dozasi</label>
            <input
              type="text"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl"
              placeholder="Masalan: 10mg - 1 tabletka"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chastotasi</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl bg-white"
            >
              <option value="daily">Har kuni</option>
              <option value="twice_daily">Kuniga 2 marta</option>
              <option value="three_times">Kuniga 3 marta</option>
              <option value="weekly">Haftada bir</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-700">Ovqat bilan</span>
            <button
              onClick={() => setFormData({ ...formData, with_food: !formData.with_food })}
              className={`w-12 h-6 rounded-full transition ${formData.with_food ? 'bg-purple-600' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.with_food ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}