// src/pages/BookAppointment.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, MapPin, Clock, Calendar,
  Award, CheckCircle, User, CreditCard, AlertCircle, Loader2
} from 'lucide-react';
import api from '../services/api';

interface Doctor {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  specialization?: string;
  specialty_display?: string;
  hospital_name?: string;
  hospital?: { name: string } | string;
  experience_years: number;
  consultation_fee?: number;
  consultation_price?: number;
  rating: number;
  bio?: string;
  is_available: boolean;
  languages?: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

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
    if (selectedDate && doctorId) {
      fetchTimeSlots(selectedDate);
      setSelectedTime('');
    }
  }, [selectedDate, doctorId]);

  const fetchDoctor = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/doctors/list/${doctorId}/`);
      setDoctor(res.data);
    } catch (err) {
      console.error('Shifokor yuklashda xatolik:', err);
      setError('Shifokor topilmadi');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (date: string) => {
    try {
      const res = await api.get(`/appointments/slots/${doctorId}/`, {
        params: { date }
      });
      setTimeSlots(res.data);
    } catch (err) {
      console.error('Vaqtlarni yuklashda xatolik:', err);
      // Fallback: generate default slots
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour <= 17; hour++) {
        slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, available: true });
        if (hour < 17) {
          slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, available: true });
        }
      }
      setTimeSlots(slots);
    }
  };

  const getDoctorName = (): string => {
    if (!doctor) return '';
    if (doctor.name) return doctor.name.replace('Dr. ', '');
    return `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() || 'Shifokor';
  };

  const getPrice = (): number => doctor?.consultation_fee || doctor?.consultation_price || 100000;

  const getSpecialty = (): string => {
    return doctor?.specialty_display || doctor?.specialization || 'Mutaxassis';
  };

  const getHospitalName = (): string => {
    if (!doctor?.hospital) return 'Tibbiyot markazi';
    if (typeof doctor.hospital === 'string') return doctor.hospital;
    return doctor.hospital.name || 'Tibbiyot markazi';
  };

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
      await api.post('/appointments/appointments/', {
        doctor: doctorId,
        date: selectedDate,
        time: selectedTime,
        reason: reason || 'Konsultatsiya'
      });
      setBookingSuccess(true);
    } catch (err: any) {
      console.error('Booking xatosi:', err);
      if (err.response?.status === 401) {
        setError('Navbatga yozilish uchun tizimga kiring');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      }
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
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
              <p className="text-blue-600 font-medium">{getSpecialty()}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center"><Star className="h-4 w-4 text-yellow-500 fill-yellow-400 mr-1" />{doctor.rating}</span>
                <span className="flex items-center"><Award className="h-4 w-4 text-purple-500 mr-1" />{doctor.experience_years} yil</span>
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />{getHospitalName()}
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