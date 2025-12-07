// src/pages/Doctors.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Search, Star, MapPin,
  ChevronRight, X, SlidersHorizontal,
  Stethoscope, Award, Calendar
} from 'lucide-react';
import apiClient from '../api/client';

interface Doctor {
  id: string;
  user_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  specialization?: string;
  specialty_display?: string;
  specialization_name?: string;
  hospital_name?: string;
  hospital?: string;
  experience_years: number;
  consultation_fee?: number;
  consultation_price?: string;
  rating: number | string;
  bio?: string;
  is_available: boolean;
}

interface Specialization {
  id: number;
  name: string;
  name_uz?: string;
  icon?: string;
}

// Demo shifokorlar - API ishlamasa ishlatiladi
const demoDoctors: Doctor[] = [
  {
    id: '1',
    first_name: 'Akbar',
    last_name: 'Karimov',
    email: 'dr.karimov@healthhub.uz',
    phone: '+998901234567',
    specialty: 'cardiology',
    specialty_display: 'Kardiolog',
    hospital_name: 'Toshkent Tibbiyot Markazi',
    experience_years: 15,
    consultation_fee: 150000,
    rating: 4.9,
    bio: 'Yurak-qon tomir kasalliklari bo\'yicha 15 yillik tajriba. 500+ muvaffaqiyatli operatsiya.',
    is_available: true
  },
  {
    id: '2',
    first_name: 'Malika',
    last_name: 'Rahimova',
    email: 'dr.rahimova@healthhub.uz',
    phone: '+998907654321',
    specialty: 'neurology',
    specialty_display: 'Nevrolog',
    hospital_name: 'Respublika Ixtisoslashtirilgan Markazi',
    experience_years: 12,
    consultation_fee: 120000,
    rating: 4.8,
    bio: 'Asab tizimi kasalliklari mutaxassisi. Bosh og\'rig\'i va migren davolash bo\'yicha ekspert.',
    is_available: true
  },
  {
    id: '3',
    first_name: 'Bobur',
    last_name: 'Alimov',
    email: 'dr.alimov@healthhub.uz',
    phone: '+998901112233',
    specialty: 'pediatrics',
    specialty_display: 'Pediatr',
    hospital_name: 'Bolalar Shifoxonasi №1',
    experience_years: 8,
    consultation_fee: 100000,
    rating: 4.7,
    bio: 'Bolalar salomatligi bo\'yicha mutaxassis. Emlash va rivojlanish kuzatuvi.',
    is_available: false
  },
  {
    id: '4',
    first_name: 'Nilufar',
    last_name: 'Saidova',
    email: 'dr.saidova@healthhub.uz',
    phone: '+998905556677',
    specialty: 'dermatology',
    specialty_display: 'Dermatolog',
    hospital_name: 'Derma Klinika',
    experience_years: 6,
    consultation_fee: 80000,
    rating: 4.6,
    bio: 'Teri kasalliklari va kosmetologiya. Akne, ekzema va psoriaz davolash.',
    is_available: true
  },
  {
    id: '5',
    first_name: 'Jasur',
    last_name: 'Toshmatov',
    email: 'dr.toshmatov@healthhub.uz',
    phone: '+998909998877',
    specialty: 'orthopedics',
    specialty_display: 'Ortoped-travmatolog',
    hospital_name: 'Travmatologiya Markazi',
    experience_years: 10,
    consultation_fee: 130000,
    rating: 4.5,
    bio: 'Suyak-bo\'g\'im kasalliklari va jarohatlar. Sport travmalari mutaxassisi.',
    is_available: true
  },
  {
    id: '6',
    first_name: 'Gulnora',
    last_name: 'Azimova',
    email: 'dr.azimova@healthhub.uz',
    phone: '+998903334455',
    specialty: 'gynecology',
    specialty_display: 'Ginekolog',
    hospital_name: 'Ayollar Sog\'ligi Markazi',
    experience_years: 14,
    consultation_fee: 140000,
    rating: 4.9,
    bio: 'Ayollar sog\'lig\'i va homiladorlik kuzatuvi. 1000+ muvaffaqiyatli tug\'ruq.',
    is_available: true
  },
  {
    id: '7',
    first_name: 'Sardor',
    last_name: 'Mahmudov',
    email: 'dr.mahmudov@healthhub.uz',
    phone: '+998906667788',
    specialty: 'ophthalmology',
    specialty_display: 'Oftalmolog',
    hospital_name: 'Ko\'z Kasalliklari Markazi',
    experience_years: 9,
    consultation_fee: 110000,
    rating: 4.7,
    bio: 'Ko\'z kasalliklari va ko\'rish tiklash. Lazer korreksiya mutaxassisi.',
    is_available: true
  },
  {
    id: '8',
    first_name: 'Timur',
    last_name: 'Yusupov',
    email: 'dr.yusupov@healthhub.uz',
    phone: '+998901122334',
    specialty: 'dentistry',
    specialty_display: 'Stomatolog',
    hospital_name: 'Dental Pro Klinika',
    experience_years: 7,
    consultation_fee: 90000,
    rating: 4.8,
    bio: 'Tish davolash va protezlash. Implantatsiya va estetik stomatologiya.',
    is_available: true
  },
  {
    id: '9',
    first_name: 'Dilshod',
    last_name: 'Rasulov',
    email: 'dr.rasulov@healthhub.uz',
    phone: '+998904445566',
    specialty: 'general',
    specialty_display: 'Umumiy amaliyot shifokori',
    hospital_name: 'Oilaviy Poliklinika №5',
    experience_years: 11,
    consultation_fee: 70000,
    rating: 4.5,
    bio: 'Umumiy tibbiy maslahat va profilaktika. Oilaviy tibbiyot mutaxassisi.',
    is_available: true
  },
  {
    id: '10',
    first_name: 'Zarina',
    last_name: 'Karimova',
    email: 'dr.zkarimova@healthhub.uz',
    phone: '+998907778899',
    specialty: 'endocrinology',
    specialty_display: 'Endokrinolog',
    hospital_name: 'Endokrinologiya Dispanseri',
    experience_years: 13,
    consultation_fee: 125000,
    rating: 4.8,
    bio: 'Qalqonsimon bez va diabet kasalliklari. Gormon tizimi mutaxassisi.',
    is_available: true
  }
];

