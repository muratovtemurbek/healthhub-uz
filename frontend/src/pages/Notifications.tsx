// src/pages/Notifications.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, Calendar, MessageCircle, CreditCard,
  Heart, AlertTriangle, Check, Trash2, Settings,
  CheckCheck
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'appointment' | 'message' | 'payment' | 'health' | 'system';
  title: string;
  message: string;
  time: string;
  is_read: boolean;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'appointment',
    title: 'Qabul eslatmasi',
    message: 'Ertaga soat 10:00 da Dr. Akbar Karimov qabuli',
    time: '10 minut oldin',
    is_read: false
  },
  {
    id: '2',
    type: 'message',
    title: 'Yangi xabar',
    message: 'Dr. Malika Rahimova sizga xabar yubordi',
    time: '1 soat oldin',
    is_read: false
  },
  {
    id: '3',
    type: 'payment',
    title: "To'lov muvaffaqiyatli",
    message: "150,000 so'm to'lov qabul qilindi",
    time: '2 soat oldin',
    is_read: true
  },
  {
    id: '4',
    type: 'health',
    title: 'Havo sifati ogohlantirish',
    message: "Bugun havo sifati past. Astma bemorlari ehtiyot bo'lsin",
    time: '5 soat oldin',
    is_read: true
  },
  {
    id: '5',
    type: 'system',
    title: 'Yangilanish',
    message: 'Ilova yangilandi. Yangi funksiyalar qo\'shildi',
    time: 'Kecha',
    is_read: true
  },
  {
    id: '6',
    type: 'appointment',
    title: 'Qabul tasdiqlandi',
    message: 'Dr. Bobur Alimov qabulingizni tasdiqladi',
    time: '2 kun oldin',
    is_read: true
  }
];

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return { icon: Calendar, bg: 'bg-blue-100', color: 'text-blue-600' };
      case 'message': return { icon: MessageCircle, bg: 'bg-green-100', color: 'text-green-600' };
      case 'payment': return { icon: CreditCard, bg: 'bg-purple-100', color: 'text-purple-600' };
      case 'health': return { icon: Heart, bg: 'bg-red-100', color: 'text-red-600' };
      case 'system': return { icon: Bell, bg: 'bg-gray-100', color: 'text-gray-600' };
      default: return { icon: Bell, bg: 'bg-gray-100', color: 'text-gray-600' };
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    if (confirm('Barcha bildirishnomalarni o\'chirmoqchimisiz?')) {
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Bildirishnomalar</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-blue-600">{unreadCount} ta yangi</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Barchasini o'qilgan deb belgilash"
              >
                <CheckCheck className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <button
              onClick={() => navigate('/notification-settings')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bildirishnomalar yo'q</h3>
            <p className="text-gray-500">Yangi bildirishnomalar bu yerda ko'rinadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => {
              const iconConfig = getIcon(notification.type);
              const Icon = iconConfig.icon;

              return (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`bg-white rounded-2xl p-4 shadow-sm cursor-pointer transition-all ${
                    !notification.is_read ? 'border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${iconConfig.bg}`}>
                      <Icon className={`h-5 w-5 ${iconConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded ml-2"
                        >
                          <Trash2 className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-gray-400">{notification.time}</span>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Clear All Button */}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="w-full py-3 text-red-600 text-sm font-medium hover:bg-red-50 rounded-xl transition-colors"
              >
                Barchasini o'chirish
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}