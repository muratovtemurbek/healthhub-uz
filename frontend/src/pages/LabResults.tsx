// src/pages/LabResults.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TestTube, Upload, Calendar, FileText,
  TrendingUp, TrendingDown, Minus, Loader2, Eye,
  Download, Filter, Search, Plus, X, CheckCircle
} from 'lucide-react';
import api from '../services/api';

interface LabResult {
  id: string;
  test_name: string;
  category: string;
  date: string;
  hospital: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  results: {
    name: string;
    value: string;
    unit: string;
    reference_range: string;
    status: 'normal' | 'high' | 'low';
  }[];
  file_url?: string;
  notes?: string;
}

const testCategories = [
  { id: 'blood', name: 'Qon tahlili', icon: '🩸' },
  { id: 'urine', name: 'Siydik tahlili', icon: '🧪' },
  { id: 'biochemistry', name: 'Biokimyo', icon: '⚗️' },
  { id: 'hormones', name: 'Gormonlar', icon: '🧬' },
  { id: 'other', name: 'Boshqa', icon: '📋' },
];

export default function LabResults() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<LabResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const response = await api.get('/lab-results/');
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Error loading lab results:', error);
      // Demo data
      setResults([
        {
          id: '1',
          test_name: 'Umumiy qon tahlili',
          category: 'blood',
          date: '2024-12-08',
          hospital: 'Toshkent shahar poliklinikasi',
          status: 'normal',
          results: [
            { name: 'Gemoglobin', value: '145', unit: 'g/L', reference_range: '130-170', status: 'normal' },
            { name: 'Eritrositlar', value: '4.8', unit: '×10¹²/L', reference_range: '4.0-5.5', status: 'normal' },
            { name: 'Leykositlar', value: '7.2', unit: '×10⁹/L', reference_range: '4.0-9.0', status: 'normal' },
            { name: 'Trombotsitlar', value: '250', unit: '×10⁹/L', reference_range: '150-400', status: 'normal' },
          ],
        },
        {
          id: '2',
          test_name: 'Biokimyoviy tahlil',
          category: 'biochemistry',
          date: '2024-12-05',
          hospital: 'Med Center',
          status: 'high',
          results: [
            { name: 'Glyukoza', value: '6.8', unit: 'mmol/L', reference_range: '3.9-6.1', status: 'high' },
            { name: 'Xolesterin', value: '5.2', unit: 'mmol/L', reference_range: '< 5.2', status: 'normal' },
            { name: 'Kreatinin', value: '85', unit: 'µmol/L', reference_range: '62-106', status: 'normal' },
          ],
        },
        {
          id: '3',
          test_name: 'Gormon tahlili (TTG)',
          category: 'hormones',
          date: '2024-11-28',
          hospital: 'Endokrinologiya markazi',
          status: 'normal',
          results: [
            { name: 'TTG', value: '2.5', unit: 'mIU/L', reference_range: '0.4-4.0', status: 'normal' },
            { name: 'T4 erkin', value: '15', unit: 'pmol/L', reference_range: '10-22', status: 'normal' },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/lab-results/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResults(prev => [response.data, ...prev]);
      setShowUploadModal(false);
      alert('Fayl muvaffaqiyatli yuklandi!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Faylni yuklashda xatolik yuz berdi');
    } finally {
      setUploading(false);
    }
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
        return { icon: TrendingUp, bg: 'bg-red-200', color: 'text-red-700', text: 'Kritik' };
      default:
        return { icon: Minus, bg: 'bg-gray-100', color: 'text-gray-600', text: 'Noma\'lum' };
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return testCategories.find(c => c.id === categoryId) || { id: 'other', name: 'Boshqa', icon: '📋' };
  };

  const filteredResults = results.filter(result => {
    const matchesFilter = filter === 'all' || result.category === filter;
    const matchesSearch = result.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
              <h1 className="text-lg font-bold text-gray-900">Laboratoriya natijalari</h1>
              <p className="text-xs text-gray-500">Tahlil natijalarini saqlang</p>
            </div>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            <Upload className="h-4 w-4 mr-1" />
            Yuklash
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Kategoriyalar */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Barchasi
          </button>
          {testCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === cat.id ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Qidirish */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tahlil qidirish..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Natijalar ro'yxati */}
        {filteredResults.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <TestTube className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Natijalar topilmadi</h3>
            <p className="text-gray-500 mb-4">Tahlil natijalarini yuklab qo'shing</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              <Upload className="h-4 w-4 mr-2" />
              Natija yuklash
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResults.map((result) => {
              const statusInfo = getStatusInfo(result.status);
              const StatusIcon = statusInfo.icon;
              const categoryInfo = getCategoryInfo(result.category);

              return (
                <div
                  key={result.id}
                  onClick={() => setSelectedResult(result)}
                  className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-3 text-2xl">
                      {categoryInfo.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{result.test_name}</p>
                          <p className="text-sm text-gray-500">{result.hospital}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {result.date}
                        <span className="mx-2">•</span>
                        <span>{result.results.length} ko'rsatkich</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Batafsil ko'rish modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{selectedResult.test_name}</h3>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
              {/* Ma'lumotlar */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Sana:</span>
                <span className="font-medium">{selectedResult.date}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Shifoxona:</span>
                <span className="font-medium">{selectedResult.hospital}</span>
              </div>

              {/* Natijalar jadvali */}
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b">
                  <div className="grid grid-cols-4 text-xs font-medium text-gray-500">
                    <span className="col-span-1">Ko'rsatkich</span>
                    <span className="text-center">Natija</span>
                    <span className="text-center">Norma</span>
                    <span className="text-center">Status</span>
                  </div>
                </div>
                <div className="divide-y">
                  {selectedResult.results.map((item, index) => {
                    const itemStatus = getStatusInfo(item.status);
                    const ItemIcon = itemStatus.icon;

                    return (
                      <div key={index} className="px-3 py-2">
                        <div className="grid grid-cols-4 text-sm items-center">
                          <span className="col-span-1 text-gray-900 font-medium">{item.name}</span>
                          <span className="text-center font-medium">{item.value} {item.unit}</span>
                          <span className="text-center text-gray-500 text-xs">{item.reference_range}</span>
                          <span className="flex justify-center">
                            <span className={`w-6 h-6 rounded-full ${itemStatus.bg} flex items-center justify-center`}>
                              <ItemIcon className={`h-3 w-3 ${itemStatus.color}`} />
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Izoh */}
              {selectedResult.notes && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-sm text-blue-800">{selectedResult.notes}</p>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t">
              {selectedResult.file_url && (
                <button
                  onClick={() => window.open(selectedResult.file_url, '_blank')}
                  className="w-full flex items-center justify-center py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF yuklab olish
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Yuklash modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tahlil natijasini yuklash</h3>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
            >
              {uploading ? (
                <Loader2 className="h-12 w-12 text-emerald-500 mx-auto animate-spin" />
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Fayl tanlang</p>
                  <p className="text-sm text-gray-500 mt-1">PDF, JPG, PNG (max 10MB)</p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={uploadFile}
              className="hidden"
            />

            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 py-2 border rounded-xl hover:bg-gray-50"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
