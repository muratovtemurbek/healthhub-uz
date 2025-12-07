// src/pages/Privacy.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Eye, EyeOff, Lock, Bell,
  Smartphone, MapPin, FileText, Trash2, Download,
  ChevronRight, Check, AlertTriangle
} from 'lucide-react';

export default function Privacy() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    showProfile: true,
    showPhone: false,
    showEmail: true,
    locationTracking: false,
    notificationEmails: true,
    notificationSMS: true,
    notificationPush: true,
    twoFactor: false,
    dataSharing: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = () => {
    if (confirm("Hisobingizni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi!")) {
      alert("Hisob o'chirish so'rovi yuborildi. 30 kun ichida tasdiqlang.");
    }
  };

  const handleDownloadData = () => {
    alert("Ma'lumotlaringiz tayyorlanmoqda. Email orqali yuboriladi.");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Maxfiylik</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Profile Privacy */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-blue-600" />
              Profil ko'rinishi
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Profilni ko'rsatish</p>
                <p className="text-sm text-gray-500">Shifokorlar profilingizni ko'rsin</p>
              </div>
              <button
                onClick={() => toggleSetting('showProfile')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.showProfile ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.showProfile ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Telefon raqamini ko'rsatish</p>
                <p className="text-sm text-gray-500">Shifokorlar telefon raqamingizni ko'rsin</p>
              </div>
              <button
                onClick={() => toggleSetting('showPhone')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.showPhone ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.showPhone ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Lock className="h-5 w-5 mr-2 text-green-600" />
              Xavfsizlik
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Ikki bosqichli tasdiqlash</p>
                <p className="text-sm text-gray-500">SMS orqali qo'shimcha himoya</p>
              </div>
              <button
                onClick={() => toggleSetting('twoFactor')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.twoFactor ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.twoFactor ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="text-left">
                <p className="font-medium text-gray-900">Faol sessiyalar</p>
                <p className="text-sm text-gray-500">Qurilmalaringizni boshqaring</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-yellow-600" />
              Bildirishnomalar
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email bildirishnomalar</p>
              </div>
              <button
                onClick={() => toggleSetting('notificationEmails')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.notificationEmails ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.notificationEmails ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">SMS bildirishnomalar</p>
              </div>
              <button
                onClick={() => toggleSetting('notificationSMS')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.notificationSMS ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.notificationSMS ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push bildirishnomalar</p>
              </div>
              <button
                onClick={() => toggleSetting('notificationPush')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.notificationPush ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.notificationPush ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              Ma'lumotlar
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            <button
              onClick={handleDownloadData}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center">
                <Download className="h-5 w-5 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Ma'lumotlarni yuklab olish</p>
                  <p className="text-sm text-gray-500">Barcha ma'lumotlaringizni oling</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Ma'lumotlarni ulashish</p>
                <p className="text-sm text-gray-500">Tadqiqot uchun anonim ma'lumotlar</p>
              </div>
              <button
                onClick={() => toggleSetting('dataSharing')}
                className={`w-12 h-6 rounded-full transition-colors ${settings.dataSharing ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.dataSharing ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-red-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Xavfli zona
            </h3>
          </div>

          <button
            onClick={handleDeleteAccount}
            className="w-full p-4 flex items-center hover:bg-red-50"
          >
            <Trash2 className="h-5 w-5 text-red-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-red-600">Hisobni o'chirish</p>
              <p className="text-sm text-gray-500">Bu amalni qaytarib bo'lmaydi</p>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}