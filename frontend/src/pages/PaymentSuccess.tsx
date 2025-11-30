import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, FileText, Loader2 } from 'lucide-react';
import apiClient from '../api/client';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    if (paymentId) {
      checkPaymentStatus();
    } else {
      setLoading(false);
    }
  }, [paymentId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await apiClient.get(`/api/payments/status/${paymentId}/`);
      setPaymentData(response.data);
    } catch (err) {
      console.error('Payment status error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Tolov tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tolov muvaffaqiyatli!
          </h1>
          <p className="text-gray-600 mb-6">
            Rahmat! Tolovingiz qabul qilindi.
          </p>

          {paymentData && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Summa:</span>
                  <span className="font-semibold text-gray-900">
                    {Number(paymentData.amount).toLocaleString()} UZS
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tolov usuli:</span>
                  <span className="font-semibold text-gray-900">
                    {paymentData.provider === 'payme' ? 'Payme' : 'Click'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Holat:</span>
                  <span className="font-semibold text-green-600">Tolangan</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 flex items-center justify-center"
            >
              <Home className="h-5 w-5 mr-2" />
              Bosh sahifaga
            </button>

            <button
              onClick={() => navigate('/appointments')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 flex items-center justify-center"
            >
              <FileText className="h-5 w-5 mr-2" />
              Qabullarim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}