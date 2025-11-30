// src/pages/doctor/DoctorPatients.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, User, Phone, Mail, Calendar,
  FileText, Menu, Heart, X, LogOut, Activity,
  Clock, ChevronRight, Eye
} from 'lucide-react';
import apiClient from '../../api/client';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  last_visit: string;
  total_visits: number;
}

export default function DoctorPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/doctors/patients/');
      setPatients(response.data);
    } catch (err) {
      // Demo data
      setPatients([
        { id: '1', first_name: 'Ali', last_name: 'Valiyev', email: 'ali@test.uz', phone: '+998901234567', date_of_birth: '1990-05-15', gender: 'male', last_visit: '2024-01-20', total_visits: 5 },
        { id: '2', first_name: 'Madina', last_name: 'Karimova', email: 'madina@test.uz', phone: '+998907654321', date_of_birth: '1985-08-22', gender: 'female', last_visit: '2024-01-18', total_visits: 3 },
        { id: '3', first_name: 'Bobur', last_name: 'Alimov', email: 'bobur@test.uz', phone: '+998901112233', date_of_birth: '1978-12-03', gender: 'male', last_visit: '2024-01-15', total_visits: 8 },
        { id: '4', first_name: 'Nilufar', last_name: 'Saidova', email: 'nilufar@test.uz', phone: '+998905556677', date_of_birth: '1995-03-28', gender: 'female', last_visit: '2024-01-22', total_visits: 2 },
        { id: '5', first_name: 'Sardor', last_name: 'Rahimov', email: 'sardor@test.uz', phone: '+998909998877', date_of_birth: '1982-07-10', gender: 'male', last_visit: '2024-01-10', total_visits: 12 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const menuItems = [
    { icon: Activity, label: 'Dashboard', link: '/doctor/dashboard' },
    { icon: Calendar, label: 'Qabullar', link: '/doctor/appointments' },
    { icon: Users, label: 'Bemorlar', link: '/doctor/patients', active: true },
    { icon: Clock, label: 'Ish jadvali', link: '/doctor/schedule' },
    { icon: FileText, label: 'Tibbiy yozuvlar', link: '/doctor/records' },
    { icon: User, label: 'Profil', link: '/doctor/profile' },
  ];

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">HealthHub</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Shifokor Panel</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item, idx) => (
              <li key={idx}>
                <Link to={item.link} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <Link to="/login" className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Chiqish</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bemorlar</h1>
                <p className="text-sm text-gray-500">Jami: {patients.length} ta bemor</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {/* Search */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Bemor qidirish (ism, email, telefon)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Patients List */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Bemorlar topilmadi</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${patient.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                        <User className={`h-7 w-7 ${patient.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {calculateAge(patient.date_of_birth)} yosh • {patient.gender === 'male' ? 'Erkak' : 'Ayol'}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/doctor/patients/${patient.id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye className="h-5 w-5 text-gray-500" />
                    </Link>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {patient.phone}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {patient.email}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-500">Oxirgi tashrif:</span>
                      <span className="ml-1 font-medium text-gray-900">{formatDate(patient.last_visit)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Jami:</span>
                      <span className="ml-1 font-medium text-blue-600">{patient.total_visits} ta</span>
                    </div>
                  </div>

                  <div className="mt-3 flex space-x-2">
                    <Link
                      to={`/doctor/medical-record/new?patient=${patient.id}`}
                      className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 flex items-center justify-center"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Tibbiy yozuv
                    </Link>
                    <Link
                      to={`/doctor/patients/${patient.id}/history`}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Tarix
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
