// src/pages/admin/AdminSettings.tsx
import { useState } from 'react';
import { Settings, Bell, Shield, Database, Save, Eye, EyeOff, Check, Server } from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    clinic_name: 'HealthHub UZ',
    clinic_email: 'info@healthhub.uz',
    clinic_phone: '+998 71 123 45 67',
    clinic_address: 'Toshkent sh., Yunusobod tumani',
    working_hours: '09:00 - 18:00',
    language: 'uz',
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    reminder_hours: 24,
    two_factor: false,
    session_timeout: 30,
    api_key: 'sk_live_xxxxxxxxxxxxxxxxxxxxx',
    payme_enabled: true,
    click_enabled: true,
    cash_enabled: true,
    maintenance_mode: false,
    debug_mode: false,
  });

  const tabs = [
    { id: 'general', label: 'Umumiy', icon: Settings },
    { id: 'notifications', label: 'Bildirishnomalar', icon: Bell },
    { id: 'security', label: 'Xavfsizlik', icon: Shield },
    { id: 'payments', label: "To'lovlar", icon: Database },
    { id: 'system', label: 'Tizim', icon: Server },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Sozlamalar</h1>
          <p className="text-gray-500 mt-1">Tizim sozlamalarini boshqaring</p>
        </div>
        <button onClick={handleSave} className="mt-4 lg:mt-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {saved ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />}
          {saved ? 'Saqlandi!' : 'Saqlash'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Umumiy sozlamalar</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Klinika nomi</label>
                    <input type="text" value={settings.clinic_name} onChange={(e) => setSettings({...settings, clinic_name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" value={settings.clinic_email} onChange={(e) => setSettings({...settings, clinic_email: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                    <input type="tel" value={settings.clinic_phone} onChange={(e) => setSettings({...settings, clinic_phone: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ish vaqti</label>
                    <input type="text" value={settings.working_hours} onChange={(e) => setSettings({...settings, working_hours: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manzil</label>
                  <textarea value={settings.clinic_address} onChange={(e) => setSettings({...settings, clinic_address: e.target.value})} rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Til</label>
                  <select value={settings.language} onChange={(e) => setSettings({...settings, language: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="uz">Ozbekcha</option>
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Bildirishnoma sozlamalari</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Email bildirishnomalari</p>
                    <p className="text-sm text-gray-500">Muhim hodisalar haqida email orqali xabar</p>
                  </div>
                  <input type="checkbox" checked={settings.email_notifications} onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">SMS bildirishnomalari</p>
                    <p className="text-sm text-gray-500">SMS orqali eslatmalar</p>
                  </div>
                  <input type="checkbox" checked={settings.sms_notifications} onChange={(e) => setSettings({...settings, sms_notifications: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Push bildirishnomalari</p>
                    <p className="text-sm text-gray-500">Mobil ilovada bildirishnomalar</p>
                  </div>
                  <input type="checkbox" checked={settings.push_notifications} onChange={(e) => setSettings({...settings, push_notifications: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Eslatma vaqti (soat oldin)</label>
                  <input type="number" value={settings.reminder_hours} onChange={(e) => setSettings({...settings, reminder_hours: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Xavfsizlik sozlamalari</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Ikki bosqichli autentifikatsiya</p>
                    <p className="text-sm text-gray-500">Qoshimcha xavfsizlik darajasi</p>
                  </div>
                  <input type="checkbox" checked={settings.two_factor} onChange={(e) => setSettings({...settings, two_factor: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sessiya vaqti (daqiqa)</label>
                  <input type="number" value={settings.session_timeout} onChange={(e) => setSettings({...settings, session_timeout: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">API kalit</label>
                  <div className="flex gap-2">
                    <input type={showApiKey ? 'text' : 'password'} value={settings.api_key} readOnly className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-100" />
                    <button onClick={() => setShowApiKey(!showApiKey)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                      {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Tolov sozlamalari</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Payme</p>
                    <p className="text-sm text-gray-500">Payme orqali tolov qabul qilish</p>
                  </div>
                  <input type="checkbox" checked={settings.payme_enabled} onChange={(e) => setSettings({...settings, payme_enabled: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Click</p>
                    <p className="text-sm text-gray-500">Click orqali tolov qabul qilish</p>
                  </div>
                  <input type="checkbox" checked={settings.click_enabled} onChange={(e) => setSettings({...settings, click_enabled: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Naqd pul</p>
                    <p className="text-sm text-gray-500">Naqd pul qabul qilish</p>
                  </div>
                  <input type="checkbox" checked={settings.cash_enabled} onChange={(e) => setSettings({...settings, cash_enabled: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Tizim sozlamalari</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-gray-900">Texnik ishlar rejimi</p>
                    <p className="text-sm text-gray-500">Sayt vaqtincha yopiladi</p>
                  </div>
                  <input type="checkbox" checked={settings.maintenance_mode} onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})} className="w-5 h-5 text-yellow-600 rounded" />
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-gray-900">Debug rejimi</p>
                    <p className="text-sm text-gray-500">Ishlab chiquvchilar uchun</p>
                  </div>
                  <input type="checkbox" checked={settings.debug_mode} onChange={(e) => setSettings({...settings, debug_mode: e.target.checked})} className="w-5 h-5 text-red-600 rounded" />
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Tizim holati</p>
                      <p className="text-sm text-gray-500">Barcha xizmatlar ishlayapti</p>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      <span className="text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}