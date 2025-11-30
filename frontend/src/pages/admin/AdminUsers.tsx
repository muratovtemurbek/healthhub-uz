// src/pages/admin/AdminUsers.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, Filter, MoreVertical, Edit2,
  Trash2, Eye, UserCheck, UserX, ChevronLeft,
  ChevronRight, Download, Plus, Mail, Phone,
  Calendar, ArrowLeft, Menu, Heart, X, LogOut,
  BarChart3, CreditCard, Hospital, Settings
} from 'lucide-react';
import apiClient from '../../api/client';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_type: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'patient' | 'doctor' | 'admin'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filter, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      if (filter !== 'all') params.append('user_type', filter);
      if (search) params.append('search', search);

      const response = await apiClient.get(`/api/admin/users/?${params}`);
      setUsers(response.data.results || response.data);
      setTotalPages(Math.ceil((response.data.count || response.data.length) / itemsPerPage));
    } catch (err) {
      console.error('Fetch users error:', err);
      // Demo data
      setUsers([
        { id: '1', email: 'ali@test.uz', first_name: 'Ali', last_name: 'Valiyev', phone: '+998901234567', user_type: 'patient', is_verified: true, is_active: true, created_at: '2024-01-15', last_login: '2024-01-20' },
        { id: '2', email: 'madina@test.uz', first_name: 'Madina', last_name: 'Karimova', phone: '+998907654321', user_type: 'patient', is_verified: true, is_active: true, created_at: '2024-01-14', last_login: '2024-01-19' },
        { id: '3', email: 'jasur@healthhub.uz', first_name: 'Jasur', last_name: 'Toshmatov', phone: '+998901112233', user_type: 'doctor', is_verified: true, is_active: true, created_at: '2024-01-10', last_login: '2024-01-20' },
        { id: '4', email: 'admin@healthhub.uz', first_name: 'Admin', last_name: 'User', phone: '+998909998877', user_type: 'admin', is_verified: true, is_active: true, created_at: '2024-01-01', last_login: '2024-01-20' },
        { id: '5', email: 'bobur@test.uz', first_name: 'Bobur', last_name: 'Alimov', phone: '+998905556677', user_type: 'patient', is_verified: false, is_active: true, created_at: '2024-01-18', last_login: null },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      await apiClient.patch(`/api/admin/users/${userId}/`, { is_active: !isActive });
      fetchUsers();
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Rostdan ham bu foydalanuvchini o\'chirmoqchimisiz?')) return;
    try {
      await apiClient.delete(`/api/admin/users/${userId}/`);
      fetchUsers();
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'doctor': return 'bg-green-100 text-green-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'admin': return 'Admin';
      case 'doctor': return 'Shifokor';
      default: return 'Bemor';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', link: '/admin/dashboard' },
    { icon: Users, label: 'Foydalanuvchilar', link: '/admin/users', active: true },
    { icon: UserCheck, label: 'Shifokorlar', link: '/admin/doctors' },
    { icon: Calendar, label: 'Qabullar', link: '/admin/appointments' },
    { icon: CreditCard, label: 'Tolovlar', link: '/admin/payments' },
    { icon: Hospital, label: 'Kasalxonalar', link: '/admin/hospitals' },
    { icon: Settings, label: 'Sozlamalar', link: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

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
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
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

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Foydalanuvchilar</h1>
                <p className="text-sm text-gray-500">Barcha foydalanuvchilarni boshqarish</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Qoshish</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Filter */}
              <div className="flex space-x-2">
                {['all', 'patient', 'doctor', 'admin'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'Barchasi' : f === 'patient' ? 'Bemorlar' : f === 'doctor' ? 'Shifokorlar' : 'Adminlar'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Foydalanuvchi</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Telefon</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Turi</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Holat</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Royxatdan</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Foydalanuvchilar topilmadi
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {user.first_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.phone || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(user.user_type)}`}>
                            {getUserTypeLabel(user.user_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {user.is_verified ? (
                              <span className="flex items-center text-green-600 text-sm">
                                <UserCheck className="h-4 w-4 mr-1" />
                                Tasdiqlangan
                              </span>
                            ) : (
                              <span className="flex items-center text-yellow-600 text-sm">
                                <UserX className="h-4 w-4 mr-1" />
                                Tasdiqlanmagan
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(user.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Korish">
                              <Eye className="h-4 w-4 text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Tahrirlash">
                              <Edit2 className="h-4 w-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 hover:bg-red-50 rounded-lg"
                              title="Ochirish"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
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
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Jami: {users.length} ta foydalanuvchi
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}