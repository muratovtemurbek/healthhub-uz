// src/pages/LabTests.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FlaskConical, Loader2, Calendar, Clock,
  MapPin, FileText, CheckCircle, XCircle, Plus, Download
} from 'lucide-react';
import api from '../services/api';

interface LabTest {
  id: string;
  hospital_name: string;
  test_type: string;
  test_type_display: string;
  test_name: string;
  description: string;
  date: string;
  time: string;
  price: number;
  status: string;
  status_display: string;
  results: Record<string, any>;
  result_file_url: string | null;
  result_summary: string;
  is_paid: boolean;
  is_urgent: boolean;
  created_at: string;
}

interface TestType {
  value: string;
  label: string;
}

interface Hospital {
  id: number;
  name: string;
  address: string;
  hospital_type: string;
}

const STATUS_COLORS: Record<string, string> = {
  booked: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

export default function LabTests() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [booking, setBooking] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const [bookForm, setBookForm] = useState({
    hospital: '',
    test_type: 'blood',
    test_name: '',
    date: '',
    time: '09:00',
    price: 0,
    is_urgent: false,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [testsRes, typesRes, hospitalsRes] = await Promise.all([
        api.get('/appointments/lab-tests/'),
        api.get('/appointments/lab-test-types/'),
        api.get('/medicines/hospitals/')
      ]);
      setTests(testsRes.data.results || testsRes.data || []);
      setTestTypes(typesRes.data || []);
      const labs = (hospitalsRes.data.results || hospitalsRes.data || [])
        .filter((h: Hospital) => h.hospital_type === 'laboratory' || h.hospital_type === 'hospital');
      setHospitals(labs);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const bookTest = async () => {
    if (!bookForm.hospital || !bookForm.test_name || !bookForm.date) {
      alert('Barcha maydonlarni to\'ldiring');
      return;
    }

    setBooking(true);
    try {
      await api.post('/appointments/lab-tests/', {
        ...bookForm,
        hospital: parseInt(bookForm.hospital)
      });
      setShowBookModal(false);
      setBookForm({
        hospital: '',
        test_type: 'blood',
        test_name: '',
        date: '',
        time: '09:00',
        price: 0,
        is_urgent: false,
        notes: ''
      });
      loadData();
      alert('Tahlil bron qilindi!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setBooking(false);
    }
  };

  const cancelTest = async (testId: string) => {
    if (!confirm('Tahlilni bekor qilmoqchimisiz?')) return;
    try {
      await api.post(`/appointments/lab-tests/${testId}/cancel/`);
      loadData();
    } catch (err) {
      console.error('Error cancelling test:', err);
    }
  };

  const filteredTests = tests.filter(test => {
    if (filter === 'upcoming') return ['booked', 'confirmed', 'in_progress'].includes(test.status);
    if (filter === 'completed') return test.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Laboratoriya</h1>
              <p className="text-xs text-gray-500">Tahlillar va natijalar</p>
            </div>
          </div>
          <button
            onClick={() => setShowBookModal(true)}
            className="p-2 bg-blue-600 text-white rounded-lg"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'Barchasi' },
            { key: 'upcoming', label: 'Rejalashtirilgan' },
            { key: 'completed', label: 'Bajarilgan' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4">
        {filteredTests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <FlaskConical className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tahlillar yo'q</h3>
            <p className="text-gray-500 mb-6">Yangi tahlil bron qiling</p>
            <button
              onClick={() => setShowBookModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              Bron qilish
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-xl p-4 shadow-sm"
                onClick={() => setSelectedTest(test)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{test.test_name}</h3>
                      {test.is_urgent && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                          Shoshilinch
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{test.test_type_display}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[test.status]}`}>
                    {test.status_display}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {test.hospital_name}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(test.date).toLocaleDateString('uz-UZ')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {test.time.slice(0, 5)}
                  </div>
                </div>

                {test.status === 'completed' && test.result_file_url && (
                  <a
                    href={test.result_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 text-sm mb-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Natijani yuklab olish
                  </a>
                )}

                {test.result_summary && (
                  <p className="text-sm text-gray-600 bg-green-50 p-2 rounded-lg mb-3">
                    {test.result_summary}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm text-gray-500">
                    {test.is_paid ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        To'langan
                      </span>
                    ) : (
                      <span className="text-orange-600">To'lanmagan</span>
                    )}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {test.price.toLocaleString()} so'm
                  </span>
                </div>

                {['booked', 'confirmed'].includes(test.status) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelTest(test.id);
                    }}
                    className="mt-3 w-full py-2 border border-red-200 text-red-600 rounded-lg text-sm"
                  >
                    Bekor qilish
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">Tahlil bron qilish</h3>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Laboratoriya</label>
                <select
                  value={bookForm.hospital}
                  onChange={(e) => setBookForm(prev => ({ ...prev, hospital: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Tanlang</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahlil turi</label>
                <select
                  value={bookForm.test_type}
                  onChange={(e) => setBookForm(prev => ({ ...prev, test_type: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {testTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahlil nomi</label>
                <input
                  type="text"
                  value={bookForm.test_name}
                  onChange={(e) => setBookForm(prev => ({ ...prev, test_name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Masalan: Umumiy qon tahlili"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sana</label>
                  <input
                    type="date"
                    value={bookForm.date}
                    onChange={(e) => setBookForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vaqt</label>
                  <select
                    value={bookForm.time}
                    onChange={(e) => setBookForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Narxi (so'm)</label>
                <input
                  type="number"
                  value={bookForm.price}
                  onChange={(e) => setBookForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={bookForm.is_urgent}
                  onChange={(e) => setBookForm(prev => ({ ...prev, is_urgent: e.target.checked }))}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Shoshilinch tahlil</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Izoh</label>
                <textarea
                  value={bookForm.notes}
                  onChange={(e) => setBookForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Qo'shimcha ma'lumot"
                />
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setShowBookModal(false)}
                className="flex-1 py-2 border rounded-lg"
              >
                Bekor qilish
              </button>
              <button
                onClick={bookTest}
                disabled={booking}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {booking ? 'Bron qilinmoqda...' : 'Bron qilish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Detail Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">{selectedTest.test_name}</h3>
              <button onClick={() => setSelectedTest(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Turi:</span>
                <span className="font-medium">{selectedTest.test_type_display}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Laboratoriya:</span>
                <span className="font-medium">{selectedTest.hospital_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sana:</span>
                <span className="font-medium">{new Date(selectedTest.date).toLocaleDateString('uz-UZ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vaqt:</span>
                <span className="font-medium">{selectedTest.time.slice(0, 5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Narxi:</span>
                <span className="font-medium">{selectedTest.price.toLocaleString()} so'm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Holati:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedTest.status]}`}>
                  {selectedTest.status_display}
                </span>
              </div>

              {selectedTest.result_summary && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-1">Natija xulosasi:</p>
                  <p className="text-sm text-green-700">{selectedTest.result_summary}</p>
                </div>
              )}

              {selectedTest.result_file_url && (
                <a
                  href={selectedTest.result_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Natijani yuklab olish
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
