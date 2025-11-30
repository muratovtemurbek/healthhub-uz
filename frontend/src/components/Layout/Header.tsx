import { Link, useNavigate } from 'react-router-dom';
import { Heart, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  variant?: 'default' | 'doctor' | 'admin';
}

export default function Header({ variant = 'default' }: HeaderProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getHeaderStyle = () => {
    switch (variant) {
      case 'doctor':
        return 'bg-gradient-to-r from-green-600 to-green-700 text-white';
      case 'admin':
        return 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white';
      default:
        return 'bg-white shadow-sm';
    }
  };

  const getBadge = () => {
    switch (variant) {
      case 'doctor':
        return <span className="bg-white/20 px-2 py-1 rounded text-sm ml-2">Shifokor</span>;
      case 'admin':
        return <span className="bg-yellow-400 text-purple-900 px-2 py-1 rounded text-sm font-bold ml-2">Admin</span>;
      default:
        return null;
    }
  };

  const getDashboardLink = () => {
    switch (variant) {
      case 'doctor':
        return '/doctor/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <header className={`sticky top-0 z-50 ${getHeaderStyle()}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={getDashboardLink()} className="flex items-center space-x-2">
          <Heart className={`h-8 w-8 ${variant === 'default' ? 'text-blue-600' : ''}`} />
          <span className={`text-xl font-bold ${variant === 'default' ? 'text-gray-900' : ''}`}>
            HealthHub UZ
          </span>
          {getBadge()}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {user && (
            <>
              <Link
                to={variant === 'default' ? '/profile' : getDashboardLink()}
                className={`flex items-center space-x-2 ${variant === 'default' ? 'text-gray-700 hover:text-blue-600' : 'hover:bg-white/10 px-3 py-2 rounded'}`}
              >
                <User className="h-5 w-5" />
                <span>{variant === 'doctor' ? `Dr. ${user.first_name}` : `${user.first_name} ${user.last_name}`}</span>
              </Link>
              <button
                onClick={handleLogout}
                className={`flex items-center space-x-1 ${variant === 'default' ? 'text-red-600 hover:text-red-700' : 'hover:bg-white/10 px-3 py-2 rounded'}`}
              >
                <LogOut className="h-5 w-5" />
                <span>Chiqish</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t ${variant === 'default' ? 'bg-white border-gray-200' : 'bg-black/20 border-white/20'}`}>
          <div className="px-4 py-4 space-y-3">
            {user && (
              <>
                <Link
                  to={variant === 'default' ? '/profile' : getDashboardLink()}
                  className="flex items-center space-x-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>{user.first_name} {user.last_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 py-2 text-red-500"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Chiqish</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}