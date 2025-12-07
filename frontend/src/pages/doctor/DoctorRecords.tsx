// src/pages/doctor/DoctorRecords.tsx
import { useState } from 'react';
import {
  FileText, Search, Filter, Plus, Download,
  Eye, Edit2, Trash2, Calendar, User, Clock
} from 'lucide-react';

interface MedicalRecord {
  id: number;
  patient_name: string;
  patient_id: number;
  date: string;
  type: 'consultation' | 'prescription' | 'lab_result' | 'diagnosis';
  title: string;
  description: string;
  diagnosis?: string;
  prescription?: string[];
  attachments?: number;
}

export default function DoctorRecords() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const [records] = useState<MedicalRecord[]>([
    {
      id: 1,
      patient_name: 'Aziza Karimova',
      patient_id: 1,
      date: '2024-01-20',
      type: 'consultation',
      title: 'Birlamchi konsultatsiya',
      description: "Bemor bosh og'rig'i va ko'ngil aynishdan shikoyat qildi.",
      diagnosis: 'Migren',
      prescription: ['Paracetamol 500mg - kuniga 2 marta', 'Metoclopramide 10mg - kerak bo\'lganda'],
      attachments: 2
    },
    {
      id: 2,
      patient_name: 'Bobur Aliyev',
      patient_id: 2,
      date: '2024-01-19',
      type: 'lab_result',
      title: 'Qon tahlili natijalari',
      description: 'Umumiy qon tahlili va bioximik ko\'rsatkichlar.',
      attachments: 1
    },
    {
      id: 3,
      patient_name: 'Dilnoza Rahimova',
      patient_id: 3,
      date: '2024-01-18',
      type: 'diagnosis',
      title: 'Yakuniy tashxis',
      description: 'EKG va exokardiografiya natijalariga asosan.',
      diagnosis: 'Sinusli aritmiya',
    },
    {
      id: 4,
      patient_name: 'Eldor Toshmatov',
      patient_id: 4,
      date: '2024-01-15',
      type: 'prescription',
      title: 'Dori buyurtmasi',
      description: 'Gipertoniya uchun doimiy dori terapiyasi.',
      prescription: ['Lisinopril 10mg - ertalab 1 ta', 'Amlodipine 5mg - kechqurun 1 ta', 'Aspirin 75mg - kuniga 1 ta'],
    },
    {
      id: 5,
      patient_name: 'Feruza Umarova',
      patient_id: 5,
      date: '2024-01-14',
      type: 'consultation',
      title: 'Qayta ko\'rik',
      description: 'Davolash natijalarini baholash.',
      diagnosis: 'Arterial gipertoniya - nazorat ostida',
    },
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-700';
      case 'prescription': return 'bg-green-100 text-green-700';
      case 'lab_result': return 'bg-purple-100 text-purple-700';
      case 'diagnosis': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'consultation': return 'Konsultatsiya';
      case 'prescription': return 'Retsept';
      case 'lab_result': return 'Tahlil';
      case 'diagnosis': return 'Tashxis';
      default: return type;
    }
  };

  const filteredRecords = records.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (searchQuery && !r.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tibbiy yozuvlar</h1>
          <p className="text-gray-500 mt-1">Barcha tibbiy hujjatlar va yozuvlar</p>
        </div>
        <button className="mt-4 lg:mt-0 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="h-5 w-5" />
          Yangi yozuv
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Bemor yoki yozuv qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'consultation', 'prescription', 'lab_result', 'diagnosis'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  typeFilter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'Barchasi' : getTypeText(type)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Records List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition ${selectedRecord?.id === record.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedRecord(record)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{record.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                        {getTypeText(record.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{record.patient_name}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{record.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{record.date}</p>
                  {record.attachments && (
                    <p className="text-xs text-gray-400 mt-1">{record.attachments} fayl</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredRecords.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Yozuvlar topilmadi</p>
            </div>
          )}
        </div>

        {/* Record Details */}
        <div className="lg:col-span-1">
          {selectedRecord ? (
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedRecord.type)}`}>
                  {getTypeText(selectedRecord.type)}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedRecord.title}</h2>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {selectedRecord.patient_name}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {selectedRecord.date}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Tavsif</h4>
                  <p className="text-gray-700">{selectedRecord.description}</p>
                </div>

                {selectedRecord.diagnosis && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Tashxis</h4>
                    <p className="text-gray-900 font-medium">{selectedRecord.diagnosis}</p>
                  </div>
                )}

                {selectedRecord.prescription && selectedRecord.prescription.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Retsept</h4>
                    <ul className="space-y-2">
                      {selectedRecord.prescription.map((med, i) => (
                        <li key={i} className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2"></span>
                          <span className="text-gray-700">{med}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRecord.attachments && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Fayllar</h4>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition">
                      <Download className="h-4 w-4" />
                      {selectedRecord.attachments} ta faylni yuklab olish
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Yozuvni tanlang</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}