// src/pages/AirQuality.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Wind, Thermometer, Droplets, Gauge,
  AlertTriangle, Heart, Baby, Users, RefreshCw,
  MapPin, Clock, ChevronDown
} from 'lucide-react';
import apiClient from '../api/client';

interface AirQualityData {
  aqi: number;
  level: string;
  level_color: string;
  recommendation: string;
  diseases: string[];
  icon: string;
  bg_gradient: string;
  main_pollutant: string;
  main_pollutant_name: string;
  weather: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    pressure: number;
  };
  city: string;
  country: string;
  is_demo: boolean;
  timestamp: string;
}

interface HistoryItem {
  date: string;
  day_name: string;
  aqi: number;
  level: string;
  level_color: string;
  icon: string;
}

const CITIES = [
  { name: 'Toshkent', name_en: 'Tashkent' },
  { name: 'Samarqand', name_en: 'Samarkand' },
  { name: 'Buxoro', name_en: 'Bukhara' },
  { name: 'Namangan', name_en: 'Namangan' },
  { name: 'Andijon', name_en: 'Andijan' },
  { name: "Farg'ona", name_en: 'Fergana' },
  { name: 'Qarshi', name_en: 'Karshi' },
  { name: 'Nukus', name_en: 'Nukus' },
  { name: 'Urganch', name_en: 'Urgench' },
  { name: 'Jizzax', name_en: 'Jizzakh' },
];

