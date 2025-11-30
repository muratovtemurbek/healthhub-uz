import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, Check, CheckCheck, Trash2,
  Calendar, Stethoscope, MessageSquare, Info,
  Loader2, BellOff, RefreshCw
} from 'lucide-react';
import apiClient from '../api/client';

interface Notification {
  id: string;
  type: string;
  type_display: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  time_ago: string;
  appointment_id?: string;
  doctor_id?: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({ total: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await apiClient.get('/api/notifications/', {
        params: { user_id: user.id }
      });
      setNotifications(res.data.notifications || []);
      setStats(res.data.stats || { total: 0, unread: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.post(`/api/notifications/${id}/mark_read/`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await apiClient.post('/api/notifications/mark_all_read/', {
        user_id: user.id
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setStats(prev => ({ ...prev, unread: 0 }));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiClient.delete(`/api/notifications/${id}/`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
      case 'appointment_confirmed':
      case 'appointment_cancelled':
      case 'appointment_completed':
        return <Calendar className="h-5 w-5" />;
      case 'new_message':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
        return 'bg-green-100 text-green-600';
      case 'appointment_cancelled':
        return 'bg-red-100 text-red-600';
      case 'appointment_reminder':
        return 'bg-yellow-100 text-yellow-600';
      case 'appointment_completed':
        return 'bg-blue-100 text-blue-600';
      case 'new_message':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Bell className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-lg font-semibold">Bildirishnomalar</h1>
            {stats.unread > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.unread}
              </span>
            )}
          </div>
          <button onClick={loadNotifications} className="p-2 hover:bg-gray-100 rounded-lg">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Filter & Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              Hammasi ({stats.total})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'unread' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              O'qilmagan ({stats.unread})
            </button>
          </div>

          {stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center text-sm text-blue-600 hover:underline"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Hammasini o'qish
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
            <p className="mt-4 text-gray-500">Yuklanmoqda...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <BellOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'unread' ? 'O\'qilmagan bildirishnoma yo\'q' : 'Bildirishnoma yo\'q'}
            </h3>
            <p className="text-gray-500">Yangi bildirishnomalar bu yerda ko'rinadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-4 shadow-sm transition ${
                  !notification.is_read ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {notification.time_ago}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 mt-3">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {notification.type_display}
                      </span>

                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:underline flex items-center"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          O'qildi
                        </button>
                      )}

                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-500 hover:underline flex items-center"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        O'chirish
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}