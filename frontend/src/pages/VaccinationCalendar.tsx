// src/pages/VaccinationCalendar.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Syringe, Calendar, CheckCircle, Clock,
  AlertTriangle, Plus, User, Baby, Loader2, Info, Bell
} from 'lucide-react';
import api from '../services/api';

interface Child {
  id: string;
  name: string;
  birth_date: string;
  gender: 'male' | 'female';
}

interface Vaccination {
  id: string;
  name: string;
  description: string;
  recommended_age: string;
  dose_number: number;
  total_doses: number;
  status: 'completed' | 'upcoming' | 'overdue' | 'scheduled';
  scheduled_date?: string;
  completed_date?: string;
  hospital?: string;
  notes?: string;
}

const vaccineSchedule = [
  { name: 'BCG', age: '0-1 kun', description: 'Sil kasalligiga qarshi' },
  { name: 'Gepatit B (1)', age: '0-1 kun', description: 'Gepatit B virusiga qarshi, 1-doza' },
  { name: 'Gepatit B (2)', age: '1 oy', description: 'Gepatit B virusiga qarshi, 2-doza' },
  { name: 'DTP (1)', age: '2 oy', description: 'Difteriya, qoqshol, ko\'kyo\'tal, 1-doza' },
  { name: 'Polio (1)', age: '2 oy', description: 'Poliomielitga qarshi, 1-doza' },
  { name: 'Hib (1)', age: '2 oy', description: 'Gemofilyus infeksiyasiga qarshi, 1-doza' },
  { name: 'PCV (1)', age: '2 oy', description: 'Pnevmokokkga qarshi, 1-doza' },
  { name: 'DTP (2)', age: '3 oy', description: 'Difteriya, qoqshol, ko\'kyo\'tal, 2-doza' },
  { name: 'Polio (2)', age: '3 oy', description: 'Poliomielitga qarshi, 2-doza' },
  { name: 'Hib (2)', age: '3 oy', description: 'Gemofilyus infeksiyasiga qarshi, 2-doza' },
  { name: 'DTP (3)', age: '4 oy', description: 'Difteriya, qoqshol, ko\'kyo\'tal, 3-doza' },
  { name: 'Polio (3)', age: '4 oy', description: 'Poliomielitga qarshi, 3-doza' },
  { name: 'Hib (3)', age: '4 oy', description: 'Gemofilyus infeksiyasiga qarshi, 3-doza' },
  { name: 'PCV (2)', age: '4 oy', description: 'Pnevmokokkga qarshi, 2-doza' },
  { name: 'Gepatit B (3)', age: '6 oy', description: 'Gepatit B virusiga qarshi, 3-doza' },
  { name: 'MMR (1)', age: '12 oy', description: 'Qizamiq, qizilcha, parotit, 1-doza' },
  { name: 'PCV (3)', age: '12 oy', description: 'Pnevmokokkga qarshi, 3-doza' },
  { name: 'DTP (4)', age: '18 oy', description: 'Difteriya, qoqshol, ko\'kyo\'tal, 4-doza' },
  { name: 'Polio (4)', age: '18 oy', description: 'Poliomielitga qarshi, 4-doza' },
  { name: 'MMR (2)', age: '6 yosh', description: 'Qizamiq, qizilcha, parotit, 2-doza' },
];

