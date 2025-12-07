// src/pages/ChatList.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MessageCircle, Search, Phone, Video,
  MoreVertical, Check, CheckCheck, Clock, Plus,
  User, Stethoscope
} from 'lucide-react';
import apiClient from '../api/client';

interface ChatRoom {
  id: string;
  doctor_id: string;
  doctor_name: string;
  doctor_specialty: string;
  doctor_avatar: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_online: boolean;
}

// Demo data
const DEMO_ROOMS: ChatRoom[] = [
  {
    id: "room-1",
    doctor_id: "doc-1",
    doctor_name: "Dr. Akbar Karimov",
    doctor_specialty: "Kardiolog",
    doctor_avatar: null,
    last_message: "Yaxshi, ertaga soat 10:00 da kutaman",
    last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    unread_count: 2,
    is_online: true
  },
  {
    id: "room-2",
    doctor_id: "doc-2",
    doctor_name: "Dr. Malika Rahimova",
    doctor_specialty: "Terapevt",
    doctor_avatar: null,
    last_message: "Tahlil natijalarini ko'rib chiqdim, hammasi yaxshi",
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    unread_count: 0,
    is_online: false
  },
  {
    id: "room-3",
    doctor_id: "doc-3",
    doctor_name: "Dr. Bobur Alimov",
    doctor_specialty: "Nevrolog",
    doctor_avatar: null,
    last_message: "Dori retseptini yubordim",
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    unread_count: 0,
    is_online: true
  },
];

export default function ChatList() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await apiClient.get('/api/chat/rooms/');
      setRooms(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log('Using demo chat rooms');
      setRooms(DEMO_ROOMS);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Hozir';
    if (minutes < 60) return `${minutes} daq`;
    if (hours < 24) return `${hours} soat`;
    if (days === 1) return 'Kecha';
    if (days < 7) return `${days} kun`;
    return date.toLocaleDateString('uz-UZ');
  };

  const filteredRooms = rooms.filter(room =>
    room.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.doctor_specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = rooms.reduce((sum, room) => sum + room.unread_count, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Xabarlar</h1>
              {totalUnread > 0 && (
                <p className="text-xs text-blue-600">{totalUnread} ta yangi xabar</p>
              )}
            </div>
          </div>
          <Link
            to="/doctors"
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Shifokor qidirish..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hali chatlar yo'q</h3>
            <p className="text-gray-500 mb-4">Shifokor bilan chat boshlash uchun qabulga yoziling</p>
            <Link
              to="/doctors"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Stethoscope className="h-5 w-5 mr-2" />
              Shifokorlar
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRooms.map((room) => (
              <Link
                key={room.id}
                to={`/chat/${room.id}`}
                className="block bg-white rounded-2xl p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      {room.doctor_avatar ? (
                        <img src={room.doctor_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {room.doctor_name.split(' ')[1]?.charAt(0) || 'D'}
                        </span>
                      )}
                    </div>
                    {room.is_online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 ml-4 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{room.doctor_name}</h3>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {formatTime(room.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{room.doctor_specialty}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate pr-2">
                        {room.last_message}
                      </p>
                      {room.unread_count > 0 && (
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {room.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 md:hidden">
        <div className="flex justify-around max-w-md mx-auto">
          <Link to="/dashboard" className="flex flex-col items-center text-gray-400">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Bosh sahifa</span>
          </Link>
          <Link to="/chat" className="flex flex-col items-center text-blue-600">
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs mt-1">Xabarlar</span>
          </Link>
          <Link to="/appointments" className="flex flex-col items-center text-gray-400">
            <Clock className="h-6 w-6" />
            <span className="text-xs mt-1">Qabullar</span>
          </Link>
        </div>
      </div>
    </div>
  );
}