import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, Mail, Lock, User, Phone, Eye, EyeOff, Loader2,
  CheckCircle, Send, X, AlertCircle, ExternalLink
} from 'lucide-react';
import apiClient from '../api/client';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '']);
  const [userId, setUserId] = useState('');
  const [botUsername, setBotUsername] = useState('healthubuz_bot');

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [success, setSuccess] = useState(false);

  const codeInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (showModal) {
      setTimeout(() => {
        codeInputs.current[0]?.focus();
      }, 100);
    }
  }, [showModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.first_name || !formData.email || !formData.password) {
      setError('Ism, email va parol majburiy');
      return;
    }

    if (formData.password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bolishi kerak');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Parollar mos kelmadi');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/api/auth/register/', {
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
        user_type: 'patient'
      });

      if (response.data.tokens) {
        localStorage.setItem('access', response.data.tokens.access);
        localStorage.setItem('refresh', response.data.tokens.refresh);
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
      }

      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUserId(response.data.user.id);
      }

      const codeRes = await apiClient.post('/api/telegram/generate/', {
        user_id: response.data.user.id
      });

      if (codeRes.data.bot_username) {
        setBotUsername(codeRes.data.bot_username);
      }

      setShowModal(true);

    } catch (err: any) {
      console.error('Register error:', err);
      if (err.response?.data) {
        const data = err.response.data;
        if (data.email) {
          setError('Bu email allaqachon royxatdan otgan');
        } else if (data.phone) {
          setError('Bu telefon raqam allaqachon royxatdan otgan');
        } else if (data.error) {
          setError(data.error);
        } else {
          setError('Royxatdan otishda xatolik');
        }
      } else {
        setError('Server bilan boglanishda xatolik');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setModalError('');

    if (value && index < 4) {
      codeInputs.current[index + 1]?.focus();
    }

    if (newCode.every(c => c) && newCode.join('').length === 5) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    if (pastedData.length === 5) {
      setCode(pastedData.split(''));
      verifyCode(pastedData);
    }
  };

  const verifyCode = async (enteredCode: string) => {
    setVerifying(true);
    setModalError('');

    try {
      const res = await apiClient.post('/api/telegram/verify/', {
        user_id: userId,
        code: enteredCode
      });

      if (res.data.success) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.is_verified = true;
        localStorage.setItem('user', JSON.stringify(user));

        setSuccess(true);

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setModalError(res.data.error || 'Kod notogri');
        setCode(['', '', '', '', '']);
        codeInputs.current[0]?.focus();
      }

    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Kod notogri');
      setCode(['', '', '', '', '']);
      codeInputs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Muvaffaqiyatli!</h2>
          <p className="text-gray-600 mb-4">Hisobingiz yaratildi</p>
          <div className="flex items-center justify-center text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Dashboard ga otilmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">HealthHub</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Royxatdan otish</h1>
          <p className="text-gray-500 mt-2">Yangi hisob yarating</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ism *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ism"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Familiya</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Familiya"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="+998901234567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parol *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Kamida 6 ta belgi"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parolni tasdiqlang *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Parolni qaytadan kiriting"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Kutilmoqda...
              </span>
            ) : (
              <span>Royxatdan otish</span>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Hisobingiz bormi?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Kirish
          </Link>
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Tasdiqlash kodi</h3>
              <p className="text-gray-500 mt-2">
                Telegram botdan olgan 5 xonali kodni kiriting
              </p>
            </div>

            {modalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-center text-sm">
                {modalError}
              </div>
            )}

            <div className="flex justify-center space-x-3 mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { codeInputs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={verifying}
                  className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all ${
                    digit ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  } ${verifying ? 'opacity-50' : ''} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                />
              ))}
            </div>

            {verifying && (
              <div className="flex items-center justify-center text-blue-600 mb-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Tekshirilmoqda...</span>
              </div>
            )}

            <div className="border-t border-gray-200 my-4"></div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-3 text-center">
                Telegram botga oting va <strong>/start</strong> bosing
              </p>
              <a
                href={`https://t.me/${botUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 flex items-center justify-center"
              >
                <Send className="h-5 w-5 mr-2" />
                <span>@{botUsername}</span>
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}