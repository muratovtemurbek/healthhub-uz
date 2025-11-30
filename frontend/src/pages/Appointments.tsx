// src/pages/Appointments.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, User, MapPin,
  CheckCircle, XCircle, AlertCircle, Loader2,
  Phone, MessageSquare, CreditCard, Filter,
  ChevronRight
} from 'lucide-react';
import apiClient from '../api/client';

interface Appointment {
  id: string;
  doctor: string;
  doctor_name: string;
  doctor_specialty: string;
  doctor_photo: string | null;
  hospital_name: string;
  date: string;
  time: string;
  status: string;
  status_display: string;
  payment_status: string;
  reason: string;
  price: number;
  created_at: string;
}

export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await apiClient.get('/api/appointments/');
      setAppointments(response.data);
    } catch (err) {
      console.error('Fetch appointments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['pending', 'confirmed'].includes(apt.status);
    if (filter === 'completed') return apt.status === 'completed';
    if (filter === 'cancelled') return apt.status === 'cancelled';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Qabullarim</h1>
            </div>
            <Link to="/doctors" className="text-blue-600 text-sm font-medium">
              + Yangi qabul
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Barchasi' },
            { key: 'upcoming', label: 'Kelayotgan' },
            { key: 'completed', label: 'Yakunlangan' },
            { key: 'cancelled', label: 'Bekor qilingan' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Qabullar topilmadi</h3>
            <p className="text-gray-500 mb-6">Siz hali qabulga yozilmagansiz</p>
            <Link
              to="/doctors"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
            >
              Shifokor tanlash
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <div key={apt.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Main Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {apt.doctor_photo ? (
                          <img src={apt.doctor_photo} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <User className="h-7 w-7 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{apt.doctor_name}</h3>
                        <p className="text-sm text-blue-600">{apt.doctor_specialty}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {apt.hospital_name || 'Klinika'}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(apt.status)}`}>
                      {getStatusIcon(apt.status)}
                      <span>{apt.status_display}</span>
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="mt-4 flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(apt.date)}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {apt.time}
                    </div>
                  </div>

                  {/* Reason */}
                  {apt.reason && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{apt.reason}</p>
                    </div>
                  )}
                </div>

                {/* Footer - Payment & Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    {/* Price */}
                    <div className="text-sm">
                      <span className="text-gray-500">Narxi: </span>
                      <span className="font-semibold text-gray-900">
                        {(apt.price || 150000).toLocaleString()} UZS
                      </span>
                    </div>

                    {/* Payment Status & Action */}
                    {apt.payment_status === 'pending' && apt.status !== 'cancelled' ? (
                      <Link
                        to={`/payment?amount=${apt.price || 150000}&appointment_id=${apt.id}&doctor=${encodeURIComponent(apt.doctor_name)}&service=Konsultatsiya`}
                        className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Tolov qilish
                      </Link>
                    ) : apt.payment_status === 'paid' ? (
                      <span className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Tolangan
                      </span>
                    ) : apt.status === 'cancelled' ? (
                      <span className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                        <XCircle className="h-4 w-4 mr-2" />
                        Bekor qilingan
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}