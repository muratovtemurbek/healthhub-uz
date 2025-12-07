// src/pages/admin/AdminUsers.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Users, Stethoscope, Building2, Calendar, Shield, LogOut,
  Menu, X, Settings, CreditCard, Activity, Search, Bell,
  Plus, Edit2, Trash2, Eye, MoreVertical, Filter, Download,
  UserCheck, UserX, Mail, Phone, MapPin, Home, FileText
} from 'lucide-react';
import apiClient from '../../api/client';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_type: string;
  is_active: boolean;
  date_joined: string;
  city?: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'delete'>('view');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { navigate('/login'); return; }
    const parsed = JSON.parse(userData);
    if (parsed.user_type !== 'admin') { navigate('/dashboard'); return; }
    setAdmin(parsed);
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const res = await apiClient.get('/api/auth/users/');
      const allUsers = Array.isArray(res.data) ? res.data : (res.data.results || []);
      // Faqat bemorlarni filterlash
      const patients = allUsers.filter((u: User) => u.user_type === 'patient');
      setUsers(patients.length > 0 ? patients : getDemoUsers());
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers(getDemoUsers());
    } finally {
      setLoading(false);
    }
  };

  const getDemoUsers = (): User[] => [
    { id: '1', email: 'alisher@example.com', first_name: 'Alisher', last_name: 'Karimov', phone: '+998901234567', user_type: 'patient', is_active: true, date_joined: '2024-01-15', city: 'Toshkent' },
    { id: '2', email: 'madina@example.com', first_name: 'Madina', last_name: 'Rahimova', phone: '+998907654321', user_type: 'patient', is_active: true, date_joined: '2024-01-18', city: 'Samarqand' },
    { id: '3', email: 'bobur@example.com', first_name: 'Bobur', last_name: 'Alimov', phone: '+998901112233', user_type: 'patient', is_active: false, date_joined: '2024-01-20', city: 'Buxoro' },
    { id: '4', email: 'nilufar@example.com', first_name: 'Nilufar', last_name: 'Saidova', phone: '+998905556677', user_type: 'patient', is_active: true, date_joined: '2024-01-22', city: 'Farg\'ona' },
    { id: '5', email: 'jasur@example.com', first_name: 'Jasur', last_name: 'Toshmatov', phone: '+998909998877', user_type: 'patient', is_active: true, date_joined: '2024-01-25', city: 'Andijon' },
    { id: '6', email: 'gulnora@example.com', first_name: 'Gulnora', last_name: 'Karimova', phone: '+998903334455', user_type: 'patient', is_active: true, date_joined: '2024-02-01', city: 'Namangan' },
    { id: '7', email: 'sardor@example.com', first_name: 'Sardor', last_name: 'Mahmudov', phone: '+998906667788', user_type: 'patient', is_active: false, date_joined: '2024-02-05', city: 'Qarshi' },
    { id: '8', email: 'dilnoza@example.com', first_name: 'Dilnoza', last_name: 'Azimova', phone: '+998901122334', user_type: 'patient', is_active: true, date_joined: '2024-02-10', city: 'Toshkent' },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);

    const matchesFilter =
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? user.is_active :
      !user.is_active;

    return matchesSearch && matchesFilter;
  });

  const handleAction = (user: User, type: 'view' | 'edit' | 'delete') => {
    setSelectedUser(user);
    setModalType(type);
    setShowModal(true);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      // API call to toggle status
      setUsers(users.map(u =>
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      // API call to delete
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { icon: Activity, label: 'Dashboard', link: '/admin/dashboard' },
    { icon: Users, label: 'Foydalanuvchilar', link: '/admin/users', active: true },
    { icon: Stethoscope, label: 'Shifokorlar', link: '/admin/doctors' },
    { icon: Building2, label: 'Shifoxonalar', link: '/admin/hospitals' },
    { icon: Calendar, label: 'Qabullar', link: '/admin/appointments' },
    { icon: CreditCard, label: 'To\'lovlar', link: '/admin/payments' },
    { icon: Settings, label: 'Sozlamalar', link: '/admin/settings' },
  ];

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-slate-900 to-slate-800 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">HealthHub</span>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {admin?.first_name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-semibold text-white">{admin?.first_name || 'Admin'}</p>
              <p className="text-sm text-slate-400">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Asosiy</p>
          <ul className="space-y-1">
            {menuItems.map((item, idx) => (
              <li key={idx}>
                <Link
                  to={item.link}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    item.active
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-4 px-3">Tizim</p>
          <ul className="space-y-1">
            <li>
              <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                <Home className="h-5 w-5" />
                <span className="font-medium">Bosh sahifa</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Foydalanuvchilar</h1>
                <p className="text-sm text-gray-500">Bemorlar ro'yxati va boshqaruvi</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-xl">
                <Bell className="h-6 w-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Jami</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Faol</p>
                  <p className="text-2xl font-bold text-green-600">{users.filter(u => u.is_active).length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Nofaol</p>
                  <p className="text-2xl font-bold text-red-600">{users.filter(u => !u.is_active).length}</p>
                </div>
                <UserX className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Bu oy</p>
                  <p className="text-2xl font-bold text-purple-600">+12</p>
                </div>
                <Plus className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ism, email yoki telefon bo'yicha qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Filter & Actions */}
                <div className="flex items-center space-x-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Barchasi</option>
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                  </select>

                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>

                  <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700">
                    <Plus className="h-4 w-4" />
                    <span>Qo'shish</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Foydalanuvchi</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kontakt</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shahar</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ro'yxatdan</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Yuklanmoqda...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Foydalanuvchilar topilmadi</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.first_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                              <p className="text-sm text-gray-500">Bemor</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-900 flex items-center">
                              <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                              {user.email}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                              {user.phone}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                            {user.city || 'Noma\'lum'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {user.is_active ? 'Faol' : 'Nofaol'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(user.date_joined).toLocaleDateString('uz-UZ')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleAction(user, 'view')}
                              className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                              title="Ko'rish"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAction(user, 'edit')}
                              className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600"
                              title="Tahrirlash"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAction(user, 'delete')}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                              title="O'chirish"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Jami {filteredUsers.length} ta foydalanuvchi
              </p>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">Oldingi</button>
                <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm">1</button>
                <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">2</button>
                <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">Keyingi</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {modalType === 'view' && (
              <>
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Foydalanuvchi ma'lumotlari</h2>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {selectedUser.first_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedUser.first_name} {selectedUser.last_name}</h3>
                      <p className="text-gray-500">Bemor</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Telefon</p>
                        <p className="font-medium">{selectedUser.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Shahar</p>
                        <p className="font-medium">{selectedUser.city || 'Noma\'lum'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    Yopish
                  </button>
                  <button
                    onClick={() => setModalType('edit')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                  >
                    Tahrirlash
                  </button>
                </div>
              </>
            )}

            {modalType === 'delete' && (
              <>
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">O'chirishni tasdiqlang</h2>
                  <p className="text-gray-500">
                    <strong>{selectedUser.first_name} {selectedUser.last_name}</strong> foydalanuvchisini o'chirmoqchimisiz?
                  </p>
                </div>
                <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                  >
                    O'chirish
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}