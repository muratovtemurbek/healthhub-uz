// src/pages/doctor/DoctorMedicalRecords.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Search, Plus, Eye, Edit2, Trash2,
  Calendar, User, ChevronRight, Download, Printer
} from 'lucide-react';

interface MedicalRecord {
  id: string;
  patient_name: string;
  patient_id: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  prescriptions: string[];
  notes: string;
  status: 'draft' | 'completed';
}

const DEMO_RECORDS: MedicalRecord[] = [
  {
    id: '1',
    patient_name: 'Alisher Karimov',
    patient_id: 'p1',
    date: '2024-01-15',
    diagnosis: 'Gipertoniya',
    symptoms: "Bosh og'rig'i, yurak urishi tezlashishi",
    treatment: 'Dori-darmonlar, parhez',
    prescriptions: ['Lisinopril 10mg - kuniga 1 marta', 'Aspirin 75mg - kuniga 1 marta'],
    notes: "Qon bosimini har kuni o'lchash",
    status: 'completed'
  },
  {
    id: '2',
    patient_name: 'Madina Rahimova',
    patient_id: 'p2',
    date: '2024-01-14',
    diagnosis: 'ORVI',
    symptoms: "Isitma, yo'tal, burun bitishi",
    treatment: 'Simptomatik davolash',
    prescriptions: ['Paracetamol 500mg', 'Vitamin C 1000mg'],
    notes: '3 kun ichida yaxshilanmasa qayta murojaat',
    status: 'completed'
  },
  {
    id: '3',
    patient_name: 'Bobur Toshmatov',
    patient_id: 'p3',
    date: '2024-01-13',
    diagnosis: 'Gastrit',
    symptoms: "Qorin og'rig'i, ko'ngil aynishi",
    treatment: 'Parhez, dori-darmonlar',
    prescriptions: ['Omeprazol 20mg', 'Antasid'],
    notes: "Achchiq ovqatlardan saqlaning",
    status: 'completed'
  },
  {
    id: '4',
    patient_name: 'Nilufar Saidova',
    patient_id: 'p4',
    date: '2024-01-12',
    diagnosis: '',
    symptoms: 'Bosh aylanishi',
    treatment: '',
    prescriptions: [],
    notes: "Tekshiruvdan o'tish kerak",
    status: 'draft'
  }
];

export default function DoctorMedicalRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>(DEMO_RECORDS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'completed'>('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const deleteRecord = (id: string) => {
    if (!confirm("Bu yozuvni o'chirmoqchimisiz?")) return;
    setRecords(prev => prev.filter(r => r.id !== id));
    setSelectedRecord(null);
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/doctor/dashboard')} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-lg font-bold text-gray-900">Tibbiy yozuvlar</h1>
            </div>
          </div>
          <Link
            to="/doctor/medical-record/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yangi yozuv
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Records List */}
          <div className="lg:col-span-2">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Bemor yoki diagnoz qidirish..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
                >
                  <option value="all">Barchasi</option>
                  <option value="completed">Yakunlangan</option>
                  <option value="draft">Qoralama</option>
                </select>
              </div>
            </div>

            {/* Records */}
            <div className="space-y-3">
              {filteredRecords.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tibbiy yozuvlar yo'q</h3>
                  <Link
                    to="/doctor/medical-record/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Yangi yozuv
                  </Link>
                </div>
              ) : (
                filteredRecords.map(record => (
                  <button
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className={`w-full text-left bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all ${
                      selectedRecord?.id === record.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{record.patient_name}</h3>
                          <p className="text-sm text-gray-600">{record.diagnosis || 'Diagnoz belgilanmagan'}</p>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(record.date).toLocaleDateString('uz-UZ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          record.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {record.status === 'completed' ? 'Yakunlangan' : 'Qoralama'}
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Record Detail */}
          <div className="lg:col-span-1">
            {selectedRecord ? (
              <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Tafsilotlar</h3>
                  <div className="flex space-x-1">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Edit2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button onClick={() => deleteRecord(selectedRecord.id)} className="p-2 hover:bg-red-100 rounded-lg">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500">Bemor</p>
                    <p className="font-medium">{selectedRecord.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Sana</p>
                    <p className="font-medium">{new Date(selectedRecord.date).toLocaleDateString('uz-UZ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Diagnoz</p>
                    <p className="font-medium text-blue-600">{selectedRecord.diagnosis || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Alomatlar</p>
                    <p>{selectedRecord.symptoms || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Davolash</p>
                    <p>{selectedRecord.treatment || '-'}</p>
                  </div>
                  {selectedRecord.prescriptions.length > 0 && (
                    <div>
                      <p className="text-gray-500">Retseptlar</p>
                      <ul className="mt-1 space-y-1">
                        {selectedRecord.prescriptions.map((p, i) => (
                          <li key={i} className="flex items-start">
                            <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-2 text-xs">{i+1}</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedRecord.notes && (
                    <div>
                      <p className="text-gray-500">Eslatmalar</p>
                      <p>{selectedRecord.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t flex space-x-2">
                  <button className="flex-1 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm">
                    <Printer className="h-4 w-4 mr-1" />
                    Chop etish
                  </button>
                  <button className="flex-1 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm">
                    <Download className="h-4 w-4 mr-1" />
                    Yuklab olish
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center sticky top-24">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Yozuvni tanlang</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}