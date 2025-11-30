import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Search, Star, MapPin, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import apiClient from '../../api/client';

interface Doctor {
  id: string;
  user_name: string;
  email?: string;
  phone?: string;
  specialization_name: string;
  hospital_name: string;
  experience_years: number;
  consultation_price: string;
  rating: string;
  is_available: boolean;
  is_verified?: boolean;
}

export default function AdminDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/doctors/doctors/');
      setDoctors(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (doc: Doctor) => {
    setActionLoading(doc.id);
    try {
      await apiClient.patch(`/api/doctors/doctors/${doc.id}/`, { is_available: !doc.is_available });
      setDoctors(prev => prev.map(d => d.id === doc.id ? { ...d, is_available: !d.is_available } : d));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = doctors.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return d.user_name?.toLowerCase().includes(q) || d.specialization_name?.toLowerCase().includes(q) || d.hospital_name?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/admin/dashboard')} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Stethoscope className="h-6 w-6 text-green-600 mr-2" />
          <h1 className="text-lg font-semibold">Shifokorlar</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">{doctors.length}</p>
            <p className="text-sm text-gray-500">Jami shifokorlar</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-600">{doctors.filter(d => d.is_available).length}</p>
            <p className="text-sm text-gray-500">Bo'sh</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {(doctors.reduce((sum, d) => sum + parseFloat(d.rating || '0'), 0) / doctors.length || 0).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500">O'rtacha reyting</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Shifokor qidirish..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center"><Loader2 className="h-10 w-10 text-green-600 animate-spin mx-auto" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl">👨‍⚕️</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{doc.user_name}</h3>
                    <p className="text-sm text-green-600">{doc.specialization_name}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />{doc.hospital_name}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center"><Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />{doc.rating}</span>
                    <span>{doc.experience_years} yil</span>
                  </div>
                  <span className="font-semibold text-green-600">{Number(doc.consultation_price).toLocaleString()} so'm</span>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${doc.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {doc.is_available ? 'Bo\'sh' : 'Band'}
                  </span>
                  <button onClick={() => toggleAvailability(doc)} disabled={actionLoading === doc.id}
                    className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                      doc.is_available ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}>
                    {doc.is_available ? <><XCircle className="h-4 w-4 mr-1" />Band qilish</> : <><CheckCircle className="h-4 w-4 mr-1" />Faollashtirish</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center">
            <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Shifokor topilmadi</p>
          </div>
        )}
      </main>
    </div>
  );
}