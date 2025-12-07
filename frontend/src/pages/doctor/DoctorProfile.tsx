// src/pages/doctor/DoctorProfile.tsx
import { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Award,
  Star, Edit2, Camera, Save, Clock, Briefcase,
  GraduationCap, FileText, Settings
} from 'lucide-react';

export default function DoctorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const [profile, setProfile] = useState({
    name: 'Dr. Akbar Karimov',
    specialty: 'Kardiolog',
    experience: 15,
    phone: '+998 90 123 45 67',
    email: 'akbar.karimov@clinic.uz',
    address: "Toshkent sh., Yunusobod tumani, Amir Temur ko'chasi 88",
    bio: "15 yillik tajribaga ega kardiolog. Yurak-qon tomir kasalliklari bo'yicha mutaxassis. 5000 dan ortiq muvaffaqiyatli operatsiyalar.",
    education: [
      { year: '2005-2011', institution: "Toshkent Tibbiyot Akademiyasi", degree: 'Shifokorlik' },
      { year: '2011-2013', institution: "Toshkent Tibbiyot Akademiyasi", degree: 'Ordinatura - Kardiologiya' },
      { year: '2018', institution: 'Seoul National University Hospital', degree: "Malaka oshirish - Interventsion kardiologiya" },
    ],
    certificates: [
      'Oliy toifali shifokor sertifikati',
      'Interventsion kardiologiya sertifikati',
      'ACLS (Advanced Cardiovascular Life Support)',
    ],
    languages: ["O'zbek", 'Rus', 'Ingliz'],
    rating: 4.8,
    reviews_count: 89,
    patients_count: 156,
    consultation_fee: 150000,
    working_hours: {
      weekdays: '09:00 - 18:00',
      saturday: '10:00 - 14:00',
      sunday: 'Dam olish',
    }
  });

  const tabs = [
    { id: 'info', label: "Ma'lumotlar", icon: User },
    { id: 'education', label: "Ta'lim", icon: GraduationCap },
    { id: 'schedule', label: 'Jadval', icon: Clock },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32 lg:h-40"></div>
        <div className="px-4 lg:px-6 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-16 lg:-mt-20">
            <div className="flex flex-col lg:flex-row lg:items-end">
              <div className="relative">
                <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                  <span className="text-5xl lg:text-6xl font-bold text-blue-600">
                    {profile.name.split(' ').slice(1).map(n => n[0]).join('')}
                  </span>
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 lg:mt-0 lg:ml-6 lg:mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-blue-600 font-medium">{profile.specialty}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {profile.experience} yil tajriba
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {profile.rating} ({profile.reviews_count} sharh)
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-4 lg:mt-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isEditing ? <Save className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
              {isEditing ? 'Saqlash' : 'Tahrirlash'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition border-b-2 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === 'info' && (
          <>
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Aloqa ma'lumotlari</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Telefon</p>
                      <p className="font-medium text-gray-900">{profile.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg lg:col-span-2">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Manzil</p>
                      <p className="font-medium text-gray-900">{profile.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Haqida</h2>
                <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Tillar</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang, i) => (
                    <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Statistika</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Bemorlar</span>
                    <span className="font-bold text-gray-900">{profile.patients_count}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Reyting</span>
                    <span className="font-bold text-gray-900 flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {profile.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Sharhlar</span>
                    <span className="font-bold text-gray-900">{profile.reviews_count}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Konsultatsiya narxi</h2>
                <p className="text-3xl font-bold text-blue-600">
                  {profile.consultation_fee.toLocaleString()} so'm
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'education' && (
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ta'lim</h2>
              <div className="space-y-4">
                {profile.education.map((edu, i) => (
                  <div key={i} className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{edu.degree}</p>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Sertifikatlar</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {profile.certificates.map((cert, i) => (
                  <div key={i} className="flex items-center p-4 bg-yellow-50 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-600 mr-3" />
                    <span className="font-medium text-gray-900">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ish vaqti</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Dushanba - Juma</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.working_hours.weekdays}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Shanba</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.working_hours.saturday}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Yakshanba</p>
                  <p className="text-lg font-semibold text-red-500">{profile.working_hours.sunday}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Sozlamalar</h2>
              <p className="text-gray-500">Sozlamalar sahifasi ishlab chiqilmoqda...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}