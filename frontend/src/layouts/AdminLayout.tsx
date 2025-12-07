// src/layouts/AdminLayout.tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Users, UserCog, Calendar, CreditCard,
  Settings, Menu, X, LogOut, Shield
} from 'lucide-react';

const MENU_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/doctors', icon: UserCog, label: 'Shifokorlar' },
  { path: '/admin/patients', icon: Users, label: 'Bemorlar' },
  { path: '/admin/appointments', icon: Calendar, label: 'Qabullar' },
  { path: '/admin/payments', icon: CreditCard, label: 'To\'lovlar' },
  { path: '/admin/settings', icon: Settings, label: 'Sozlamalar' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-white/20 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-purple-700 to-indigo-800 text-white shadow-lg z-50 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center">
              <Shield className="h-8 w-8 mr-2" />
              <h2 className="text-xl font-bold">Admin</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-white/20 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 mx-2 rounded-lg transition ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white rounded-lg"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}