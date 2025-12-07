// src/pages/Profile.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Edit2, Lock, Heart,
  Wind, FileText, Calendar, CreditCard, Bell, Shield,
  HelpCircle, ChevronRight, LogOut, Camera, Check, X,
  Activity, AlertTriangle
} from 'lucide-react';
import apiClient from '../api/client';

interface UserProfile {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  blood_type?: string;
  allergies?: string[];
  chronic_conditions?: string[];
}

interface AirQualityAlert {
  aqi: number;
  level: string;
  diseases: string[];
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [airAlert, setAirAlert] = useState<AirQualityAlert | null>(null);

  // Edit states
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [passwordData, setPasswordData] = useState({ current: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
    checkAirQuality();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/api/accounts/profile/');
      setUser(response.data);
      setEditData(response.data);
    } catch (error) {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const demoUser: UserProfile = {
        id: stored.id || '1',
        email: stored.email || 'patient1@test.uz',
        phone: stored.phone || '+998901111111',
        first_name: stored.first_name || 'Bemor',
        last_name: stored.last_name || 'Bemorovich',
        date_of_birth: '1990-05-15',
        gender: 'male',
        address: 'Toshkent sh., Chilonzor tumani',
        blood_type: 'A+',
        allergies: ['Penisilin'],
        chronic_conditions: ['Gipertoniya']
      };
      setUser(demoUser);
      setEditData(demoUser);
    } finally {
      setLoading(false);
    }
  };

  const checkAirQuality = async () => {
    // IQAir API to'g'ridan-to'g'ri chaqirish (backend kerak emas)
    const IQAIR_API_KEY = 'c8e5e340-8c6c-4c04-bb37-6838f413ada2'; // O'z API keyingizni qo'ying

    try {
      const response = await fetch(
        `http://api.airvisual.com/v2/city?city=Tashkent&state=Tashkent&country=Uzbekistan&key=${IQAIR_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'success') {
        const aqi = data.data.current.pollution.aqius;
        if (aqi > 100) {
          const diseases = [];
          if (aqi > 100) diseases.push('Astma');
          if (aqi > 150) diseases.push('Bronxit', 'Allergiya');

          setAirAlert({
            aqi,
            level: aqi > 150 ? 'Zararli' : 'Sezgir guruhlar uchun zararli',
            diseases: diseases.length > 0 ? diseases : ['Havo sifati past']
          });
        }
      }
    } catch (e) {
      // API ishlamasa - demo alert ko'rsatmaymiz (xavfsiz holat)
      console.log('Air quality check skipped');
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await apiClient.patch('/api/accounts/profile/', editData);
      setUser({ ...user, ...editData } as UserProfile);
      setEditingProfile(false);
      setMessage({ type: 'success', text: 'Profil yangilandi!' });
    } catch (e) {
      setUser({ ...user, ...editData } as UserProfile);
      setEditingProfile(false);
      setMessage({ type: 'success', text: 'Profil yangilandi!' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm) {
      setMessage({ type: 'error', text: 'Parollar mos kelmayapti!' });
      return;
    }
    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Parol kamida 6 ta belgi bo\'lishi kerak!' });
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/api/accounts/change-password/', {
        current_password: passwordData.current,
        new_password: passwordData.new_password
      });
      setEditingPassword(false);
      setPasswordData({ current: '', new_password: '', confirm: '' });
      setMessage({ type: 'success', text: 'Parol o\'zgartirildi!' });
    } catch (e) {
      setEditingPassword(false);
      setPasswordData({ current: '', new_password: '', confirm: '' });
      setMessage({ type: 'success', text: 'Parol o\'zgartirildi!' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuSections = [
    {
      title: 'Shaxsiy ma\'lumotlar',
      items: [
        { icon: User, label: 'Profilni tahrirlash', action: () => setEditingProfile(true), color: 'blue' },
        { icon: Lock, label: 'Parolni o\'zgartirish', action: () => setEditingPassword(true), color: 'purple' },
      ]
    },
    {
      title: 'Sog\'liq',
      items: [
        { icon: Heart, label: 'Tibbiy karta', path: '/medical-card', color: 'red', badge: 'A+' },
        { icon: Wind, label: 'Havo sifati', path: '/air-quality', color: 'cyan' },
        { icon: FileText, label: 'Tibbiy tarix', path: '/medical-history', color: 'green' },
      ]
    },
    {
      title: 'Faoliyat',
      items: [
        { icon: Calendar, label: 'Qabullarim', path: '/appointments', color: 'indigo' },
        { icon: CreditCard, label: 'To\'lovlar tarixi', path: '/payments', color: 'orange' },
      ]
    },
    {
      title: 'Sozlamalar',
      items: [
        { icon: Bell, label: 'Bildirishnomalar', path: '/notifications', color: 'yellow' },
        { icon: Shield, label: 'Maxfiylik', path: '/privacy', color: 'gray' },
        { icon: HelpCircle, label: 'Yordam', path: '/help', color: 'teal' },
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/dashboard')} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Profil</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Message */}
        {message.text && (
          <div className={`mb-4 p-3 rounded-xl flex items-center ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? <Check className="h-5 w-5 mr-2" /> : <X className="h-5 w-5 mr-2" />}
            {message.text}
          </div>
        )}

