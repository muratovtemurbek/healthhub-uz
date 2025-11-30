import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Bot, Stethoscope, Pill, Shield,
  ArrowRight, CheckCircle, Send, Loader2, Lock, Play
} from 'lucide-react';

export default function Home() {
  const [symptoms, setSymptoms] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAIPreview = async () => {
    if (!symptoms.trim()) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setShowResult(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">HealthHub UZ</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">
              Kirish
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Ro'yxatdan o'tish
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Sog'liqni Saqlash <br />
                <span className="text-blue-200">Yangi Darajada</span>
              </h1>
              <p className="text-xl text-blue-100 mt-6">
                AI yordamida kasallik tashxisi, shifokorlarga onlayn yozilish,
                dori narxlarini qiyoslash — hammasi bir joyda!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 flex items-center justify-center space-x-2"
                >
                  <span>Bepul Boshlash</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="https://www.youtube.com/watch?v=8jZlWCFkyM8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 flex items-center justify-center space-x-2"
                >
                  <Play className="h-5 w-5" />
                  <span>Demo Ko'rish</span>
                </a>
              </div>

              <div className="flex items-center space-x-8 mt-10">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-blue-100">100% Bepul</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-blue-100">24/7 AI Yordam</span>
                </div>
              </div>
            </div>

            {/* AI Preview Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Bot className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Shifokor</h3>
                    <p className="text-sm text-gray-500">Alomatlarni tahlil qiling</p>
                  </div>
                </div>

                {!showResult ? (
                  <div>
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Alomatlaringizni yozing... (masalan: boshim og'riyapti, haroratim 38°C)"
                        className="w-full bg-transparent text-gray-700 placeholder-gray-400 resize-none outline-none"
                        rows={3}
                      />
                    </div>
                    <button
                      onClick={handleAIPreview}
                      disabled={!symptoms.trim() || loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Tahlil qilmoqda...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>AI Tahlil Qilish</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-gray-700 text-sm">{`"${symptoms}"`}</p>
                    </div>

                    <div className="relative">
                      <div className="bg-green-50 rounded-lg p-4 filter blur-sm select-none">
                        <p className="text-green-800">
                          🔍 Tahlil: Gripp belgisi bolishi mumkin. Terapevtga murojaat qilishni tavsiya etamiz.
                          👨‍⚕️ Tavsiya etilgan shifokorlar: Dr. Karimov, Dr. Rahimova...
                          💊 Uy sharoitida: Dam oling, kop suyuqlik iching...
                        </p>
                      </div>

                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                          <Lock className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 text-lg mb-2">
                          Tahlil tayyor! ✨
                        </h4>
                        <p className="text-gray-600 text-center text-sm mb-4 px-4">
                          Natijani korish uchun royxatdan oting
                        </p>
                        <Link
                          to="/register"
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2"
                        >
                          <span>Bepul Royxatdan Otish</span>
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowResult(false);
                        setSymptoms('');
                      }}
                      className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
                    >
                      ← Qayta urinib korish
                    </button>
                  </div>
                )}

                <p className="text-center text-xs text-gray-400 mt-4">
                  🔒 Malumotlaringiz xavfsiz saqlanadi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Asosiy Imkoniyatlar</h2>
            <p className="text-gray-600 mt-4">Sogliqni saqlash uchun zamonaviy yechimlar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Bot className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Tashxis</h3>
              <p className="text-gray-600">
                Suniy intellekt yordamida alomatlaringizni tahlil qiling va tavsiyalar oling
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Stethoscope className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Shifokorlar</h3>
              <p className="text-gray-600">
                Eng yaxshi shifokorlarni toping va onlayn navbatga yoziling
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Pill className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dori Narxlari</h3>
              <p className="text-gray-600">
                Dori narxlarini qiyoslang va eng arzon dorixonani toping
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Xavfsizlik</h3>
              <p className="text-gray-600">
                Barcha malumotlaringiz shifrlangan va himoyalangan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">500+</div>
              <div className="text-blue-200 mt-2">Shifokorlar</div>
            </div>
            <div>
              <div className="text-4xl font-bold">10K+</div>
              <div className="text-blue-200 mt-2">Foydalanuvchilar</div>
            </div>
            <div>
              <div className="text-4xl font-bold">50+</div>
              <div className="text-blue-200 mt-2">Shifoxonalar</div>
            </div>
            <div>
              <div className="text-4xl font-bold">24/7</div>
              <div className="text-blue-200 mt-2">AI Yordam</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Qanday Ishlaydi?</h2>
            <p className="text-gray-600 mt-4">3 oddiy qadamda sogliqni nazorat qiling</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Royxatdan Oting</h3>
              <p className="text-gray-600">Bepul hisob yarating va shaxsiy kabinetga kiring</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI ga Murojaat Qiling</h3>
              <p className="text-gray-600">Alomatlaringizni kiriting va AI tahlilini oling</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Shifokorga Yoziling</h3>
              <p className="text-gray-600">Tavsiya etilgan shifokorga onlayn navbat oling</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sogliqingizni Bugundan Boshlab Nazorat Qiling
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Minglab foydalanuvchilar allaqachon HealthHub UZ dan foydalanmoqda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-10 py-4 rounded-xl font-semibold hover:bg-blue-50 text-lg"
            >
              Hoziroq Boshlash — Bepul
            </Link>
            <a
              href="https://www.youtube.com/watch?v=8jZlWCFkyM8"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-10 py-4 rounded-xl font-semibold hover:bg-white/10 text-lg flex items-center justify-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Video Korish</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-8 w-8 text-blue-500" />
                <span className="text-xl font-bold text-white">HealthHub UZ</span>
              </div>
              <p className="text-gray-400">
                Ozbekiston uchun yaratilgan zamonaviy tibbiyot platformasi.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Sahifalar</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/login" className="hover:text-white">Kirish</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white">Royxatdan otish</Link>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=8jZlWCFkyM8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Demo video
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Boglanish</h4>
              <ul className="space-y-2">
                <li>📧 info@healthhub.uz</li>
                <li>📞 +998 90 123 45 67</li>
                <li>📍 Fargona, Ozbekiston</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 HealthHub UZ. Barcha huquqlar himoyalangan.</p>
            <p className="text-sm mt-2 md:mt-0">Ozbekiston uchun yaratilgan 🇺🇿</p>
          </div>
        </div>
      </footer>
    </div>
  );
}