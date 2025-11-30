    import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  variant?: 'default' | 'admin';
}

export default function Sidebar({ items, variant = 'default' }: SidebarProps) {
  const location = useLocation();

  const getActiveStyle = (href: string) => {
    const isActive = location.pathname === href;
    if (variant === 'admin') {
      return isActive
        ? 'bg-purple-50 text-purple-700 font-medium'
        : 'text-gray-600 hover:bg-gray-50';
    }
    return isActive
      ? 'bg-blue-50 text-blue-700 font-medium'
      : 'text-gray-600 hover:bg-gray-50';
  };

  return (
    <aside className="w-64 bg-white shadow-lg min-h-[calc(100vh-4rem)] hidden lg:block">
      <nav className="p-4 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${getActiveStyle(item.href)}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}