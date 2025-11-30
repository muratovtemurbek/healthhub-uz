// src/pages/TelegramVerification.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, CheckCircle, Loader2, RefreshCw,
  ExternalLink, Copy, Check, Clock, AlertCircle
} from 'lucide-react';
import apiClient from '../api/client';

export default function TelegramVerification() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [code, setCode] = useState('');
  const [botLink, setBotLink] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    setIsVerified(parsed.is_verified || false);

    if (!parsed.is_verified) {
      generateCode(parsed.id);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    if (remainingTime > 0 && !isVerified) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [remainingTime, isVerified]);

  const generateCode = async (userId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/api/telegram/generate/', {
        user_id: userId
      });

      if (res.data.is_verified) {
        setIsVerified(true);
        return;
      }

      setCode(res.data.code);
      setBotLink(res.data.bot_link);
      setBotUsername(res.data.bot_username);
      setRemainingTime(res.data.remaining_seconds || 70);

      // Avtomatik tekshirish boshlash
      startAutoCheck(userId);

    } catch (err) {
      setError('Kod olishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/api/telegram/resend/', {
        user_id: user.id
      });

      if (res.data.is_verified) {
        setIsVerified(true);
        return;
      }

      setCode(res.data.code);
      setRemainingTime(res.data.remaining_seconds || 70);

    } catch (err) {
      setError('Yangi kod olishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const startAutoCheck = (userId: string) => {
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);

    checkIntervalRef.current = setInterval(async () => {
      try {
        const res = await apiClient.get('/api/telegram/check/', {
          params: { user_id: userId }
        });

        if (res.data.is_verified) {
          setIsVerified(true);
          const updatedUser = { ...user, is_verified: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        }
      } catch (err) {}
    }, 2000);
  };

  const checkVerification = async () => {
    if (!user) return;
    setChecking(true);
    try {
      const res = await apiClient.get('/api/telegram/check/', {
        params: { user_id: user.id }
      });

      if (res.data.is_verified) {
        setIsVerified(true);
        const updatedUser = { ...user, is_verified: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        setError('Hali tasdiqlanmagan. Telegram botga kodni yuboring.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openTelegram = () => {
    window.open(botLink, '_blank');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Send className="h-6 w-6 text-blue-500 mr-2" />
          <h1 className="text-lg font-semibold">Telegram Tasdiqlash</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {isVerified ? (
          /* TASDIQLANGAN */
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tasdiqlandi! ✅</h2>
            <p className="text-gray-600 mb-6">
              Sizning hisobingiz Telegram orqali tasdiqlandi.
            </p>
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <p className="text-green-800">
                Endi siz navbat eslatmalari va muhim xabarlarni Telegram orqali olasiz.
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Davom etish
            </button>
          </div>
        ) : (
          /* TASDIQLANMAGAN */
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                  <Send className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Telegram tasdiqlash</h2>
                  <p className="text-blue-100 text-sm">5 xonali kod bilan</p>
                </div>
              </div>
            </div>

            {/* Kod Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">Sizning kodingiz:</h3>

              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
                  <p className="mt-2 text-gray-500">Kod olinmoqda...</p>
                </div>
              ) : code ? (
                <>
                  {/* Kod ko'rsatish */}
                  <div
                    onClick={copyCode}
                    className="bg-gray-100 rounded-2xl p-6 text-center cursor-pointer hover:bg-gray-200 transition mb-4"
                  >
                    <p className="text-4xl font-mono font-bold text-gray-900 tracking-widest">
                      {code}
                    </p>
                    <p className="text-sm text-gray-500 mt-2 flex items-center justify-center">
                      {copied ? (
                        <><Check className="h-4 w-4 mr-1 text-green-600" /> Nusxalandi!</>
                      ) : (
                        <><Copy className="h-4 w-4 mr-1" /> Bosib nusxalang</>
                      )}
                    </p>
                  </div>

                  {/* Timer */}
                  <div className={`flex items-center justify-center space-x-2 mb-4 ${remainingTime <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
                    <Clock className="h-5 w-5" />
                    <span className="font-mono text-lg font-semibold">
                      {formatTime(remainingTime)}
                    </span>
                    {remainingTime <= 10 && remainingTime > 0 && (
                      <span className="text-sm">- Tez bo'ling!</span>
                    )}
                  </div>

                  {/* Kod tugagan */}
                  {remainingTime === 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center text-red-700">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span>Kod muddati tugadi</span>
                      </div>
                    </div>
                  )}

                  {/* Yangi kod tugmasi */}
                  {remainingTime === 0 && (
                    <button
                      onClick={resendCode}
                      disabled={loading}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 mb-4"
                    >
                      Yangi kod olish
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => generateCode(user.id)}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                >
                  Kod olish
                </button>
              )}
            </div>

            {/* Qadamlar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Qanday tasdiqlash:</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Yuqoridagi kodni nusxalang</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Telegram botga o'ting</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Kodni botga yuboring</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Tayyor!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            {/* Telegram Button */}
            <button
              onClick={openTelegram}
              className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 flex items-center justify-center"
            >
              <Send className="h-5 w-5 mr-2" />
              Telegram ochish
              <ExternalLink className="h-4 w-4 ml-2" />
            </button>

            {/* Check Button */}
            <button
              onClick={checkVerification}
              disabled={checking}
              className="w-full py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center"
            >
              {checking ? (
                <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Tekshirilmoqda...</>
              ) : (
                <><RefreshCw className="h-5 w-5 mr-2" />Tasdiqlashni tekshirish</>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
