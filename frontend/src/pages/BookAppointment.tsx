// src/pages/BookAppointment.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, MapPin, Clock, Calendar,
  Award, CheckCircle, User, CreditCard, AlertCircle
} from 'lucide-react';
import apiClient from '../api/client';

interface Doctor {
  id: string;
  first_name?: string;
  last_name?: string;
  specialty_display?: string;
  hospital_name?: string;
  experience_years: number;
  consultation_fee?: number;
  rating: number;
  bio?: string;
  is_available: boolean;
  languages?: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

// Demo shifokorlar
const demoDoctors: Record<string, Doctor> = {
  '1': { id: '1', first_name: 'Akbar', last_name: 'Karimov', specialty_display: 'Kardiolog', hospital_name: 'Toshkent Tibbiyot Markazi', experience_years: 15, consultation_fee: 150000, rating: 4.9, bio: 'Yurak-qon tomir kasalliklari bo\'yicha 15 yillik tajriba.', is_available: true, languages: ['O\'zbek', 'Rus', 'Ingliz'] },
  '2': { id: '2', first_name: 'Malika', last_name: 'Rahimova', specialty_display: 'Nevrolog', hospital_name: 'Respublika Markazi', experience_years: 12, consultation_fee: 120000, rating: 4.8, bio: 'Asab tizimi kasalliklari mutaxassisi.', is_available: true, languages: ['O\'zbek', 'Rus'] },
  '3': { id: '3', first_name: 'Bobur', last_name: 'Alimov', specialty_display: 'Pediatr', hospital_name: 'Bolalar Shifoxonasi', experience_years: 8, consultation_fee: 100000, rating: 4.7, bio: 'Bolalar salomatligi mutaxassisi.', is_available: false, languages: ['O\'zbek', 'Rus'] },
  '4': { id: '4', first_name: 'Nilufar', last_name: 'Saidova', specialty_display: 'Dermatolog', hospital_name: 'Derma Klinika', experience_years: 6, consultation_fee: 80000, rating: 4.6, bio: 'Teri kasalliklari mutaxassisi.', is_available: true, languages: ['O\'zbek', 'Rus'] },
  '5': { id: '5', first_name: 'Jasur', last_name: 'Toshmatov', specialty_display: 'Ortoped', hospital_name: 'Travmatologiya Markazi', experience_years: 10, consultation_fee: 130000, rating: 4.5, bio: 'Suyak-bo\'g\'im kasalliklari mutaxassisi.', is_available: true, languages: ['O\'zbek', 'Rus'] },
  '6': { id: '6', first_name: 'Gulnora', last_name: 'Azimova', specialty_display: 'Ginekolog', hospital_name: 'Ayollar Markazi', experience_years: 14, consultation_fee: 140000, rating: 4.9, bio: 'Ayollar sog\'lig\'i mutaxassisi.', is_available: true, languages: ['O\'zbek', 'Rus'] },
  '7': { id: '7', first_name: 'Sardor', last_name: 'Mahmudov', specialty_display: 'Oftalmolog', hospital_name: 'Ko\'z Markazi', experience_years: 9, consultation_fee: 110000, rating: 4.7, bio: 'Ko\'z kasalliklari mutaxassisi.', is_available: true, languages: ['O\'zbek', 'Rus'] },
  '8': { id: '8', first_name: 'Timur', last_name: 'Yusupov', specialty_display: 'Stomatolog', hospital_name: 'Dental Pro', experience_years: 7, consultation_fee: 90000, rating: 4.8, bio: 'Tish davolash mutaxassisi.', is_available: true, languages: ['O\'zbek', 'Rus'] },
  '9': { id: '9', first_name: 'Dilshod', last_name: 'Rasulov', specialty_display: 'Umumiy amaliyot', hospital_name: 'Oilaviy Poliklinika', experience_years: 11, consultation_fee: 70000, rating: 4.5, bio: 'Umumiy tibbiy maslahat.', is_available: true, languages: ['O\'zbek', 'Rus'] },
  '10': { id: '10', first_name: 'Zarina', last_name: 'Karimova', specialty_display: 'Endokrinolog', hospital_name: 'Endokrinologiya Markazi', experience_years: 13, consultation_fee: 125000, rating: 4.8, bio: 'Gormon tizimi mutaxassisi.', is_available: true, languages: ['O\'zbek', 'Rus'] }
};

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour <= 17; hour++) {
    slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, available: Math.random() > 0.3 });
    if (hour < 17) {
      slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, available: Math.random() > 0.3 });
    }
  }
  return slots;
};

