// src/pages/Hospitals.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, MapPin, Star, Clock, Phone,
  Navigation, Filter, Building2, Pill, FlaskConical,
  Stethoscope, ChevronRight, X
} from 'lucide-react';
import apiClient from '../api/client';

interface Hospital {
  id: number;
  name: string;
  hospital_type: string;
  type_display: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  rating: number;
  reviews_count: number;
  is_24_hours: boolean;
  working_hours?: string;
  distance: number;
  specializations: string[];
  image_url?: string;
}

const HOSPITAL_TYPES = [
  { id: 'all', name: 'Barchasi', icon: Building2 },
  { id: 'hospital', name: 'Kasalxona', icon: Building2 },
  { id: 'clinic', name: 'Klinika', icon: Stethoscope },
  { id: 'pharmacy', name: 'Dorixona', icon: Pill },
  { id: 'laboratory', name: 'Laboratoriya', icon: FlaskConical },
];

export default function Hospitals() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  useEffect(() => {
    fetchHospitals();
  }, [selectedType, sortBy]);

  const fetchHospitals = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      params.append('sort', sortBy);

      const res = await apiClient.get(`/api/hospitals/?${params}`);
      setHospitals(res.data.hospitals || []);
    } catch (error) {
      // Demo data
      setHospitals([
        {
          id: 1,
          name: 'Toshkent Tibbiyot Akademiyasi Klinikasi',
          hospital_type: 'hospital',
          type_display: 'Kasalxona',
          address: 'Toshkent sh., Almazar tumani, Farobiy ko\'chasi 2',
          city: 'Toshkent',
          latitude: 41.311081,
          longitude: 69.279737,
          phone: '+998 71 268 50 00',
          rating: 4.5,
          reviews_count: 128,
          is_24_hours: true,
          distance: 2.5,
          specializations: ['Kardiologiya', 'Nevrologiya', 'Terapiya'],
        },
        {
          id: 2,
          name: 'Premium Med Clinic',
          hospital_type: 'clinic',
          type_display: 'Klinika',
          address: 'Toshkent sh., Yunusobod tumani, Amir Temur ko\'chasi 88',
          city: 'Toshkent',
          latitude: 41.350000,
          longitude: 69.300000,
          phone: '+998 71 200 00 00',
          rating: 4.8,
          reviews_count: 89,
          is_24_hours: false,
          working_hours: '08:00 - 20:00',
          distance: 3.1,
          specializations: ['UZI', 'Laboratoriya', 'Terapiya'],
        },
        {
          id: 3,
          name: 'Dori-Darmon Dorixonasi',
          hospital_type: 'pharmacy',
          type_display: 'Dorixona',
          address: 'Toshkent sh., Mirzo Ulug\'bek tumani',
          city: 'Toshkent',
          latitude: 41.340000,
          longitude: 69.285000,
          phone: '+998 71 255 55 55',
          rating: 4.3,
          reviews_count: 45,
          is_24_hours: true,
          distance: 1.2,
          specializations: ['Dorilar', 'Tibbiy anjomlar'],
        },
        {
          id: 4,
          name: 'Invitro Laboratoriyasi',
          hospital_type: 'laboratory',
          type_display: 'Laboratoriya',
          address: 'Toshkent sh., Chilonzor tumani',
          city: 'Toshkent',
          latitude: 41.285000,
          longitude: 69.205000,
          phone: '+998 71 150 00 00',
          rating: 4.6,
          reviews_count: 167,
          is_24_hours: false,
          working_hours: '07:00 - 19:00',
          distance: 5.5,
          specializations: ['Qon tahlili', 'Genetik testlar'],
        },
        {
          id: 5,
          name: 'Respublika Shoshilinch Tibbiy Yordam Markazi',
          hospital_type: 'hospital',
          type_display: 'Kasalxona',
          address: 'Toshkent sh., Shayxontohur tumani',
          city: 'Toshkent',
          latitude: 41.328650,
          longitude: 69.255889,
          phone: '+998 71 277 09 05',
          rating: 4.7,
          reviews_count: 256,
          is_24_hours: true,
          distance: 4.2,
          specializations: ['Travmatologiya', 'Reanimatologiya', 'Jarrohlik'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital': return Building2;
      case 'clinic': return Stethoscope;
      case 'pharmacy': return Pill;
      case 'laboratory': return FlaskConical;
      default: return Building2;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'bg-blue-100 text-blue-600';
      case 'clinic': return 'bg-green-100 text-green-600';
      case 'pharmacy': return 'bg-purple-100 text-purple-600';
      case 'laboratory': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const openInMaps = (hospital: Hospital) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`;
    window.open(url, '_blank');
  };

  const callPhone = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center mb-3">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Kasalxonalar</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2 max-w-lg mx-auto">
            {HOSPITAL_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    selectedType === type.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {type.name}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Sort */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">{filteredHospitals.length} ta topildi</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('distance')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                sortBy === 'distance' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Yaqinlik
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                sortBy === 'rating' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Reyting
            </button>
          </div>
        </div>

        {/* Hospital List */}
        <div className="space-y-3">
          {filteredHospitals.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Topilmadi</h3>
              <p className="text-gray-500 mt-1">Boshqa so'rov bilan qidirib ko'ring</p>
            </div>
          ) : (
            filteredHospitals.map(hospital => {
              const TypeIcon = getTypeIcon(hospital.hospital_type);
              return (
                <div
                  key={hospital.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setSelectedHospital(hospital)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-3 ${getTypeColor(hospital.hospital_type)}`}>
                        <TypeIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900 pr-2">{hospital.name}</h3>
                          <div className="flex items-center text-yellow-500 shrink-0">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="ml-1 text-sm font-medium">{hospital.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 truncate">{hospital.address}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center text-xs text-gray-500">
                            <Navigation className="h-3 w-3 mr-1" />
                            {hospital.distance} km
                          </span>
                          {hospital.is_24_hours ? (
                            <span className="flex items-center text-xs text-green-600">
                              <Clock className="h-3 w-3 mr-1" />
                              24 soat
                            </span>
                          ) : hospital.working_hours && (
                            <span className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {hospital.working_hours}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {hospital.specializations.slice(0, 3).map((spec, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Quick Actions */}
                  <div className="flex border-t">
                    <button
                      onClick={() => callPhone(hospital.phone)}
                      className="flex-1 flex items-center justify-center py-3 text-blue-600 hover:bg-blue-50"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Qo'ng'iroq</span>
                    </button>
                    <div className="w-px bg-gray-200" />
                    <button
                      onClick={() => openInMaps(hospital)}
                      className="flex-1 flex items-center justify-center py-3 text-green-600 hover:bg-green-50"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Xaritada</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <HospitalDetailModal
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
          onCall={callPhone}
          onMap={openInMaps}
        />
      )}
    </div>
  );
}

function HospitalDetailModal({
  hospital,
  onClose,
  onCall,
  onMap
}: {
  hospital: Hospital;
  onClose: () => void;
  onCall: (phone: string) => void;
  onMap: (hospital: Hospital) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-96 sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Tafsilotlar</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Info */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{hospital.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{hospital.type_display}</p>
            <div className="flex items-center justify-center mt-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="ml-1 font-semibold">{hospital.rating}</span>
              <span className="text-gray-400 ml-1">({hospital.reviews_count} sharh)</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-gray-50 rounded-xl">
              <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Manzil</p>
                <p className="text-sm text-gray-500">{hospital.address}</p>
              </div>
            </div>

            <div className="flex items-start p-3 bg-gray-50 rounded-xl">
              <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Ish vaqti</p>
                <p className="text-sm text-gray-500">
                  {hospital.is_24_hours ? '24 soat ochiq' : hospital.working_hours || 'Noma\'lum'}
                </p>
              </div>
            </div>

            <div className="flex items-start p-3 bg-gray-50 rounded-xl">
              <Phone className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Telefon</p>
                <p className="text-sm text-gray-500">{hospital.phone}</p>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Xizmatlar</p>
            <div className="flex flex-wrap gap-2">
              {hospital.specializations.map((spec, i) => (
                <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onCall(hospital.phone)}
              className="flex-1 flex items-center justify-center py-3 bg-blue-600 text-white rounded-xl font-medium"
            >
              <Phone className="h-5 w-5 mr-2" />
              Qo'ng'iroq
            </button>
            <button
              onClick={() => onMap(hospital)}
              className="flex-1 flex items-center justify-center py-3 bg-green-600 text-white rounded-xl font-medium"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Yo'nalish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}