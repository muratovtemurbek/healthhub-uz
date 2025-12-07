// src/pages/Help.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, HelpCircle, MessageCircle, Phone, Mail,
  ChevronDown, ChevronUp, Book, Video, FileText,
  ExternalLink, Send
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    id: '1',
    question: "Shifokorga qanday yozilaman?",
    answer: "Bosh sahifadan 'Shifokorlar' bo'limiga o'ting, kerakli shifokorni tanlang va 'Navbatga yozilish' tugmasini bosing. Keyin qulay sana va vaqtni tanlang."
  },
  {
    id: '2',
    question: "To'lovni qanday amalga oshiraman?",
    answer: "Qabulga yozilgandan so'ng, Payme yoki Click orqali to'lovni amalga oshirishingiz mumkin. Naqd pul bilan ham to'lash imkoniyati mavjud."
  },
  {
    id: '3',
    question: "Qabulni qanday bekor qilaman?",
    answer: "'Qabullarim' bo'limiga o'ting, bekor qilmoqchi bo'lgan qabulni tanlang va 'Bekor qilish' tugmasini bosing. Qabul boshlanishidan kamida 2 soat oldin bekor qilish mumkin."
  },
  {
    id: '4',
    question: "AI Symptom Checker qanday ishlaydi?",
    answer: "AI Symptom Checker sizning alomatlaringizni tahlil qilib, mumkin bo'lgan kasalliklarni aniqlaydi va tegishli mutaxassisni tavsiya qiladi. Bu faqat ma'lumot uchun, aniq tashxis shifokor tomonidan qo'yiladi."
  },
  {
    id: '5',
    question: "Tibbiy tarixim xavfsizmi?",
    answer: "Ha, barcha ma'lumotlaringiz shifrlangan holda saqlanadi va faqat siz ruxsat bergan shifokorlar ko'ra oladi. Biz HIPAA standartlariga amal qilamiz."
  },
  {
    id: '6',
    question: "Shifokor bilan qanday bog'lanaman?",
    answer: "Qabuldan so'ng 'Xabarlar' bo'limidan shifokor bilan yozishmalar orqali bog'lanishingiz mumkin. Shoshilinch hollarda telefon orqali qo'ng'iroq qiling."
  }
];

export default function Help() {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Yordam</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3">
          <a href="tel:+998712345678" className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Qo'ng'iroq</p>
          </a>

          <a href="mailto:support@healthhub.uz" className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Email</p>
          </a>

          <a href="https://t.me/healthhubuz" target="_blank" className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="h-6 w-6 text-cyan-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Telegram</p>
          </a>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
              Ko'p so'raladigan savollar
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            {FAQS.map(faq => (
              <div key={faq.id}>
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <p className="font-medium text-gray-900 text-left pr-4">{faq.question}</p>
                  {openFAQ === faq.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFAQ === faq.id && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Qo'llanmalar</h3>
          </div>

          <div className="divide-y divide-gray-100">
            <a href="#" className="flex items-center p-4 hover:bg-gray-50">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Book className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Foydalanish qo'llanmasi</p>
                <p className="text-sm text-gray-500">Ilovadan to'liq foydalanish</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>

            <a href="#" className="flex items-center p-4 hover:bg-gray-50">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <Video className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Video darsliklar</p>
                <p className="text-sm text-gray-500">Qadamba-qadam ko'rsatmalar</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>

            <a href="#" className="flex items-center p-4 hover:bg-gray-50">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Foydalanish shartlari</p>
                <p className="text-sm text-gray-500">Huquqiy hujjatlar</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Xabar yuborish</h3>

          {sent ? (
            <div className="bg-green-100 text-green-700 p-4 rounded-xl text-center">
              <p className="font-medium">Xabaringiz yuborildi!</p>
              <p className="text-sm mt-1">Tez orada javob beramiz</p>
            </div>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Savolingizni yozing..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                className="w-full mt-3 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Yuborish
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white">
          <h3 className="font-semibold text-lg mb-3">Biz bilan bog'laning</h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              +998 71 234 56 78
            </p>
            <p className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              support@healthhub.uz
            </p>
            <p className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              @healthhubuz
            </p>
          </div>
          <p className="text-blue-200 text-xs mt-4">
            Ish vaqti: Dushanba - Shanba, 09:00 - 18:00
          </p>
        </div>
      </main>
    </div>
  );
}