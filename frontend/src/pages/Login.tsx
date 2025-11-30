// src/pages/Login.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        redirectUser(user);
      } catch (e) {
        localStorage.clear();
      }
    }
  }, []);

  const redirectUser = (user: any) => {
    const userType = user.user_type || 'patient';

    // User type ga qarab yo'naltirish (Telegram tekshiruvisiz)
    if (userType === 'admin') {
      navigate('/admin/dashboard');
    } else if (userType === 'doctor') {
      navigate('/doctor/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email.trim() || !password) {
      setError('Email va parol kiriting');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/api/auth/login/', {
        email: email.trim(),
        password: password
      });

      const data = response.data;

      // TOKEN SAQLASH
      let accessToken = '';
      let refreshToken = '';

      if (data.tokens) {
        accessToken = data.tokens.access;
        refreshToken = data.tokens.refresh;
      } else if (data.access) {
        accessToken = data.access;
        refreshToken = data.refresh || '';
      }

      if (accessToken) {
        localStorage.setItem('access', accessToken);
        localStorage.setItem('refresh', refreshToken);
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
      } else {
        setError('Login javobida token topilmadi');
        setLoading(false);
        return;
      }

      // USER SAQLASH
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        redirectUser(data.user);
      } else {
        setError('Login javobida user topilmadi');
        setLoading(false);
        return;
      }

    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        if (errorData.error) {
          setError(errorData.error);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          setError('Email yoki parol notogri');
        }
      } else {
        setError('Server bilan boglanishda xatolik');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Heart className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">HealthHub</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Tizimga kirish</h1>
          <p className="mt-2 text-gray-600">Hisobingizga kiring</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parol
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolingiz"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Parolni unutdingizmi?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Kirish...
                </span>
              ) : (
                'Kirish'
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-gray-600">
            Hisobingiz yoqmi?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Royxatdan oting
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}