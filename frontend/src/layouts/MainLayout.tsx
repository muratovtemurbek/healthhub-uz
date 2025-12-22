// src/layouts/MainLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Calendar, Users, User, Pill } from 'lucide-react';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Outlet />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-lg mx-auto flex justify-around">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`
            }
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Bosh sahifa</span>
          </NavLink>

          <NavLink
            to="/doctors"
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`
            }
          >
            <Users className="h-6 w-6" />
            <span className="text-xs mt-1">Shifokorlar</span>
          </NavLink>

          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`
            }
          >
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Qabullar</span>
          </NavLink>

          <NavLink
            to="/medicines"
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`
            }
          >
            <Pill className="h-6 w-6" />
            <span className="text-xs mt-1">Dorilar</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`
            }
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profil</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}