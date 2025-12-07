// src/components/AirQualityWidget.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wind, Thermometer, Droplets, RefreshCw, AlertTriangle,
  ChevronRight, MapPin, Loader2
} from 'lucide-react';
import apiClient from '../api/client';

interface AirQualityData {
  air_quality: {
    aqi: number;
    status: {
      level: string;
      label: string;
      color: string;
      description: string;
      icon: string;
    };
    city: string;
  };
  weather: {
    temperature: number;
    humidity: number;
    wind_speed: number;
  };
  personal_alerts: {
    condition: string;
    message: string;
  }[];
  has_alerts: boolean;
}

// O'zbekiston shaharlari
const CITIES = [
  { name: 'Tashkent', label: 'Toshkent' },
  { name: 'Fergana', label: 'Farg\'ona' },
  { name: 'Samarkand', label: 'Samarqand' },
  { name: 'Bukhara', label: 'Buxoro' },
  { name: 'Namangan', label: 'Namangan' },
  { name: 'Andijan', label: 'Andijon' },
  { name: 'Nukus', label: 'Nukus' },
  { name: 'Karshi', label: 'Qarshi' },
];

// Demo data - har bir shahar uchun
const DEMO_DATA: Record<string, AirQualityData> = {
  'Tashkent': {
    air_quality: { aqi: 72, status: { level: 'moderate', label: 'O\'rtacha', color: 'yellow', description: 'Sezgir odamlar ehtiyot bo\'lishi kerak', icon: '😐' }, city: 'Toshkent' },
    weather: { temperature: 18, humidity: 52, wind_speed: 2.8 },
    personal_alerts: [], has_alerts: false
  },
  'Fergana': {
    air_quality: { aqi: 45, status: { level: 'good', label: 'Yaxshi', color: 'green', description: 'Havo sifati yaxshi', icon: '😊' }, city: 'Farg\'ona' },
    weather: { temperature: 22, humidity: 38, wind_speed: 1.5 },
    personal_alerts: [], has_alerts: false
  },
  'Samarkand': {
    air_quality: { aqi: 58, status: { level: 'moderate', label: 'O\'rtacha', color: 'yellow', description: 'Qoniqarli havo sifati', icon: '😐' }, city: 'Samarqand' },
    weather: { temperature: 20, humidity: 45, wind_speed: 3.2 },
    personal_alerts: [], has_alerts: false
  },
  'Bukhara': {
    air_quality: { aqi: 85, status: { level: 'moderate', label: 'O\'rtacha', color: 'yellow', description: 'Sezgir guruhlar ehtiyot bo\'lsin', icon: '😐' }, city: 'Buxoro' },
    weather: { temperature: 25, humidity: 30, wind_speed: 4.1 },
    personal_alerts: [], has_alerts: false
  },
  'Namangan': {
    air_quality: { aqi: 52, status: { level: 'moderate', label: 'O\'rtacha', color: 'yellow', description: 'Qoniqarli havo', icon: '😐' }, city: 'Namangan' },
    weather: { temperature: 19, humidity: 48, wind_speed: 2.0 },
    personal_alerts: [], has_alerts: false
  },
  'Andijan': {
    air_quality: { aqi: 38, status: { level: 'good', label: 'Yaxshi', color: 'green', description: 'Toza havo', icon: '😊' }, city: 'Andijon' },
    weather: { temperature: 21, humidity: 42, wind_speed: 1.8 },
    personal_alerts: [], has_alerts: false
  },
  'Nukus': {
    air_quality: { aqi: 125, status: { level: 'unhealthy_sensitive', label: 'Sezgirlarga zararli', color: 'orange', description: 'Kasalligi borlar ehtiyot bo\'lsin', icon: '😷' }, city: 'Nukus' },
    weather: { temperature: 28, humidity: 22, wind_speed: 5.5 },
    personal_alerts: [{ condition: 'Nafas kasalliklari', message: 'Tashqariga chiqmang!' }], has_alerts: true
  },
  'Karshi': {
    air_quality: { aqi: 68, status: { level: 'moderate', label: 'O\'rtacha', color: 'yellow', description: 'Sezgir odamlar ehtiyot bo\'lsin', icon: '😐' }, city: 'Qarshi' },
    weather: { temperature: 26, humidity: 28, wind_speed: 3.8 },
    personal_alerts: [], has_alerts: false
  },
};

