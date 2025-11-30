// src/pages/BookAppointment.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, User, MapPin,
  Star, Loader2, CheckCircle, AlertCircle,
  Phone, Mail, Award, CreditCard
} from 'lucide-react';
import apiClient from '../api/client';

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  specialty_display: string;
  experience_years: number;
  rating: number;
  consultation_fee: number;
  photo: string | null;
  hospital_name: string;
  bio: string;
  phone: string;
  email: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');

  // Generate dates (next 14 days)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() !== 0) { // Skip Sundays
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric', month: 'short' })
        });
      }
    }
    return dates;
  };

  const dates = generateDates();

  // Time slots
  const timeSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: true },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: true },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
  ];

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const response = await apiClient.get(`/api/doctors/${doctorId}/`);
      setDoctor(response.data);
    } catch (err) {
      console.error('Fetch doctor error:', err);
      setError('Shifokor topilmadi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Sana va vaqtni tanlang');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await apiClient.post('/api/appointments/', {
        doctor: doctorId,
        date: selectedDate,
        time: selectedTime,
        reason: reason || 'Konsultatsiya',
        payment_status: 'pending'
      });

      // TO'LOV SAHIFASIGA YO'NALTIRISH
      navigate('/payment', {
        state: {
          amount: doctor?.consultation_fee || 150000,
          appointmentId: response.data.id,
          doctorName: doctor?.full_name || 'Shifokor',
          serviceName: 'Konsultatsiya'
        }
      });

    } catch (err: any) {
      console.error('Book appointment error:', err);
      setError(err.response?.data?.error || 'Qabulga yozishda xatolik');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Shifokor topilmadi</h2>
          <Link to="/doctors" className="text-blue-600 hover:underline">
            Shifokorlar royxatiga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Qabulga yozilish</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-32">
        {/* Doctor Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              {doctor.photo ? (
                <img src={doctor.photo} alt={doctor.full_name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <User className="h-10 w-10 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{doctor.full_name}</h2>
              <p className="text-blue-600 font-medium">{doctor.specialty_display}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  {doctor.experience_years} yil tajriba
                </span>
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  {doctor.rating}
                </span>
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                {doctor.hospital_name}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Konsultatsiya narxi:</span>
              <span className="text-2xl font-bold text-blue-600">
                {(doctor.consultation_fee || 150000).toLocaleString()} UZS
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Date Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Sanani tanlang
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {dates.map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`p-3 rounded-xl text-center transition-all ${
                  selectedDate === date.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <p className="text-xs">{date.label.split(' ')[0]}</p>
                <p className="font-semibold">{date.label.split(' ').slice(1).join(' ')}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Vaqtni tanlang
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
                className={`p-3 rounded-xl text-center font-medium transition-all ${
                  selectedTime === slot.time
                    ? 'bg-blue-600 text-white'
                    : slot.available
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Murojaat sababi (ixtiyoriy)
          </h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Shifokorga oldindan xabar berish uchun..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Summary & Book Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            {selectedDate && selectedTime && (
              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="text-gray-600">
                  <span className="font-medium text-gray-900">{doctor.full_name}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedDate}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="flex items-center text-blue-600">
                  <CreditCard className="h-4 w-4 mr-1" />
                  <span className="font-semibold">{(doctor.consultation_fee || 150000).toLocaleString()} UZS</span>
                </div>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedTime || submitting}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Tolovga otish
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}