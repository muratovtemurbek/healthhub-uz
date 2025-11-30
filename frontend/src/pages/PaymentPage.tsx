// src/pages/PaymentPage.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard, ArrowLeft, Shield, CheckCircle,
  Loader2, AlertCircle
} from 'lucide-react';
import apiClient from '../api/client';

// Payme va Click logolari (inline SVG)
const PaymeLogo = () => (
  <svg viewBox="0 0 100 40" className="h-8">
    <rect width="100" height="40" rx="8" fill="#00CDCD"/>
    <text x="50" y="26" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">Payme</text>
  </svg>
);

const ClickLogo = () => (
  <svg viewBox="0 0 100 40" className="h-8">
    <rect width="100" height="40" rx="8" fill="#0088FF"/>
    <text x="50" y="26" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">Click</text>
  </svg>
);

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // URL dan yoki state dan ma'lumotlar
  const searchParams = new URLSearchParams(location.search);
  const stateData = location.state || {};

  const amount = searchParams.get('amount') || stateData.amount || '150000';
  const appointmentId = searchParams.get('appointment_id') || stateData.appointmentId;
  const doctorName = searchParams.get('doctor') || stateData.doctorName || 'Shifokor';
  const serviceName = searchParams.get('service') || stateData.serviceName || 'Konsultatsiya';

  const [selectedProvider, setSelectedProvider] = useState<'payme' | 'click' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatAmount = (amount: string | number) => {
    return Number(amount).toLocaleString('uz-UZ');
  };

  const handlePayment = async () => {
    if (!selectedProvider) {
      setError('Tolov usulini tanlang');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/payments/create/', {
        amount: Number(amount),
        provider: selectedProvider,
        payment_type: 'appointment',
        appointment_id: appointmentId,
        description: `${serviceName} - ${doctorName}`
      });

      if (response.data.checkout_url) {
        // To'lov sahifasiga yo'naltirish
        window.location.href = response.data.checkout_url;
      } else {
        setError('Tolov URL yaratishda xatolik');
      }

    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || 'Tolov yaratishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Orqaga
        </button>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <CreditCard className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-bold text-center">Tolov</h1>
            <p className="text-blue-100 text-center mt-2">Xavfsiz onlayn tolov</p>
          </div>

          {/* Order details */}
          <div className="px-6 py-6 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-500 mb-4">Buyurtma tafsilotlari</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Xizmat:</span>
                <span className="font-medium text-gray-900">{serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shifokor:</span>
                <span className="font-medium text-gray-900">{doctorName}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="text-gray-900 font-semibold">Jami:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatAmount(amount)} UZS
                </span>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="px-6 py-6">
            <h2 className="text-sm font-medium text-gray-500 mb-4">Tolov usulini tanlang</h2>

            <div className="space-y-3">
              {/* Payme */}
              <button
                onClick={() => setSelectedProvider('payme')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  selectedProvider === 'payme'
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Payme</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Payme</p>
                    <p className="text-sm text-gray-500">Karta orqali tolov</p>
                  </div>
                </div>
                {selectedProvider === 'payme' && (
                  <CheckCircle className="h-6 w-6 text-cyan-500" />
                )}
              </button>

              {/* Click */}
              <button
                onClick={() => setSelectedProvider('click')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  selectedProvider === 'click'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Click</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Click</p>
                    <p className="text-sm text-gray-500">Karta yoki hamyon</p>
                  </div>
                </div>
                {selectedProvider === 'click' && (
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={handlePayment}
              disabled={!selectedProvider || loading}
              className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Tolov qilish - {formatAmount(amount)} UZS
                </>
              )}
            </button>

            {/* Security note */}
            <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
              <Shield className="h-4 w-4 mr-2 text-green-500" />
              Xavfsiz tolov - maʼlumotlaringiz himoyalangan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}