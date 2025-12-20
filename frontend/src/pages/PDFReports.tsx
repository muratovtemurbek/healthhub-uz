// src/pages/PDFReports.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, Calendar, User,
  Stethoscope, Pill, Activity, Loader2, Eye,
  Filter, Search
} from 'lucide-react';
import api from '../services/api';

interface Report {
  id: string;
  type: 'medical_history' | 'prescription' | 'lab_result' | 'appointment_summary';
  title: string;
  description: string;
  date: string;
  doctor_name?: string;
  file_url?: string;
}

export default function PDFReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await api.get('/reports/');
      setReports(response.data.results || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      // Demo data
      setReports([
        {
          id: '1',
          type: 'medical_history',
          title: 'Tibbiy tarix hisoboti',
          description: '2024-yil uchun to\'liq tibbiy tarix',
          date: '2024-12-10',
        },
        {
          id: '2',
          type: 'prescription',
          title: 'Retseptlar hisoboti',
          description: 'Barcha retseptlar ro\'yxati',
          date: '2024-12-09',
          doctor_name: 'Dr. Alisher Karimov'
        },
        {
          id: '3',
          type: 'lab_result',
          title: 'Laboratoriya natijalari',
          description: 'Qon tahlili natijalari',
          date: '2024-12-08',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: string) => {
    setGenerating(type);
    try {
      const response = await api.post('/reports/generate/', { type }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Hisobot yaratishda xatolik yuz berdi');
    } finally {
      setGenerating(null);
    }
  };

  const downloadReport = async (report: Report) => {
    if (report.file_url) {
      window.open(report.file_url, '_blank');
    } else {
      await generateReport(report.type);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical_history':
        return { icon: User, bg: 'bg-blue-100', color: 'text-blue-600' };
      case 'prescription':
        return { icon: Pill, bg: 'bg-green-100', color: 'text-green-600' };
      case 'lab_result':
        return { icon: Activity, bg: 'bg-purple-100', color: 'text-purple-600' };
      case 'appointment_summary':
        return { icon: Stethoscope, bg: 'bg-orange-100', color: 'text-orange-600' };
      default:
        return { icon: FileText, bg: 'bg-gray-100', color: 'text-gray-600' };
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'medical_history': return 'Tibbiy tarix';
      case 'prescription': return 'Retsept';
      case 'lab_result': return 'Laboratoriya';
      case 'appointment_summary': return 'Qabullar';
      default: return 'Hisobot';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.type === filter;
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const reportTypes = [
    { type: 'medical_history', name: 'Tibbiy tarix', desc: 'To\'liq tibbiy tarix va tashxislar' },
    { type: 'prescription', name: 'Retseptlar', desc: 'Barcha retseptlar va dorilar' },
    { type: 'lab_result', name: 'Labaratoriya', desc: 'Tahlil natijalari' },
    { type: 'appointment_summary', name: 'Qabullar', desc: 'Shifokor qabullari tarixi' },
  ];

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
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">PDF Hisobotlar</h1>
            <p className="text-xs text-gray-500">Tibbiy hujjatlarni yuklab oling</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Yangi hisobot yaratish */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Yangi hisobot yaratish</h2>
          <div className="grid grid-cols-2 gap-3">
            {reportTypes.map((rt) => {
              const iconConfig = getTypeIcon(rt.type);
              const Icon = iconConfig.icon;
              const isGenerating = generating === rt.type;

              return (
                <button
                  key={rt.type}
                  onClick={() => generateReport(rt.type)}
                  disabled={isGenerating}
                  className="p-4 border-2 border-dashed rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-left disabled:opacity-50"
                >
                  <div className={`w-10 h-10 ${iconConfig.bg} rounded-xl flex items-center justify-center mb-2`}>
                    {isGenerating ? (
                      <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                    ) : (
                      <Icon className={`h-5 w-5 ${iconConfig.color}`} />
                    )}
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{rt.name}</p>
                  <p className="text-xs text-gray-500">{rt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Qidirish va filter */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Hisobot qidirish..."
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white rounded-xl border focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Barchasi</option>
            <option value="medical_history">Tibbiy tarix</option>
            <option value="prescription">Retseptlar</option>
            <option value="lab_result">Laboratoriya</option>
            <option value="appointment_summary">Qabullar</option>
          </select>
        </div>

        {/* Hisobotlar ro'yxati */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900">So'nggi hisobotlar</h2>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Hisobotlar topilmadi</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredReports.map((report) => {
                const iconConfig = getTypeIcon(report.type);
                const Icon = iconConfig.icon;

                return (
                  <div key={report.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className={`w-10 h-10 ${iconConfig.bg} rounded-xl flex items-center justify-center mr-3 flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${iconConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{report.title}</p>
                            <p className="text-sm text-gray-500">{report.description}</p>
                            <div className="flex items-center mt-1 text-xs text-gray-400">
                              <Calendar className="h-3 w-3 mr-1" />
                              {report.date}
                              {report.doctor_name && (
                                <>
                                  <span className="mx-2">•</span>
                                  <Stethoscope className="h-3 w-3 mr-1" />
                                  {report.doctor_name}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => downloadReport(report)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Yuklab olish"
                            >
                              <Download className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ma'lumot */}
        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Eslatma:</strong> Hisobotlar PDF formatida yuklab olinadi. Hisobotlarni shifokorga ko'rsatish yoki arxivlash uchun saqlashingiz mumkin.
          </p>
        </div>
      </main>
    </div>
  );
}
