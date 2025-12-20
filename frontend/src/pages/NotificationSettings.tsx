// src/pages/NotificationSettings.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, Mail, MessageSquare, Calendar,
  Heart, CreditCard, Volume2, Moon, Save, Loader2
} from 'lucide-react';
import api from '../services/api';

interface NotificationPreferences {
  email_appointments: boolean;
  email_reminders: boolean;
  email_promotions: boolean;
  push_appointments: boolean;
  push_messages: boolean;
  push_health: boolean;
  push_payments: boolean;
  sms_appointments: boolean;
  sms_reminders: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_appointments: true,
    email_reminders: true,
    email_promotions: false,
    push_appointments: true,
    push_messages: true,
    push_health: true,
    push_payments: true,
    sms_appointments: true,
    sms_reminders: true,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await api.get('/notifications/preferences/');
      setPreferences(response.data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await api.put('/notifications/preferences/', preferences);
      alert('Sozlamalar saqlandi!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-emerald-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-6' : ''
        }`}
      />
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
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
            <h1 className="text-lg font-bold text-gray-900">Bildirishnoma sozlamalari</h1>
          </div>
          <button
            onClick={savePreferences}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Saqlash
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Email bildirishnomalari */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Email bildirishnomalari</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Qabul eslatmalari</p>
                <p className="text-sm text-gray-500">Qabul haqida email orqali eslatma</p>
              </div>
              <ToggleSwitch
                enabled={preferences.email_appointments}
                onChange={() => togglePreference('email_appointments')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Kunlik eslatmalar</p>
                <p className="text-sm text-gray-500">Dori va boshqa eslatmalar</p>
              </div>
              <ToggleSwitch
                enabled={preferences.email_reminders}
                onChange={() => togglePreference('email_reminders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Yangiliklar va aksiyalar</p>
                <p className="text-sm text-gray-500">Maxsus takliflar va yangiliklar</p>
              </div>
              <ToggleSwitch
                enabled={preferences.email_promotions}
                onChange={() => togglePreference('email_promotions')}
              />
            </div>
          </div>
        </div>

        {/* Push bildirishnomalari */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
              <Bell className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Push bildirishnomalari</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                <p className="font-medium text-gray-900">Qabullar</p>
              </div>
              <ToggleSwitch
                enabled={preferences.push_appointments}
                onChange={() => togglePreference('push_appointments')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-green-500 mr-3" />
                <p className="font-medium text-gray-900">Xabarlar</p>
              </div>
              <ToggleSwitch
                enabled={preferences.push_messages}
                onChange={() => togglePreference('push_messages')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-red-500 mr-3" />
                <p className="font-medium text-gray-900">Sog'liq</p>
              </div>
              <ToggleSwitch
                enabled={preferences.push_health}
                onChange={() => togglePreference('push_health')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-purple-500 mr-3" />
                <p className="font-medium text-gray-900">To'lovlar</p>
              </div>
              <ToggleSwitch
                enabled={preferences.push_payments}
                onChange={() => togglePreference('push_payments')}
              />
            </div>
          </div>
        </div>

        {/* SMS bildirishnomalari */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">SMS bildirishnomalari</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Qabul tasdiqlari</p>
                <p className="text-sm text-gray-500">SMS orqali qabul tasdiqlari</p>
              </div>
              <ToggleSwitch
                enabled={preferences.sms_appointments}
                onChange={() => togglePreference('sms_appointments')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Eslatmalar</p>
                <p className="text-sm text-gray-500">Qabul kunidan oldin SMS</p>
              </div>
              <ToggleSwitch
                enabled={preferences.sms_reminders}
                onChange={() => togglePreference('sms_reminders')}
              />
            </div>
          </div>
        </div>

        {/* Tinchlik soatlari */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-3">
              <Moon className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Tinchlik soatlari</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Tinchlik rejimi</p>
                <p className="text-sm text-gray-500">Bu vaqtda bildirishnomalar kelmasin</p>
              </div>
              <ToggleSwitch
                enabled={preferences.quiet_hours_enabled}
                onChange={() => togglePreference('quiet_hours_enabled')}
              />
            </div>

            {preferences.quiet_hours_enabled && (
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 mb-1">Boshlanish</label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_start}
                    onChange={(e) => setPreferences(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 mb-1">Tugash</label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_end}
                    onChange={(e) => setPreferences(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ovoz sozlamalari */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mr-3">
              <Volume2 className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Ovoz va tebranish</h2>
              <p className="text-sm text-gray-500">Qurilma sozlamalarida o'zgartiring</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