export default function AirQuality() {
  const navigate = useNavigate();
  const [data, setData] = useState<AirQualityData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('Tashkent');
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedCity]);

  const fetchData = async () => {
    setError(null);
    try {
      const [aqRes, histRes] = await Promise.all([
        apiClient.get(`/api/air-quality/?city=${selectedCity}`),
        apiClient.get(`/api/air-quality/history/?city=${selectedCity}`)
      ]);

      console.log('Air Quality Response:', aqRes.data);
      setData(aqRes.data);
      setHistory(histRes.data.history || []);

      // Real data olindi
      if (!aqRes.data.is_demo) {
        console.log('✅ Real IQAir data received');
      } else {
        console.log('⚠️ Demo data - IQAir API not available');
      }
    } catch (err: any) {
      console.error('Air Quality fetch error:', err);
      setError('Ma\'lumotlarni yuklashda xatolik');

      // Demo data fallback
      setData({
        aqi: 75,
        level: "O'rtacha",
        level_color: 'yellow',
        recommendation: "Sezgir odamlar ehtiyot bo'lishi kerak.",
        diseases: ['Astma (ehtiyotkorlik)'],
        icon: '😐',
        bg_gradient: 'from-yellow-400 to-yellow-600',
        main_pollutant: 'pm25',
        main_pollutant_name: 'PM2.5',
        weather: { temperature: 24, humidity: 45, wind_speed: 3.5, pressure: 1018 },
        city: 'Toshkent',
        country: "O'zbekiston",
        is_demo: true,
        timestamp: new Date().toISOString()
      });
      setHistory([
        { date: '2024-01-15', day_name: 'Dushanba', aqi: 75, level: "O'rtacha", level_color: 'yellow', icon: '😐' },
        { date: '2024-01-14', day_name: 'Yakshanba', aqi: 65, level: "O'rtacha", level_color: 'yellow', icon: '😐' },
        { date: '2024-01-13', day_name: 'Shanba', aqi: 45, level: 'Yaxshi', level_color: 'green', icon: '😊' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    return 'bg-purple-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Havo sifati</h1>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* City Picker */}
        <div className="relative">
          <button
            onClick={() => setShowCityPicker(!showCityPicker)}
            className="w-full bg-white rounded-xl p-3 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium">{data?.city || 'Toshkent'}</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showCityPicker ? 'rotate-180' : ''}`} />
          </button>

          {showCityPicker && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg z-10 overflow-hidden">
              {CITIES.map(city => (
                <button
                  key={city.name_en}
                  onClick={() => {
                    setSelectedCity(city.name_en);
                    setShowCityPicker(false);
                    setLoading(true);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                    selectedCity === city.name_en ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main AQI Card */}
        <div className={`bg-gradient-to-br ${data?.bg_gradient || 'from-yellow-400 to-yellow-600'} rounded-2xl p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Havo sifati indeksi</p>
              <p className="text-5xl font-bold mt-1">{data?.aqi}</p>
            </div>
            <div className="text-6xl">{data?.icon}</div>
          </div>

          <div className="bg-white/20 rounded-xl p-3">
            <p className="font-semibold text-lg">{data?.level}</p>
            <p className="text-sm text-white/90 mt-1">{data?.recommendation}</p>
          </div>

          {data?.is_demo ? (
            <div className="bg-white/20 rounded-lg px-3 py-1.5 mt-3 flex items-center justify-center">
              <span className="text-xs text-white/80">⚠️ Demo ma'lumotlar (IQAir API ulanmagan)</span>
            </div>
          ) : (
            <div className="bg-white/20 rounded-lg px-3 py-1.5 mt-3 flex items-center justify-center">
              <span className="text-xs text-white/80">✅ IQAir dan real ma'lumotlar</span>
            </div>
          )}
        </div>

        {/* Weather Info */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Ob-havo</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-1">
                <Thermometer className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-lg font-bold">{data?.weather.temperature}°</p>
              <p className="text-xs text-gray-500">Harorat</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-1">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-lg font-bold">{data?.weather.humidity}%</p>
              <p className="text-xs text-gray-500">Namlik</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-1">
                <Wind className="h-5 w-5 text-cyan-600" />
              </div>
              <p className="text-lg font-bold">{data?.weather.wind_speed}</p>
              <p className="text-xs text-gray-500">Shamol</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-1">
                <Gauge className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-lg font-bold">{data?.weather.pressure}</p>
              <p className="text-xs text-gray-500">Bosim</p>
            </div>
          </div>
        </div>

        {/* Diseases Alert */}
        {data && data.diseases.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800">Xavf ostidagi kasalliklar</h3>
                <ul className="mt-2 space-y-1">
                  {data.diseases.map((disease, i) => (
                    <li key={i} className="text-sm text-orange-700">• {disease}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sensitive Groups */}
        {data && data.aqi > 100 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Sezgir guruhlar</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <Heart className="h-6 w-6 text-red-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Yurak kasalliklari</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Keksalar</p>
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-xl">
                <Baby className="h-6 w-6 text-pink-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Bolalar</p>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Oxirgi kunlar</h3>
          <div className="space-y-2">
            {history.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <span className="text-xl mr-3">{item.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{item.day_name}</p>
                    <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('uz-UZ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{item.aqi}</p>
                  <p className="text-xs text-gray-500">{item.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AQI Scale */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3">AQI shkalasi</h3>
          <div className="space-y-2">
            {[
              { range: '0-50', level: 'Yaxshi', color: 'bg-green-500', icon: '😊' },
              { range: '51-100', level: "O'rtacha", color: 'bg-yellow-500', icon: '😐' },
              { range: '101-150', level: 'Sezgir guruhlar uchun zararli', color: 'bg-orange-500', icon: '😷' },
              { range: '151-200', level: 'Zararli', color: 'bg-red-500', icon: '🤢' },
              { range: '201-300', level: 'Juda zararli', color: 'bg-purple-500', icon: '🤮' },
              { range: '300+', level: 'Xavfli', color: 'bg-gray-800', icon: '☠️' },
            ].map((item, i) => (
              <div key={i} className="flex items-center text-sm">
                <div className={`w-4 h-4 ${item.color} rounded mr-3`}></div>
                <span className="mr-2">{item.icon}</span>
                <span className="text-gray-500 w-16">{item.range}</span>
                <span className="text-gray-700">{item.level}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}