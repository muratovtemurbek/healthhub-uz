import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Star, Clock, MapPin, Filter } from 'lucide-react';
import apiClient from '../api/client';

const parseApiResponse = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

export default function Doctors() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState(searchParams.get('specialization') || '');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docsRes, specsRes] = await Promise.all([
        apiClient.get('/api/doctors/doctors/'),
        apiClient.get('/api/doctors/specializations/')
      ]);
      console.log('Doctors:', docsRes.data);
      console.log('Specs:', specsRes.data);
      setDoctors(parseApiResponse(docsRes.data));
      setSpecializations(parseApiResponse(specsRes.data));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch =
      (doc.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (doc.specialization_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesSpec = !selectedSpec || doc.specialization_id === selectedSpec;
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Shifokorlar</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Shifokor qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
              className="px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Barcha mutaxassisliklar</option>
              {specializations.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name_uz || spec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <p className="text-gray-600 mb-4">{filteredDoctors.length} ta shifokor topildi</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">Shifokorlar topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doctor) => (
              <Link
                key={doctor.id}
                to={`/book-appointment/${doctor.id}`}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">👨‍⚕️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{doctor.user_name}</h3>
                    <p className="text-sm text-blue-600">{doctor.specialization_name}</p>
                    <p className="text-sm text-gray-500 truncate">{doctor.hospital_name}</p>

                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                        <span className="text-sm text-gray-600 ml-1">{doctor.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 ml-1">{doctor.experience_years} yil</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-green-600 font-semibold">
                        {Number(doctor.consultation_price).toLocaleString()} so'm
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        doctor.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.is_available ? 'Bo\'sh' : 'Band'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}