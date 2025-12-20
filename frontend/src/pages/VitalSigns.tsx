// src/pages/VitalSigns.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Activity, Thermometer, Droplets,
  Plus, TrendingUp, TrendingDown, Minus, Calendar,
  Loader2, X, AlertTriangle, Info
} from 'lucide-react';
import api from '../services/api';

interface VitalRecord {
  id: string;
  type: 'blood_pressure' | 'pulse' | 'temperature' | 'oxygen' | 'glucose';
  value: string;
  value2?: string; // For blood pressure (systolic/diastolic)
  unit: string;
  date: string;
  time: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  notes?: string;
}

const vitalTypes = [
  {
    type: 'blood_pressure',
    name: 'Qon bosimi',
    icon: Activity,
    color: 'text-red-600',
    bg: 'bg-red-100',
    unit: 'mmHg',
    normalRange: '120/80',
    placeholder: '120',
    placeholder2: '80',
  },
  {
    type: 'pulse',
    name: 'Puls',
    icon: Heart,
    color: 'text-pink-600',
    bg: 'bg-pink-100',
    unit: 'bpm',
    normalRange: '60-100',
    placeholder: '72',
  },
  {
    type: 'temperature',
    name: 'Harorat',
    icon: Thermometer,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    unit: '°C',
    normalRange: '36.1-37.2',
    placeholder: '36.6',
  },
  {
    type: 'oxygen',
    name: 'Kislorod',
    icon: Droplets,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    unit: '%',
    normalRange: '95-100',
    placeholder: '98',
  },
  {
    type: 'glucose',
    name: 'Qand',
    icon: Activity,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    unit: 'mmol/L',
    normalRange: '3.9-6.1',
    placeholder: '5.5',
  },
];

