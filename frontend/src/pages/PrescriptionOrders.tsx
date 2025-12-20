// src/pages/PrescriptionOrders.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, Loader2, Clock, CheckCircle,
  Truck, MapPin, Phone, XCircle, ShoppingBag
} from 'lucide-react';
import api from '../services/api';

interface PrescriptionOrder {
  id: string;
  pharmacy_name: string;
  items: { name: string; quantity: number; price: number }[];
  total_amount: number;
  delivery_type: string;
  delivery_type_display: string;
  delivery_address: string;
  status: string;
  status_display: string;
  is_paid: boolean;
  created_at: string;
  delivered_at: string | null;
}

interface Prescription {
  id: string;
  diagnosis: string;
  medications: { name: string; dosage: string; instructions: string }[];
  created_at: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  ready: 'bg-green-100 text-green-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

export default function PrescriptionOrders() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PrescriptionOrder[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'new'>('orders');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, prescriptionsRes, pharmaciesRes] = await Promise.all([
        api.get('/medicines/prescription-orders/'),
        api.get('/appointments/my-prescriptions/'),
        api.get('/medicines/pharmacies/')
      ]);
      setOrders(ordersRes.data.results || ordersRes.data || []);
      setPrescriptions(prescriptionsRes.data || []);
      setPharmacies(pharmaciesRes.data.results || pharmaciesRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!selectedPrescription || !selectedPharmacy) {
      alert('Retsept va dorixonani tanlang');
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress) {
      alert('Yetkazish manzilini kiriting');
      return;
    }

    setOrdering(true);
    try {
      const items = selectedPrescription.medications.map(med => ({
        name: med.name,
        quantity: 1,
        price: 0
      }));

      await api.post('/medicines/prescription-orders/', {
        prescription: selectedPrescription.id,
        pharmacy: selectedPharmacy.id,
        items,
        total_amount: 0,
        delivery_type: deliveryType,
        delivery_address: deliveryAddress,
        delivery_phone: deliveryPhone
      });

      setShowOrderModal(false);
      setSelectedPrescription(null);
      setSelectedPharmacy(null);
      setDeliveryAddress('');
      setDeliveryPhone('');
      loadData();
      alert('Buyurtma yuborildi!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setOrdering(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Buyurtmani bekor qilmoqchimisiz?')) return;
    try {
      await api.post(`/medicines/prescription-orders/${orderId}/cancel/`);
      loadData();
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dori buyurtmalari</h1>
            <p className="text-xs text-gray-500">Retsept bo'yicha buyurtma</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'orders' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
            }`}
          >
            Buyurtmalarim
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'new' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
            }`}
          >
            Yangi buyurtma
          </button>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4">
        {activeTab === 'orders' ? (
          // Orders List
          orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Buyurtmalar yo'q</h3>
              <p className="text-gray-500 mb-6">Retsept bo'yicha buyurtma bering</p>
              <button
                onClick={() => setActiveTab('new')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg"
              >
                Buyurtma berish
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{order.pharmacy_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {order.status_display}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name} x{item.quantity}</span>
                        {item.price > 0 && (
                          <span className="text-gray-900">{item.price.toLocaleString()} so'm</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    {order.delivery_type === 'delivery' ? (
                      <>
                        <Truck className="h-4 w-4 mr-1" />
                        <span>Yetkazib berish</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        <span>Olib ketish</span>
                      </>
                    )}
                  </div>

                  {order.total_amount > 0 && (
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="font-medium">Jami:</span>
                      <span className="font-bold text-blue-600">
                        {order.total_amount.toLocaleString()} so'm
                      </span>
                    </div>
                  )}

                  {order.status === 'pending' && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="mt-3 w-full py-2 border border-red-200 text-red-600 rounded-lg text-sm"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          // New Order
          <div className="space-y-4">
            {/* Select Prescription */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Retseptni tanlang</h3>
              {prescriptions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Retseptlar yo'q</p>
              ) : (
                <div className="space-y-2">
                  {prescriptions.map((presc) => (
                    <button
                      key={presc.id}
                      onClick={() => setSelectedPrescription(presc)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                        selectedPrescription?.id === presc.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{presc.diagnosis}</p>
                      <p className="text-xs text-gray-500">
                        {presc.medications.length} ta dori • {new Date(presc.created_at).toLocaleDateString('uz-UZ')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Select Pharmacy */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Dorixonani tanlang</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {pharmacies.map((pharmacy) => (
                  <button
                    key={pharmacy.id}
                    onClick={() => setSelectedPharmacy(pharmacy)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedPharmacy?.id === pharmacy.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{pharmacy.name}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {pharmacy.address}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Yetkazish turi</h3>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`flex-1 py-3 rounded-lg border-2 ${
                    deliveryType === 'pickup'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <ShoppingBag className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm">Olib ketish</span>
                </button>
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`flex-1 py-3 rounded-lg border-2 ${
                    deliveryType === 'delivery'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <Truck className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm">Yetkazish</span>
                </button>
              </div>

              {deliveryType === 'delivery' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Yetkazish manzili"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="tel"
                    value={deliveryPhone}
                    onChange={(e) => setDeliveryPhone(e.target.value)}
                    placeholder="Telefon raqam"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={createOrder}
              disabled={!selectedPrescription || !selectedPharmacy || ordering}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {ordering ? 'Yuborilmoqda...' : 'Buyurtma berish'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
