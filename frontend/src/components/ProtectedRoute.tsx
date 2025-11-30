// src/components/ProtectedRoute.tsx
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string>('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('access');
    const userStr = localStorage.getItem('user');

    console.log('🔒 ProtectedRoute checking...', {
      hasToken: !!token,
      hasUser: !!userStr,
      path: location.pathname
    });

    if (!token || !userStr) {
      console.log('❌ No token or user');
      setIsAuthenticated(false);
      setIsChecking(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const type = user.user_type || 'patient';

      console.log('✅ User found:', { id: user.id, type });

      setUserType(type);
      setIsAuthenticated(true);
    } catch (e) {
      console.log('❌ Invalid user data');
      localStorage.clear();
      setIsAuthenticated(false);
    }

    setIsChecking(false);
  };

  // Loading holati
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  // Autentifikatsiya yo'q
  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role tekshirish
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userType)) {
      console.log('🔒 Role not allowed:', { userType, allowedRoles });

      // To'g'ri dashboard'ga redirect
      if (userType === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userType === 'doctor') {
        return <Navigate to="/doctor/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  console.log('✅ Access granted to:', location.pathname);
  return <>{children}</>;
}