// src/pages/ChangePassword.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Lock, Eye, EyeOff, Save, Loader2,
  CheckCircle, AlertCircle, Shield
} from 'lucide-react';
import apiClient from '../api/client';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: ''
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: ''
  });

  const checkPasswordStrength = (password: string) => {
    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const labels = ['Juda zaif', 'Zaif', 'O\'rtacha', 'Kuchli', 'Juda kuchli'];
    const colors = ['red', 'orange', 'yellow', 'blue', 'green'];

    setPasswordStrength({
      score,
      label: password ? labels[Math.min(score, 4)] : '',
      color: password ? colors[Math.min(score, 4)] : ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    // Validation
    if (formData.new_password !== formData.new_password_confirm) {
      setError('Yangi parollar mos kelmadi');
      setSaving(false);
      return;
    }

    if (formData.new_password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      setSaving(false);
      return;
    }

    try {
      await apiClient.post('/api/accounts/change-password/', formData);

      setSuccess(true);
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirm: ''
      });
      setPasswordStrength({ score: 0, label: '', color: '' });

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        if (errorData.current_password) {
          setError(errorData.current_password[0] || 'Joriy parol noto\'g\'ri');
        } else if (errorData.new_password) {
          setError(errorData.new_password[0]);
        } else if (errorData.new_password_confirm) {
          setError(errorData.new_password_confirm[0]);
        } else if (errorData.error) {
          setError(errorData.error);
        } else {
          setError('Xatolik yuz berdi');
        }
      } else {
        setError('Xatolik yuz berdi');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">Parolni o'zgartirish</h1>
            <p className="text-sm text-white/80">Hisobingiz xavfsizligi</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            Parol muvaffaqiyatli o'zgartirildi!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Security Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900">Xavfsizlik maslahatlar</h3>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Kamida 6 ta belgi ishlatilsin</li>
                <li>• Katta va kichik harflar aralash bo'lsin</li>
                <li>• Raqamlar qo'shilsin</li>
                <li>• Maxsus belgilar ishlatilsin (!@#$%)</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joriy parol
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.current_password}
                  onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Joriy parolingiz"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yangi parol
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={(e) => {
                    setFormData({ ...formData, new_password: e.target.value });
                    checkPasswordStrength(e.target.value);
                  }}
                  className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Yangi parol"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {formData.new_password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">Parol kuchi:</span>
                    <span className={`text-sm font-medium text-${passwordStrength.color}-600`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yangi parolni tasdiqlash
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.new_password_confirm}
                  onChange={(e) => setFormData({ ...formData, new_password_confirm: e.target.value })}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formData.new_password_confirm && formData.new_password !== formData.new_password_confirm
                      ? 'border-red-300 bg-red-50'
                      : ''
                  }`}
                  placeholder="Yangi parolni qayta kiriting"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.new_password_confirm && formData.new_password !== formData.new_password_confirm && (
                <p className="mt-1 text-sm text-red-600">Parollar mos kelmadi</p>
              )}
              {formData.new_password_confirm && formData.new_password === formData.new_password_confirm && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Parollar mos
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || formData.new_password !== formData.new_password_confirm}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Parolni o'zgartirish
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}