export default function VitalSigns() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<VitalRecord[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyType, setHistoryType] = useState<string>('');
  const [newRecord, setNewRecord] = useState({
    type: 'blood_pressure' as const,
    value: '',
    value2: '',
    notes: '',
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const response = await api.get('/vital-signs/');
      setRecords(response.data.results || []);
    } catch (error) {
      console.error('Error loading vital signs:', error);
      // Demo data
      setRecords([
        { id: '1', type: 'blood_pressure', value: '125', value2: '82', unit: 'mmHg', date: '2024-12-10', time: '08:30', status: 'normal' },
        { id: '2', type: 'pulse', value: '75', unit: 'bpm', date: '2024-12-10', time: '08:30', status: 'normal' },
        { id: '3', type: 'blood_pressure', value: '138', value2: '88', unit: 'mmHg', date: '2024-12-09', time: '09:00', status: 'high' },
        { id: '4', type: 'pulse', value: '82', unit: 'bpm', date: '2024-12-09', time: '09:00', status: 'normal' },
        { id: '5', type: 'temperature', value: '36.8', unit: '°C', date: '2024-12-08', time: '07:45', status: 'normal' },
        { id: '6', type: 'oxygen', value: '97', unit: '%', date: '2024-12-08', time: '07:45', status: 'normal' },
        { id: '7', type: 'glucose', value: '6.8', unit: 'mmol/L', date: '2024-12-07', time: '06:30', status: 'high', notes: 'Nonushta oldidan' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async () => {
    if (!newRecord.value) {
      alert('Iltimos, qiymatni kiriting');
      return;
    }

    const typeInfo = vitalTypes.find(v => v.type === newRecord.type);
    const now = new Date();

    try {
      const response = await api.post('/vital-signs/', {
        type: newRecord.type,
        value: newRecord.value,
        value2: newRecord.value2 || undefined,
        notes: newRecord.notes || undefined,
      });
      setRecords(prev => [response.data, ...prev]);
    } catch (error) {
      console.error('Error adding record:', error);
      // Demo
      const demoRecord: VitalRecord = {
        id: Date.now().toString(),
        type: newRecord.type,
        value: newRecord.value,
        value2: newRecord.value2 || undefined,
        unit: typeInfo?.unit || '',
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
        status: 'normal',
        notes: newRecord.notes || undefined,
      };
      setRecords(prev => [demoRecord, ...prev]);
    }

    setShowAddModal(false);
    setNewRecord({ type: 'blood_pressure', value: '', value2: '', notes: '' });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'normal':
        return { icon: Minus, bg: 'bg-green-100', color: 'text-green-600', text: 'Normal' };
      case 'high':
        return { icon: TrendingUp, bg: 'bg-red-100', color: 'text-red-600', text: 'Yuqori' };
      case 'low':
        return { icon: TrendingDown, bg: 'bg-yellow-100', color: 'text-yellow-600', text: 'Past' };
      case 'critical':
        return { icon: AlertTriangle, bg: 'bg-red-200', color: 'text-red-700', text: 'Xavfli' };
      default:
        return { icon: Minus, bg: 'bg-gray-100', color: 'text-gray-600', text: '' };
    }
  };

  const getTypeInfo = (type: string) => {
    return vitalTypes.find(v => v.type === type) || vitalTypes[0];
  };

  const getLatestByType = (type: string) => {
    return records.find(r => r.type === type);
  };

  const filteredRecords = selectedType === 'all'
    ? records
    : records.filter(r => r.type === selectedType);

  const getHistoryRecords = () => {
    return records.filter(r => r.type === historyType);
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
              <h1 className="text-lg font-bold text-gray-900">Vital ko'rsatkichlar</h1>
              <p className="text-xs text-gray-500">Sog'liq ko'rsatkichlarini kuzating</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4 mr-1" />
            Qo'shish
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Asosiy ko'rsatkichlar */}
        <div className="grid grid-cols-2 gap-3">
          {vitalTypes.slice(0, 4).map((vital) => {
            const Icon = vital.icon;
            const latest = getLatestByType(vital.type);
            const statusInfo = latest ? getStatusInfo(latest.status) : null;

            return (
              <button
                key={vital.type}
                onClick={() => {
                  setHistoryType(vital.type);
                  setShowHistoryModal(true);
                }}
                className="bg-white rounded-2xl p-4 shadow-sm text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 ${vital.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${vital.color}`} />
                  </div>
                  {statusInfo && (
                    <span className={`w-6 h-6 ${statusInfo.bg} rounded-full flex items-center justify-center`}>
                      <statusInfo.icon className={`h-3 w-3 ${statusInfo.color}`} />
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{vital.name}</p>
                {latest ? (
                  <p className="text-xl font-bold text-gray-900">
                    {vital.type === 'blood_pressure' ? `${latest.value}/${latest.value2}` : latest.value}
                    <span className="text-sm font-normal text-gray-500 ml-1">{vital.unit}</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Ma'lumot yo'q</p>
                )}
                {latest && (
                  <p className="text-xs text-gray-400 mt-1">{latest.date}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Qo'shimcha ko'rsatkich */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <button
            onClick={() => {
              setHistoryType('glucose');
              setShowHistoryModal(true);
            }}
            className="w-full"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">Qon qandi</p>
                  {getLatestByType('glucose') ? (
                    <p className="text-lg font-bold text-gray-900">
                      {getLatestByType('glucose')?.value}
                      <span className="text-sm font-normal text-gray-500 ml-1">mmol/L</span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">Ma'lumot yo'q</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Norma: 3.9-6.1</p>
              </div>
            </div>
          </button>
        </div>

        {/* Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedType === 'all' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            Barchasi
          </button>
          {vitalTypes.map((vital) => (
            <button
              key={vital.type}
              onClick={() => setSelectedType(vital.type)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedType === vital.type ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              {vital.name}
            </button>
          ))}
        </div>

        {/* Tarix */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900">So'nggi yozuvlar</h2>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Yozuvlar yo'q</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredRecords.slice(0, 10).map((record) => {
                const typeInfo = getTypeInfo(record.type);
                const statusInfo = getStatusInfo(record.status);
                const Icon = typeInfo.icon;

                return (
                  <div key={record.id} className="p-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${typeInfo.bg} rounded-xl flex items-center justify-center mr-3`}>
                        <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{typeInfo.name}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-lg font-bold text-gray-900">
                            {record.type === 'blood_pressure' ? `${record.value}/${record.value2}` : record.value}
                            <span className="text-sm font-normal text-gray-500 ml-1">{record.unit}</span>
                          </p>
                          <span className="text-xs text-gray-400">
                            {record.date} {record.time}
                          </span>
                        </div>
                        {record.notes && (
                          <p className="text-xs text-gray-500 mt-1">{record.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Maslahat */}
        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Maslahat</p>
              <p className="text-sm text-blue-700 mt-1">
                Qon bosimini har kuni bir xil vaqtda o'lchang. Eng yaxshisi ertalab nonushta oldidan.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Qo'shish modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Ko'rsatkich qo'shish</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Turi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ko'rsatkich turi</label>
                <div className="grid grid-cols-3 gap-2">
                  {vitalTypes.map((vital) => {
                    const Icon = vital.icon;
                    return (
                      <button
                        key={vital.type}
                        onClick={() => setNewRecord(prev => ({ ...prev, type: vital.type as any, value: '', value2: '' }))}
                        className={`p-2 rounded-xl border-2 transition-colors ${
                          newRecord.type === vital.type
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <Icon className={`h-4 w-4 mx-auto ${vital.color}`} />
                        <p className="text-xs mt-1 text-gray-600 truncate">{vital.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Qiymat */}
              {newRecord.type === 'blood_pressure' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sistolik</label>
                    <input
                      type="number"
                      value={newRecord.value}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, value: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diastolik</label>
                    <input
                      type="number"
                      value={newRecord.value2}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, value2: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                      placeholder="80"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qiymat ({getTypeInfo(newRecord.type).unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRecord.value}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                    placeholder={getTypeInfo(newRecord.type).placeholder}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Norma: {getTypeInfo(newRecord.type).normalRange}
                  </p>
                </div>
              )}

              {/* Izoh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Izoh (ixtiyoriy)</label>
                <input
                  type="text"
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="Masalan: Nonushta oldidan"
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
                onClick={addRecord}
                className="flex-1 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tarix modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{getTypeInfo(historyType).name} tarixi</h3>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2" style={{ maxHeight: 'calc(80vh - 60px)' }}>
              {getHistoryRecords().length === 0 ? (
                <p className="text-center text-gray-500 py-4">Ma'lumot yo'q</p>
              ) : (
                getHistoryRecords().map((record) => {
                  const statusInfo = getStatusInfo(record.status);
                  return (
                    <div key={record.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-900">
                          {record.type === 'blood_pressure' ? `${record.value}/${record.value2}` : record.value}
                          <span className="text-sm font-normal text-gray-500 ml-1">{record.unit}</span>
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{record.date} {record.time}</p>
                      {record.notes && <p className="text-xs text-gray-500 mt-1">{record.notes}</p>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