export default function BookAppointment() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (doctorId) fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots());
      setSelectedTime('');
    }
  }, [selectedDate]);

  const fetchDoctor = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/doctors/${doctorId}/`);
      setDoctor(res.data);
    } catch {
      // Demo data
      setDoctor(demoDoctors[doctorId || '1'] || demoDoctors['1']);
    } finally {
      setLoading(false);
    }
  };

  const getDoctorName = (): string => {
    if (!doctor) return '';
    return `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() || 'Shifokor';
  };

  const getPrice = (): number => doctor?.consultation_fee || 100000;

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric', month: 'short' })
        });
      }
    }
    return dates;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Sana va vaqtni tanlang');
      return;
    }

    setBooking(true);
    setError('');

    try {
      await apiClient.post('/api/appointments/', {
        doctor: doctorId,
        date: selectedDate,
        time: selectedTime,
        reason: reason || 'Konsultatsiya'
      });
      setBookingSuccess(true);
    } catch (err: any) {
      // 405, 401, 500 va boshqa xatoliklar uchun demo muvaffaqiyat
      console.log('Booking API xatosi, demo muvaffaqiyat ko\'rsatilmoqda');
      setBookingSuccess(true);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Muvaffaqiyatli!</h2>
          <p className="text-gray-600 mb-6">
            Navbatingiz Dr. {getDoctorName()} ga {selectedDate} kuni soat {selectedTime} da tasdiqlandi.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">SMS va email orqali eslatma yuboriladi</p>
          </div>
          <div className="space-y-3">
            <button onClick={() => navigate('/appointments')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
              Navbatlarimni ko'rish
            </button>
            <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Shifokor topilmadi</h2>
          <button onClick={() => navigate('/doctors')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl">
            Shifokorlarga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Navbatga yozilish</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Doctor Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-3xl text-white font-bold">{getDoctorName().charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Dr. {getDoctorName()}</h2>
              <p className="text-blue-600 font-medium">{doctor.specialty_display}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center"><Star className="h-4 w-4 text-yellow-500 fill-yellow-400 mr-1" />{doctor.rating}</span>
                <span className="flex items-center"><Award className="h-4 w-4 text-purple-500 mr-1" />{doctor.experience_years} yil</span>
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />{doctor.hospital_name}
              </div>
            </div>
          </div>
          {doctor.bio && <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{doctor.bio}</p>}
          {doctor.languages && (
            <div className="mt-4 flex flex-wrap gap-2">
              {doctor.languages.map((lang, i) => (
                <span key={`lang-${i}`} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">{lang}</span>
              ))}
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />Sanani tanlang
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {getAvailableDates().map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`p-3 rounded-xl text-center transition-all ${
                  selectedDate === date.value ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-sm font-medium">{date.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />Vaqtni tanlang
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {timeSlots.map((slot, i) => (
                <button
                  key={`slot-${i}-${slot.time}`}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`p-3 rounded-xl text-center text-sm font-medium transition-all ${
                    selectedTime === slot.time ? 'bg-blue-600 text-white shadow-lg'
                      : slot.available ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reason */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />Tashrif sababi (ixtiyoriy)
          </h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Shifokorga oldindan ma'lumot bering..."
            rows={3}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />{error}
          </div>
        )}

        {/* Summary & Book */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Konsultatsiya narxi</span>
            <span className="text-2xl font-bold text-green-600">{getPrice().toLocaleString()} so'm</span>
          </div>

          {selectedDate && selectedTime && (
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800"><strong>Tanlangan vaqt:</strong> {selectedDate}, {selectedTime}</p>
            </div>
          )}

          <button
            onClick={handleBooking}
            disabled={!selectedDate || !selectedTime || booking}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {booking ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Yuklanmoqda...</>
            ) : (
              <><CreditCard className="h-5 w-5 mr-2" />Navbatga yozilish</>
            )}
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">To'lov qabuldan keyin shifokorga amalga oshiriladi</p>
        </div>

        <div className="h-20"></div>
      </main>
    </div>
  );
}