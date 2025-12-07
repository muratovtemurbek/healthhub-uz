// src/pages/MedicalHistory.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Calendar, User, ChevronRight,
  Search, Filter, Pill, Stethoscope, TestTube
} from 'lucide-react';

interface HistoryItem {
  id: string;
  date: string;
  type: 'appointment' | 'prescription' | 'test';
  doctor_name: string;
  specialty: string;
  diagnosis?: string;
  notes?: string;
  prescriptions?: string[];
  test_results?: string;
}

const DEMO_HISTORY: HistoryItem[] = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'appointment',
    doctor_name: 'Dr. Akbar Karimov',
    specialty: 'Kardiolog',
    diagnosis: 'Gipertoniya',
    notes: "Qon bosimi yuqori. Dori buyurildi. 2 haftadan so'ng qayta ko'rik.",
    prescriptions: ['Lisinopril 10mg', 'Aspirin 75mg']
  },
  {
    id: '2',
    date: '2024-01-10',
    type: 'test',
    doctor_name: 'Dr. Malika Rahimova',
    specialty: 'Terapevt',
    test_results: 'Qon tahlili: Gemoglobin - 14.2, Leykositlar - 6.8',
    notes: 'Barcha ko\'rsatkichlar normal'
  },
  {
    id: '3',
    date: '2024-01-05',
    type: 'prescription',
    doctor_name: 'Dr. Bobur Alimov',
    specialty: 'Nevrolog',
    diagnosis: "Migren bosh og'rig'i",
    prescriptions: ['Sumatriptan 50mg', 'Ibuprofen 400mg']
  },
  {
    id: '4',
    date: '2023-12-20',
    type: 'appointment',
    doctor_name: 'Dr. Nilufar Saidova',
    specialty: 'Terapevt',
    diagnosis: 'ORVI',
    notes: "Sovuq olgani. Uy rejimi, ko'p suyuqlik ichish."
  },
  {
    id: '5',
    date: '2023-12-10',
    type: 'test',
    doctor_name: 'Dr. Jasur Toshmatov',
    specialty: 'Endokrinolog',
    test_results: 'Qalqonsimon bez: TSH - 2.1, T3 - 1.2, T4 - 8.5',
    notes: 'Normal doirada'
  }
];

export default function MedicalHistory() {
  const navigate = useNavigate();
  const [history] = useState<HistoryItem[]>(DEMO_HISTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'appointment' | 'prescription' | 'test'>('all');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'appointment':
        return { label: 'Qabul', icon: Stethoscope, bg: 'bg-blue-100', color: 'text-blue-600' };
      case 'prescription':
        return { label: 'Retsept', icon: Pill, bg: 'bg-green-100', color: 'text-green-600' };
      case 'test':
        return { label: 'Tahlil', icon: TestTube, bg: 'bg-purple-100', color: 'text-purple-600' };
      default:
        return { label: type, icon: FileText, bg: 'bg-gray-100', color: 'text-gray-600' };
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || item.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Tibbiy tarix</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Shifokor yoki diagnoz qidirish..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'appointment', label: 'Qabullar' },
            { id: 'prescription', label: 'Retseptlar' },
            { id: 'test', label: 'Tahlillar' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === f.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* History List */}
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tarix topilmadi</h3>
              <p className="text-gray-500">Qidiruv bo'yicha natija yo'q</p>
            </div>
          ) : (
            filteredHistory.map(item => {
              const typeConfig = getTypeConfig(item.type);
              const TypeIcon = typeConfig.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="w-full text-left bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start">
                    <div className={`w-10 h-10 ${typeConfig.bg} rounded-xl flex items-center justify-center mr-3`}>
                      <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.doctor_name}</p>
                          <p className="text-sm text-gray-500">{item.specialty}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                      </div>
                      {item.diagnosis && (
                        <p className="text-sm text-blue-600 mt-1">{item.diagnosis}</p>
                      )}
                      <div className="flex items-center text-xs text-gray-400 mt-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(item.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedItem(null)}>
          <div className="bg-white w-full sm:w-96 sm:rounded-2xl rounded-t-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">Tafsilotlar</h3>
              <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-gray-100 rounded">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Type Badge */}
              <div className="flex items-center">
                {(() => {
                  const config = getTypeConfig(selectedItem.type);
                  const Icon = config.icon;
                  return (
                    <div className={`flex items-center px-3 py-1.5 rounded-full ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.color} mr-1`} />
                      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Doctor */}
              <div>
                <p className="text-sm text-gray-500">Shifokor</p>
                <p className="font-medium">{selectedItem.doctor_name}</p>
                <p className="text-sm text-gray-600">{selectedItem.specialty}</p>
              </div>

              {/* Date */}
              <div>
                <p className="text-sm text-gray-500">Sana</p>
                <p className="font-medium">
                  {new Date(selectedItem.date).toLocaleDateString('uz-UZ', { 
                    day: 'numeric', month: 'long', year: 'numeric' 
                  })}
                </p>
              </div>

              {/* Diagnosis */}
              {selectedItem.diagnosis && (
                <div>
                  <p className="text-sm text-gray-500">Diagnoz</p>
                  <p className="font-medium text-blue-600">{selectedItem.diagnosis}</p>
                </div>
              )}

              {/* Notes */}
              {selectedItem.notes && (
                <div>
                  <p className="text-sm text-gray-500">Izohlar</p>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{selectedItem.notes}</p>
                </div>
              )}

              {/* Prescriptions */}
              {selectedItem.prescriptions && selectedItem.prescriptions.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Retseptlar</p>
                  <div className="space-y-2">
                    {selectedItem.prescriptions.map((p, i) => (
                      <div key={i} className="flex items-center bg-green-50 rounded-lg p-3">
                        <Pill className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-green-700">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Results */}
              {selectedItem.test_results && (
                <div>
                  <p className="text-sm text-gray-500">Tahlil natijalari</p>
                  <p className="text-gray-700 bg-purple-50 rounded-lg p-3">{selectedItem.test_results}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}