// Demo mutaxassisliklar
const demoSpecializations: Specialization[] = [
  { id: 1, name: 'cardiology', name_uz: 'Kardiolog', icon: '❤️' },
  { id: 2, name: 'neurology', name_uz: 'Nevrolog', icon: '🧠' },
  { id: 3, name: 'pediatrics', name_uz: 'Pediatr', icon: '👶' },
  { id: 4, name: 'dermatology', name_uz: 'Dermatolog', icon: '🩹' },
  { id: 5, name: 'orthopedics', name_uz: 'Ortoped', icon: '🦴' },
  { id: 6, name: 'gynecology', name_uz: 'Ginekolog', icon: '👩' },
  { id: 7, name: 'ophthalmology', name_uz: 'Oftalmolog', icon: '👁️' },
  { id: 8, name: 'dentistry', name_uz: 'Stomatolog', icon: '🦷' },
  { id: 9, name: 'general', name_uz: 'Umumiy amaliyot', icon: '🩺' },
  { id: 10, name: 'endocrinology', name_uz: 'Endokrinolog', icon: '💉' },
];

export default function Doctors() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>(demoSpecializations);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState<string | null>(
    searchParams.get('specialization') || null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedSpec) {
      setSearchParams({ specialization: selectedSpec });
    } else {
      setSearchParams({});
    }
  }, [selectedSpec, setSearchParams]);

  const loadData = async () => {
    setLoading(true);

    try {
      // Shifokorlarni yuklash - bir necha endpoint sinab ko'ramiz
      let doctorsList: Doctor[] = [];

      // 1-urinish: /api/doctors/
      try {
        const res = await apiClient.get('/api/doctors/');
        const data = res.data;
        doctorsList = Array.isArray(data) ? data : (data.results || data.doctors || []);
        console.log('✅ /api/doctors/ dan yuklandi:', doctorsList.length);
      } catch (e) {
        console.log('⚠️ /api/doctors/ ishlamadi');
      }

      // 2-urinish: /api/doctors/doctors/
      if (doctorsList.length === 0) {
        try {
          const res = await apiClient.get('/api/doctors/doctors/');
          const data = res.data;
          doctorsList = Array.isArray(data) ? data : (data.results || []);
          console.log('✅ /api/doctors/doctors/ dan yuklandi:', doctorsList.length);
        } catch (e) {
          console.log('⚠️ /api/doctors/doctors/ ishlamadi');
        }
      }

      // 3-urinish: /api/doctors/list/
      if (doctorsList.length === 0) {
        try {
          const res = await apiClient.get('/api/doctors/list/');
          const data = res.data;
          doctorsList = Array.isArray(data) ? data : (data.results || []);
          console.log('✅ /api/doctors/list/ dan yuklandi:', doctorsList.length);
        } catch (e) {
          console.log('⚠️ /api/doctors/list/ ishlamadi');
        }
      }

      // Agar API dan bo'sh kelsa, demo data ishlatamiz
      if (doctorsList.length === 0) {
        console.log('📋 Demo shifokorlar ishlatilmoqda');
        doctorsList = demoDoctors;
      }

      setDoctors(doctorsList);

      // Mutaxassisliklarni yuklash
      try {
        const specsRes = await apiClient.get('/api/doctors/specializations/');
        const specsData = specsRes.data;
        const specsList = Array.isArray(specsData) ? specsData : (specsData.results || []);
        if (specsList.length > 0) {
          setSpecializations(specsList);
        }
      } catch (e) {
        // Demo ishlatamiz
        console.log('📋 Demo mutaxassisliklar ishlatilmoqda');
      }

    } catch (err) {
      console.error('❌ Yuklashda xatolik:', err);
      setDoctors(demoDoctors);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getDoctorName = (doctor: Doctor): string => {
    if (doctor.user_name) return doctor.user_name;
    if (doctor.first_name && doctor.last_name) return `${doctor.first_name} ${doctor.last_name}`;
    if (doctor.first_name) return doctor.first_name;
    return 'Shifokor';
  };

  const getSpecialtyName = (doctor: Doctor): string => {
    return doctor.specialty_display || doctor.specialization_name || doctor.specialty || doctor.specialization || 'Umumiy amaliyot';
  };

  const getPrice = (doctor: Doctor): number => {
    if (doctor.consultation_fee) return Number(doctor.consultation_fee);
    if (doctor.consultation_price) return Number(doctor.consultation_price);
    return 100000;
  };

  const getHospitalName = (doctor: Doctor): string => {
    return doctor.hospital_name || doctor.hospital || 'Tibbiyot markazi';
  };

  const getDoctorSpecialty = (doctor: Doctor): string => {
    return doctor.specialty || doctor.specialization || '';
  };

  // Filter and sort doctors
  const filteredDoctors = doctors
    .filter(doc => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = getDoctorName(doc).toLowerCase();
        const specialty = getSpecialtyName(doc).toLowerCase();
        const hospital = getHospitalName(doc).toLowerCase();

        if (!name.includes(query) && !specialty.includes(query) && !hospital.includes(query)) {
          return false;
        }
      }

      if (selectedSpec) {
        const docSpec = getDoctorSpecialty(doc).toLowerCase();
        if (docSpec !== selectedSpec.toLowerCase()) {
          return false;
        }
      }

      if (onlyAvailable && !doc.is_available) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return Number(b.rating) - Number(a.rating);
        case 'experience':
          return (b.experience_years || 0) - (a.experience_years || 0);
        case 'price_low':
          return getPrice(a) - getPrice(b);
        case 'price_high':
          return getPrice(b) - getPrice(a);
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSelectedSpec(null);
    setSearchQuery('');
    setOnlyAvailable(false);
    setSortBy('rating');
  };

  const hasActiveFilters = selectedSpec || searchQuery || onlyAvailable || sortBy !== 'rating';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Shifokorlar</h1>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Shifokor, mutaxassislik yoki shifoxona qidirish..."
              className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Specializations */}
        <div className="mb-4 overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSpec(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !selectedSpec
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              🏥 Hammasi
            </button>
            {specializations.map((spec) => (
              <button
                key={spec.id}
                onClick={() => setSelectedSpec(spec.name)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedSpec === spec.name
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <span className="mr-1.5">{spec.icon || '🩺'}</span>
                {spec.name_uz || spec.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filterlar</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Tozalash
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Saralash</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating">⭐ Reyting bo'yicha</option>
                  <option value="experience">📅 Tajriba bo'yicha</option>
                  <option value="price_low">💰 Narx (arzon)</option>
                  <option value="price_high">💎 Narx (qimmat)</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer p-3 bg-gray-50 rounded-xl w-full">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Faqat bo'sh</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filteredDoctors.length}</span> ta shifokor topildi
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
              Tozalash
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Shifokor topilmadi</h3>
            <p className="text-gray-500 mb-6">Boshqa qidiruv sinab ko'ring</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
            >
              Filterlarni tozalash
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <Link
                key={doctor.id}
                to={`/doctors/${doctor.id}/book`}
                className="block bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <div className="p-5">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200/50">
                        <span className="text-3xl text-white font-bold">
                          {getDoctorName(doctor).charAt(0)}
                        </span>
                      </div>
                      {doctor.is_available && (
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                            Dr. {getDoctorName(doctor)}
                          </h3>
                          <p className="text-blue-600 font-medium">{getSpecialtyName(doctor)}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          doctor.is_available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {doctor.is_available ? '✓ Bo\'sh' : '✗ Band'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <span className="flex items-center text-sm">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-400 mr-1" />
                          <span className="font-semibold text-gray-900">{doctor.rating}</span>
                        </span>
                        <span className="flex items-center text-sm text-gray-600">
                          <Award className="h-4 w-4 text-purple-500 mr-1" />
                          {doctor.experience_years || 0} yil
                        </span>
                      </div>

                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                        {getHospitalName(doctor)}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {doctor.bio && (
                    <p className="mt-4 text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded-xl">
                      {doctor.bio}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Konsultatsiya</p>
                      <p className="text-green-600 font-bold text-xl">
                        {getPrice(doctor).toLocaleString()} <span className="text-sm font-normal">so'm</span>
                      </p>
                    </div>
                    <span className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium group-hover:bg-blue-700 transition-colors">
                      <Calendar className="h-4 w-4 mr-2" />
                      Navbat olish
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="h-20"></div>
      </main>
    </div>
  );
}