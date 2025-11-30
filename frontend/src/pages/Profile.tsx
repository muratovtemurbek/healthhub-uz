// src/pages/Profile.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Calendar,
  MapPin, Edit2, Camera, LogOut, ChevronRight,
  Shield, Bell, CreditCard, FileText, Heart,
  Settings, HelpCircle, Lock, CheckCircle
} from 'lucide-react';
import apiClient from '../api/client';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  avatar: string | null;
  is_verified: boolean;
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/api/auth/profile/');
      setUser(response.data);
    } catch (err) {
      console.error('Fetch profile error:', err);
      // Fallback to localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Shaxsiy malumotlar',
      items: [
        { icon: User, label: 'Profilni tahrirlash', link: '/profile/edit', color: 'bg-blue-100 text-blue-600' },
        { icon: Lock, label: 'Parolni ozgartirish', link: '/profile/password', color: 'bg-purple-100 text-purple-600' },
      ]
    },
    {
      title: 'Faoliyat',
      items: [
        { icon: Calendar, label: 'Qabullarim', link: '/appointments', color: 'bg-green-100 text-green-600' },
        { icon: FileText, label: 'Tibbiy tarix', link: '/medical-history', color: 'bg-indigo-100 text-indigo-600' },
        { icon: CreditCard, label: 'Tolovlar tarixi', link: '/payment/history', color: 'bg-orange-100 text-orange-600' },
      ]
    },
    {
      title: 'Sozlamalar',
      items: [
        { icon: Bell, label: 'Bildirishnomalar', link: '/notifications', color: 'bg-yellow-100 text-yellow-600' },
        { icon: Shield, label: 'Maxfiylik', link: '/privacy', color: 'bg-red-100 text-red-600' },
        { icon: HelpCircle, label: 'Yordam', link: '/help', color: 'bg-cyan-100 text-cyan-600' },
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Profil</h1>
            <button onClick={() => navigate('/profile/edit')} className="p-2 hover:bg-white/10 rounded-lg">
              <Edit2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="max-w-3xl mx-auto px-4 pb-8 pt-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User className="h-10 w-10 text-white" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-blue-100">{user?.email}</p>
              {user?.is_verified && (
                <span className="inline-flex items-center mt-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Tasdiqlangan
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 -mt-4">
        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <Link to="/appointments" className="text-center py-2">
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-xs text-gray-500">Qabullar</p>
            </Link>
            <Link to="/payment/history" className="text-center py-2">
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-xs text-gray-500">Tolovlar</p>
            </Link>
            <Link to="/medical-history" className="text-center py-2">
              <p className="text-2xl font-bold text-purple-600">5</p>
              <p className="text-xs text-gray-500">Tarixlar</p>
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Kontakt malumotlari</h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <span>{user?.email}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center text-gray-700">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <span>{user.phone}</span>
              </div>
            )}
            {user?.address && (
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <span>{user.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Sections */}
        {menuItems.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
            <h3 className="text-sm font-medium text-gray-500 px-4 pt-4 pb-2">{section.title}</h3>
            <div className="divide-y divide-gray-100">
              {section.items.map((item, itemIdx) => (
                <Link
                  key={itemIdx}
                  to={item.link}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-gray-900">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 transition mb-6"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Chiqish</span>
        </button>

        {/* App Version */}
        <div className="text-center text-sm text-gray-400 mb-8">
          <Heart className="h-4 w-4 inline mr-1" />
          HealthHub UZ v1.0.0
        </div>
      </main>
    </div>
  );
}
