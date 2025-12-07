// src/pages/doctor/DoctorPatients.tsx
import { useState } from 'react';
import {
  Users, Search, Filter, Phone, Mail, Calendar,
  FileText, MoreVertical, ChevronRight, Plus,
  Heart, Activity, AlertCircle
} from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  phone: string;
  email?: string;
  age: number;
  gender: 'male' | 'female';
  blood_type?: string;
  last_visit: string;
  total_visits: number;
  diagnosis: string;
  status: 'stable' | 'improving' | 'critical' | 'monitoring';
  avatar?: string;
}

export default function DoctorPatients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [patients] = useState<Patient[]>([
    { id: 1, name: 'Aziza Karimova', phone: '+998 90 123 45 67', email: 'aziza@mail.uz', age: 34, gender: 'female', blood_type: 'A+', last_visit: '2024-01-20', total_visits: 8, diagnosis: 'Migren', status: 'stable' },
    { id: 2, name: 'Bobur Aliyev', phone: '+998 91 234 56 78', age: 45, gender: 'male', blood_type: 'O+', last_visit: '2024-01-19', total_visits: 12, diagnosis: 'Gipertoniya', status: 'improving' },
    { id: 3, name: 'Dilnoza Rahimova', phone: '+998 93 345 67 89', email: 'dilnoza@mail.uz', age: 28, gender: 'female', blood_type: 'B+', last_visit: '2024-01-18', total_visits: 5, diagnosis: 'Aritmiya', status: 'monitoring' },
    { id: 4, name: 'Eldor Toshmatov', phone: '+998 94 456 78 90', age: 52, gender: 'male', blood_type: 'AB-', last_visit: '2024-01-15', total_visits: 15, diagnosis: 'Yurak yetishmovchiligi', status: 'critical' },
    { id: 5, name: 'Feruza Umarova', phone: '+998 95 567 89 01', age: 41, gender: 'female', blood_type: 'A-', last_visit: '2024-01-14', total_visits: 6, diagnosis: 'Qon bosimi', status: 'stable' },
    { id: 6, name: 'Gulnora Saidova', phone: '+998 97 678 90 12', email: 'gulnora@mail.uz', age: 38, gender: 'female', blood_type: 'O-', last_visit: '2024-01-12', total_visits: 9, diagnosis: 'Uyqusizlik', status: 'improving' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-700';
      case 'improving': return 'bg-blue-100 text-blue-700';
      case 'monitoring': return 'bg-yellow-100 text-yellow-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'stable': return 'Barqaror';
      case 'improving': return 'Yaxshilanmoqda';
      case 'monitoring': return 'Kuzatuvda';
      case 'critical': return 'Jiddiy';
      default: return status;
    }
  };

  const filteredPatients = patients.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Bemorlar</h1>
          <p className="text-gray-500 mt-1">Jami {patients.length} ta bemor</p>
        </div>
        <button className="mt-4 lg:mt-0 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="h-5 w-5" />
          Yangi bemor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              <p className="text-sm text-gray-500">Jami bemorlar</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{patients.filter(p => p.status === 'stable').length}</p>
              <p className="text-sm text-gray-500">Barqaror</p>
            </div>
            <Heart className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600">{patients.filter(p => p.status === 'monitoring').length}</p>
              <p className="text-sm text-gray-500">Kuzatuvda</p>
            </div>
            <Activity className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-600">{patients.filter(p => p.status === 'critical').length}</p>
              <p className="text-sm text-gray-500">Jiddiy</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients List */}
        <div className="lg:col-span-2">
          {/* Search & Filter */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Bemor qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {['all', 'stable', 'improving', 'monitoring', 'critical'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'Barchasi' : getStatusText(status)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition ${selectedPatient?.id === patient.id ? 'bg-blue-50' : ''}`}
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold text-lg">{patient.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-500">{patient.age} yosh • {patient.gender === 'male' ? 'Erkak' : 'Ayol'}</p>
                      <p className="text-sm text-gray-500">{patient.diagnosis}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {getStatusText(patient.status)}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">Oxirgi: {patient.last_visit}</p>
                  </div>
                </div>
              </div>
            ))}

            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Bemorlar topilmadi</p>
              </div>
            )}
          </div>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-1">
          {selectedPatient ? (
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">{selectedPatient.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h3>
                <p className="text-gray-500">{selectedPatient.age} yosh • {selectedPatient.gender === 'male' ? 'Erkak' : 'Ayol'}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPatient.status)}`}>
                  {getStatusText(selectedPatient.status)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Telefon</p>
                    <p className="font-medium text-gray-900">{selectedPatient.phone}</p>
                  </div>
                </div>

                {selectedPatient.email && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedPatient.email}</p>
                    </div>
                  </div>
                )}

                {selectedPatient.blood_type && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Heart className="h-5 w-5 text-red-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Qon guruhi</p>
                      <p className="font-medium text-gray-900">{selectedPatient.blood_type}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Tashxis</p>
                    <p className="font-medium text-gray-900">{selectedPatient.diagnosis}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Tashriflar</p>
                    <p className="font-medium text-gray-900">{selectedPatient.total_visits} ta</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Tibbiy tarix
                </button>
                <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                  Qabul yozish
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Bemor tanlang</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}