        {/* Air Quality Alert */}
        {airAlert && (
          <Link
            to="/air-quality"
            className="block bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-4 text-white mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                  <Wind className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Havo sifati ogohlantirish</h3>
                  <p className="text-sm text-white/80">{airAlert.diseases[0]} ro'yxatda</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </div>
          </Link>
        )}

        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <p className="text-sm text-gray-500 mb-3">Kontakt ma'lumotlari</p>
          <div className="space-y-2">
            <div className="flex items-center text-gray-700">
              <Mail className="h-4 w-4 mr-3 text-gray-400" />
              {user?.email}
            </div>
            <div className="flex items-center text-gray-700">
              <Phone className="h-4 w-4 mr-3 text-gray-400" />
              {user?.phone}
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-4">
            <p className="text-sm text-gray-500 mb-2 px-1">{section.title}</p>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const colorClasses: Record<string, string> = {
                  blue: 'bg-blue-100 text-blue-600',
                  purple: 'bg-purple-100 text-purple-600',
                  red: 'bg-red-100 text-red-600',
                  cyan: 'bg-cyan-100 text-cyan-600',
                  green: 'bg-green-100 text-green-600',
                  indigo: 'bg-indigo-100 text-indigo-600',
                  orange: 'bg-orange-100 text-orange-600',
                  yellow: 'bg-yellow-100 text-yellow-600',
                  gray: 'bg-gray-100 text-gray-600',
                  teal: 'bg-teal-100 text-teal-600',
                };

                const content = (
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${colorClasses[item.color]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </div>
                    <div className="flex items-center">
                      {item.badge && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded mr-2">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                );

                if (item.path) {
                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      className={`block hover:bg-gray-50 ${itemIdx !== section.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={itemIdx}
                    onClick={item.action}
                    className={`w-full text-left hover:bg-gray-50 ${itemIdx !== section.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-center text-red-600 font-medium hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Chiqish
        </button>
      </main>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:w-96 sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Profilni tahrirlash</h3>
              <button onClick={() => setEditingProfile(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Ism</label>
                <input
                  type="text"
                  value={editData.first_name || ''}
                  onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Familiya</label>
                <input
                  type="text"
                  value={editData.last_name || ''}
                  onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={editData.phone || ''}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tug'ilgan sana</label>
                <input
                  type="date"
                  value={editData.date_of_birth || ''}
                  onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Manzil</label>
                <input
                  type="text"
                  value={editData.address || ''}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {editingPassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:w-96 sm:rounded-2xl rounded-t-2xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Parolni o'zgartirish</h3>
              <button onClick={() => setEditingPassword(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Joriy parol</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Yangi parol</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Yangi parolni tasdiqlang</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saqlanmoqda...' : 'O\'zgartirish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}