export default function VaccinationCalendar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [newChild, setNewChild] = useState({ name: '', birth_date: '', gender: 'male' as 'male' | 'female' });

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadVaccinations(selectedChild.id);
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    try {
      const response = await api.get('/vaccinations/children/');
      setChildren(response.data.results || []);
      if (response.data.results?.length > 0) {
        setSelectedChild(response.data.results[0]);
      }
    } catch (error) {
      console.error('Error loading children:', error);
      // Demo data
      const demoChildren = [
        { id: '1', name: 'Alisher', birth_date: '2023-03-15', gender: 'male' as 'male' | 'female' },
        { id: '2', name: 'Malika', birth_date: '2024-01-20', gender: 'female' as const },
      ];
      setChildren(demoChildren);
      setSelectedChild(demoChildren[0]);
    } finally {
      setLoading(false);
    }
  };

  const loadVaccinations = async (childId: string) => {
    try {
      const response = await api.get(`/vaccinations/children/${childId}/vaccinations/`);
      setVaccinations(response.data.results || []);
    } catch (error) {
      console.error('Error loading vaccinations:', error);
      // Demo data
      setVaccinations([
        { id: '1', name: 'BCG', description: 'Sil kasalligiga qarshi', recommended_age: '0-1 kun', dose_number: 1, total_doses: 1, status: 'completed', completed_date: '2023-03-15', hospital: 'Toshkent shahar poliklinikasi' },
        { id: '2', name: 'Gepatit B', description: 'Gepatit B virusiga qarshi', recommended_age: '0-1 kun', dose_number: 1, total_doses: 3, status: 'completed', completed_date: '2023-03-15' },
        { id: '3', name: 'Gepatit B', description: 'Gepatit B virusiga qarshi', recommended_age: '1 oy', dose_number: 2, total_doses: 3, status: 'completed', completed_date: '2023-04-15' },
        { id: '4', name: 'DTP', description: 'Difteriya, qoqshol, ko\'kyo\'tal', recommended_age: '2 oy', dose_number: 1, total_doses: 4, status: 'completed', completed_date: '2023-05-15' },
        { id: '5', name: 'DTP', description: 'Difteriya, qoqshol, ko\'kyo\'tal', recommended_age: '3 oy', dose_number: 2, total_doses: 4, status: 'upcoming', scheduled_date: '2024-12-20' },
        { id: '6', name: 'Polio', description: 'Poliomielitga qarshi', recommended_age: '3 oy', dose_number: 2, total_doses: 4, status: 'scheduled', scheduled_date: '2024-12-20' },
      ]);
    }
  };

  const addChild = async () => {
    if (!newChild.name || !newChild.birth_date) {
      alert('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    try {
      const response = await api.post('/vaccinations/children/', newChild);
      setChildren(prev => [...prev, response.data]);
      setSelectedChild(response.data);
      setShowAddChild(false);
      setNewChild({ name: '', birth_date: '', gender: 'male' });
    } catch (error) {
      console.error('Error adding child:', error);
      // Demo
      const newChildData = { ...newChild, id: Date.now().toString() };
      setChildren(prev => [...prev, newChildData]);
      setSelectedChild(newChildData);
      setShowAddChild(false);
      setNewChild({ name: '', birth_date: '', gender: 'male' });
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600', text: 'Bajarildi' };
      case 'upcoming':
        return { icon: Clock, bg: 'bg-blue-100', color: 'text-blue-600', text: 'Yaqinlashmoqda' };
      case 'overdue':
        return { icon: AlertTriangle, bg: 'bg-red-100', color: 'text-red-600', text: 'Muddati o\'tgan' };
      case 'scheduled':
        return { icon: Calendar, bg: 'bg-purple-100', color: 'text-purple-600', text: 'Rejalashtirilgan' };
      default:
        return { icon: Clock, bg: 'bg-gray-100', color: 'text-gray-600', text: 'Kutilmoqda' };
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 12) return `${months} oy`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years} yosh ${remainingMonths} oy` : `${years} yosh`;
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
              <h1 className="text-lg font-bold text-gray-900">Emlash kalendari</h1>
              <p className="text-xs text-gray-500">Bolalar uchun emlash jadvali</p>
            </div>
          </div>
          <button
            onClick={() => setShowSchedule(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Emlash jadvali"
          >
            <Info className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Bolalar ro'yxati */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Bolalar</h2>
            <button
              onClick={() => setShowAddChild(true)}
              className="flex items-center text-sm text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Qo'shish
            </button>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-4">
              <Baby className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Bolalar qo'shilmagan</p>
            </div>
          ) : (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`flex-shrink-0 p-3 rounded-xl border-2 transition-colors ${
                    selectedChild?.id === child.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    child.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'
                  }`}>
                    <Baby className={`h-5 w-5 ${child.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`} />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{child.name}</p>
                  <p className="text-xs text-gray-500">{calculateAge(child.birth_date)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Statistika */}
        {selectedChild && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{vaccinations.filter(v => v.status === 'completed').length}</p>
              <p className="text-xs text-gray-500">Bajarildi</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{vaccinations.filter(v => v.status === 'upcoming' || v.status === 'scheduled').length}</p>
              <p className="text-xs text-gray-500">Kutilmoqda</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{vaccinations.filter(v => v.status === 'overdue').length}</p>
              <p className="text-xs text-gray-500">Kechikkan</p>
            </div>
          </div>
        )}

        {/* Emlash ro'yxati */}
        {selectedChild && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Emlashlar</h2>
              <button className="p-1 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="divide-y">
              {vaccinations.map((vaccination) => {
                const statusInfo = getStatusInfo(vaccination.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div key={vaccination.id} className="p-4">
                    <div className="flex items-start">
                      <div className={`w-10 h-10 ${statusInfo.bg} rounded-xl flex items-center justify-center mr-3 flex-shrink-0`}>
                        <Syringe className={`h-5 w-5 ${statusInfo.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {vaccination.name}
                              {vaccination.total_doses > 1 && (
                                <span className="text-gray-500 text-sm ml-1">
                                  ({vaccination.dose_number}/{vaccination.total_doses})
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">{vaccination.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>

                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {vaccination.status === 'completed' ? (
                            <span>Bajarildi: {vaccination.completed_date}</span>
                          ) : vaccination.scheduled_date ? (
                            <span>Rejalashtirilgan: {vaccination.scheduled_date}</span>
                          ) : (
                            <span>Tavsiya etilgan yosh: {vaccination.recommended_age}</span>
                          )}
                        </div>

                        {vaccination.hospital && (
                          <p className="text-xs text-gray-400 mt-1">{vaccination.hospital}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Bola qo'shish modal */}
      {showAddChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bola qo'shish</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ismi</label>
                <input
                  type="text"
                  value={newChild.name}
                  onChange={(e) => setNewChild(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Bolaning ismi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tug'ilgan sanasi</label>
                <input
                  type="date"
                  value={newChild.birth_date}
                  onChange={(e) => setNewChild(prev => ({ ...prev, birth_date: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jinsi</label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setNewChild(prev => ({ ...prev, gender: 'male' }))}
                    className={`flex-1 py-2 rounded-xl border-2 ${
                      newChild.gender === 'male' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-blue-600">O'g'il bola</span>
                  </button>
                  <button
                    onClick={() => setNewChild(prev => ({ ...prev, gender: 'female' }))}
                    className={`flex-1 py-2 rounded-xl border-2 ${
                      newChild.gender === 'female' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-pink-600">Qiz bola</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddChild(false)}
                className="flex-1 py-2 border rounded-xl hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={addChild}
                className="flex-1 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
              >
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emlash jadvali modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Emlash jadvali</h3>
              <button
                onClick={() => setShowSchedule(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2" style={{ maxHeight: 'calc(80vh - 60px)' }}>
              {vaccineSchedule.map((vaccine, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{vaccine.name}</p>
                    <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">{vaccine.age}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{vaccine.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