export default function AirQualityWidget() {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cityIndex, setCityIndex] = useState(0);
  const [error, setError] = useState(false);

  const currentCity = CITIES[cityIndex];

  useEffect(() => {
    fetchAirQuality(currentCity.name);
  }, [cityIndex]);

  const fetchAirQuality = async (city: string) => {
    setLoading(cityIndex === 0 && !data);
    try {
      const response = await apiClient.get(`/api/accounts/health-alerts/?city=${city}`);
      setData(response.data);
      setError(false);
    } catch (err) {
      console.log('Using demo data for:', city);
      // Demo data ishlatish
      setData(DEMO_DATA[city] || DEMO_DATA['Tashkent']);
      setError(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCityChange = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRefreshing(true);
    // Keyingi shaharga o'tish
    const nextIndex = (cityIndex + 1) % CITIES.length;
    setCityIndex(nextIndex);
  };

  const getAQIGradient = (aqi: number) => {
    if (aqi <= 50) return 'from-green-400 to-emerald-500';
    if (aqi <= 100) return 'from-yellow-400 to-amber-500';
    if (aqi <= 150) return 'from-orange-400 to-orange-500';
    if (aqi <= 200) return 'from-red-400 to-red-500';
    return 'from-purple-500 to-purple-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <Link
      to="/air-quality"
      className="block bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl shadow-xl p-6 mb-8 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/20 to-pink-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-400" />
            <span className="text-white font-medium">{data.air_quality.city}</span>
            <span className="text-gray-500 text-xs">({cityIndex + 1}/{CITIES.length})</span>
          </div>
          <button
            onClick={handleCityChange}
            className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Keyingi shahar"
          >
            <span className="text-xs text-gray-300">Keyingi shahar</span>
            <RefreshCw className={`h-4 w-4 text-gray-300 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-between">
          {/* AQI Display */}
          <div className="flex items-center space-x-4">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAQIGradient(data.air_quality.aqi)} flex items-center justify-center shadow-lg`}>
              <div className="text-center">
                <span className="text-3xl font-bold">{data.air_quality.aqi}</span>
                <p className="text-xs opacity-80">AQI</p>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{data.air_quality.status.icon}</span>
                <span className="font-semibold text-lg">{data.air_quality.status.label}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1 max-w-[200px]">
                {data.air_quality.status.description}
              </p>
            </div>
          </div>

          {/* Weather Info */}
          <div className="hidden sm:flex items-center space-x-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl mb-1">
                <Thermometer className="h-5 w-5 text-orange-400" />
              </div>
              <p className="text-lg font-semibold">{data.weather.temperature}°</p>
              <p className="text-xs text-gray-500">Harorat</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl mb-1">
                <Droplets className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-lg font-semibold">{data.weather.humidity}%</p>
              <p className="text-xs text-gray-500">Namlik</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl mb-1">
                <Wind className="h-5 w-5 text-cyan-400" />
              </div>
              <p className="text-lg font-semibold">{data.weather.wind_speed}</p>
              <p className="text-xs text-gray-500">m/s</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center">
            <ChevronRight className="h-6 w-6 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* Personal Alert */}
        {data.has_alerts && data.personal_alerts.length > 0 && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-300 font-medium">
                {data.personal_alerts[0].condition}: {data.personal_alerts[0].message}
              </span>
            </div>
          </div>
        )}

        {/* Mobile Weather */}
        <div className="flex sm:hidden items-center justify-around mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-orange-400" />
            <span>{data.weather.temperature}°C</span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-blue-400" />
            <span>{data.weather.humidity}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-cyan-400" />
            <span>{data.weather.wind_speed} m/s</span>
          </div>
        </div>
      </div>
    </Link>
  );
}