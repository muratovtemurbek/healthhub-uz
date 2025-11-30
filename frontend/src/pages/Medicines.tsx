// src/pages/Medicines.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Pill, Filter, X, MapPin, Phone, Clock,
  ChevronDown, ChevronUp, Star, AlertCircle, Loader2, TrendingDown
} from 'lucide-react';
import apiClient from '../api/client';

interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  category_name: string;
  category_id: number | null;
  manufacturer: string;
  price: number;
  requires_prescription: boolean;
  in_stock: boolean;
  price_range?: {
    min: number;
    max: number;
  };
}

interface PharmacyPrice {
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_address: string;
  pharmacy_phone: string;
  is_24_7: boolean;
  price: number;
  in_stock: boolean;
  is_cheapest: boolean;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

export default function Medicines() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Modal for price comparison
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [pharmacyPrices, setPharmacyPrices] = useState<PharmacyPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadMedicines();
  }, [selectedCategory, searchQuery]);

  const loadData = async () => {
    try {
      const [medsRes, catsRes] = await Promise.all([
        apiClient.get('/api/medicines/medicines/'),
        apiClient.get('/api/medicines/categories/')
      ]);

      const medsData = Array.isArray(medsRes.data) ? medsRes.data : (medsRes.data.results || []);
      const catsData = Array.isArray(catsRes.data) ? catsRes.data : (catsRes.data.results || []);

      setMedicines(medsData);
      setCategories(catsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const loadMedicines = async () => {
    try {
      let url = '/api/medicines/medicines/';
      const params = new URLSearchParams();

      if (selectedCategory) {
        params.append('category', selectedCategory.toString());
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await apiClient.get(url);
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setMedicines(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const loadPrices = async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setLoadingPrices(true);
    setPharmacyPrices([]);

    try {
      const response = await apiClient.get(`/api/medicines/medicines/${medicine.id}/prices/`);
      setPharmacyPrices(response.data.prices || []);
    } catch (err) {
      console.error('Error loading prices:', err);
    } finally {
      setLoadingPrices(false);
    }
  };

  const closeModal = () => {
    setSelectedMedicine(null);
    setPharmacyPrices([]);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' so\'m';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex items-center">
              <Pill className="h-6 w-6 text-orange-500 mr-2" />
              <h1 className="text-lg font-semibold text-gray-900">Dorilar</h1>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 rounded-lg relative"
          >
            <Filter className="h-6 w-6 text-gray-600" />
            {selectedCategory && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
            )}
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Dori nomini kiriting..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Kategoriyalar</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Barchasi
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Medicines List */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">{medicines.length} ta dori topildi</p>
        </div>

        {medicines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Dorilar topilmadi</h3>
            <p className="text-gray-500">Qidiruv so'rovingizni o'zgartiring</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicines.map((medicine) => (
              <div
                key={medicine.id}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{medicine.name}</h3>
                    <p className="text-sm text-gray-500">{medicine.generic_name}</p>
                  </div>
                  {medicine.requires_prescription && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                      Retsept
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                    {medicine.category_name}
                  </span>
                  <span className="text-xs text-gray-500">{medicine.manufacturer}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      {formatPrice(medicine.price)}
                    </p>
                    {medicine.price_range && medicine.price_range.min !== medicine.price_range.max && (
                      <p className="text-xs text-gray-500">
                        {formatPrice(medicine.price_range.min)} - {formatPrice(medicine.price_range.max)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => loadPrices(medicine)}
                    className="flex items-center bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Narxlarni taqqoslash
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Price Comparison Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedMedicine.name}</h3>
                <p className="text-sm text-gray-500">{selectedMedicine.generic_name}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loadingPrices ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto" />
                  <p className="mt-2 text-gray-500">Narxlar yuklanmoqda...</p>
                </div>
              ) : pharmacyPrices.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Narxlar topilmadi</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pharmacyPrices.map((price, idx) => (
                    <div
                      key={price.pharmacy_id}
                      className={`p-4 rounded-xl border-2 ${
                        price.is_cheapest
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{price.pharmacy_name}</h4>
                            {price.is_cheapest && (
                              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                                Eng arzon!
                              </span>
                            )}
                            {price.is_24_7 && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                24/7
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {price.pharmacy_address}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Phone className="h-4 w-4 mr-1" />
                            {price.pharmacy_phone}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            price.is_cheapest ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {formatPrice(price.price)}
                          </p>
                          {!price.in_stock && (
                            <span className="text-red-500 text-xs">Mavjud emas</span>
                          )}
                          {price.is_cheapest && idx > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                              {formatPrice(selectedMedicine.price - price.price)} tejaysiz!
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Narxlar o'zgarishi mumkin. Sotib olishdan oldin dorixona bilan bog'laning.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}