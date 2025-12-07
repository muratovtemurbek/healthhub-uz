// src/pages/ChatRoom.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Paperclip, Mic, MoreVertical,
  Phone, Video, Image, Smile, Check, CheckCheck,
  Clock, AlertCircle, X, Camera
} from 'lucide-react';
import apiClient from '../api/client';

interface Message {
  id: string;
  sender: 'patient' | 'doctor';
  sender_name: string;
  content: string;
  message_type: string;
  file_url?: string;
  is_read: boolean;
  created_at: string;
  is_sending?: boolean;
  is_error?: boolean;
}

interface DoctorInfo {
  id: string;
  name: string;
  specialty: string;
  avatar: string | null;
  is_online: boolean;
}

// Demo data
const DEMO_DOCTORS: Record<string, DoctorInfo> = {
  'room-1': { id: 'doc-1', name: 'Dr. Akbar Karimov', specialty: 'Kardiolog', avatar: null, is_online: true },
  'room-2': { id: 'doc-2', name: 'Dr. Malika Rahimova', specialty: 'Terapevt', avatar: null, is_online: false },
  'room-3': { id: 'doc-3', name: 'Dr. Bobur Alimov', specialty: 'Nevrolog', avatar: null, is_online: true },
};

const DEMO_MESSAGES: Record<string, Message[]> = {
  'room-1': [
    { id: 'msg-1', sender: 'doctor', sender_name: 'Dr. Akbar Karimov', content: 'Assalomu alaykum! Qanday yordam bera olaman?', message_type: 'text', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
    { id: 'msg-2', sender: 'patient', sender_name: 'Siz', content: "Vaalaykum assalom! Ko'krak sohasida og'riq bor", message_type: 'text', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 3.9).toISOString() },
    { id: 'msg-3', sender: 'doctor', sender_name: 'Dr. Akbar Karimov', content: "Qachondan beri og'riyapti? Qanday og'riq - keskin yoki o'tmas?", message_type: 'text', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 3.8).toISOString() },
    { id: 'msg-4', sender: 'patient', sender_name: 'Siz', content: "2-3 kundan beri. O'tmas og'riq, ba'zan kuchayadi", message_type: 'text', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString() },
    { id: 'msg-5', sender: 'doctor', sender_name: 'Dr. Akbar Karimov', content: "Tushundim. EKG va qon tahlili qilish kerak bo'ladi. Klinikaga kelishingiz mumkinmi?", message_type: 'text', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    { id: 'msg-6', sender: 'patient', sender_name: 'Siz', content: 'Ha, ertaga kela olaman', message_type: 'text', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 'msg-7', sender: 'doctor', sender_name: 'Dr. Akbar Karimov', content: 'Yaxshi, ertaga soat 10:00 da kutaman. Manzil: Toshkent Tibbiyot Markazi, 3-qavat, 305-xona', message_type: 'text', is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  ],
  'room-2': [
    { id: 'msg-10', sender: 'patient', sender_name: 'Siz', content: 'Salom doktor, tahlil natijalari tayyor bo\'ldimi?', message_type: 'text', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString() },
    { id: 'msg-11', sender: 'doctor', sender_name: 'Dr. Malika Rahimova', content: "Salom! Ha, hozir ko'rib chiqaman", message_type: 'text', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24.5).toISOString() },
    { id: 'msg-12', sender: 'doctor', sender_name: 'Dr. Malika Rahimova', content: "Tahlil natijalarini ko'rib chiqdim, hammasi yaxshi. Gemoglobin 140, qand 5.2, xolesterin norma. Sog'lom ekansiz! 👍", message_type: 'text', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  ],
  'room-3': [
    { id: 'msg-20', sender: 'doctor', sender_name: 'Dr. Bobur Alimov', content: "Salom! Bosh og'rig'i qanday?", message_type: 'text', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
    { id: 'msg-21', sender: 'patient', sender_name: 'Siz', content: "Yaxshiroq, lekin hali to'liq o'tmadi", message_type: 'text', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 49).toISOString() },
    { id: 'msg-22', sender: 'doctor', sender_name: 'Dr. Bobur Alimov', content: "Dori retseptini yubordim. Kuniga 2 marta, ovqatdan keyin iching. 5 kunlik kurs. Agar yaxshilanmasa, albatta qayta murojaat qiling.", message_type: 'text', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
  ],
};

export default function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchMessages();
      fetchDoctorInfo();

      // Polling for new messages (real-time simulation)
      const interval = setInterval(() => {
        // In production, use WebSocket
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDoctorInfo = () => {
    if (roomId && DEMO_DOCTORS[roomId]) {
      setDoctor(DEMO_DOCTORS[roomId]);
    } else {
      setDoctor({
        id: 'doc-new',
        name: 'Dr. Shifokor',
        specialty: 'Mutaxassis',
        avatar: null,
        is_online: true
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await apiClient.get(`/api/chat/rooms/${roomId}/messages/`);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log('Using demo messages');
      if (roomId && DEMO_MESSAGES[roomId]) {
        setMessages(DEMO_MESSAGES[roomId]);
      } else {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const content = newMessage.trim();
    if (!content || sending) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      sender: 'patient',
      sender_name: 'Siz',
      content,
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
      is_sending: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const response = await apiClient.post(`/api/chat/rooms/${roomId}/send/`, {
        content,
        message_type: 'text'
      });

      // Update temp message with real data
      setMessages(prev => prev.map(msg =>
        msg.id === tempId
          ? { ...response.data, is_sending: false }
          : msg
      ));

      // Simulate doctor typing response
      simulateDoctorResponse();
    } catch (error) {
      console.log('Message sent (demo)');
      // Mark as sent in demo mode
      setMessages(prev => prev.map(msg =>
        msg.id === tempId
          ? { ...msg, is_sending: false }
          : msg
      ));

      simulateDoctorResponse();
    } finally {
      setSending(false);
    }
  };

  const simulateDoctorResponse = () => {
    // Simulate typing indicator
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      // Auto responses
      const responses = [
        "Tushundim, rahmat ma'lumot uchun 👍",
        "Yaxshi, kuzatib boramiz",
        "Agar savollaringiz bo'lsa, bemalol yozing",
        "Sog'lom bo'ling! 🏥",
        "Ha, albatta. Ertaga kutaman"
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const doctorMessage: Message = {
        id: `auto-${Date.now()}`,
        sender: 'doctor',
        sender_name: doctor?.name || 'Dr. Shifokor',
        content: randomResponse,
        message_type: 'text',
        is_read: false,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, doctorMessage]);
    }, 2000 + Math.random() * 2000);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Bugun';
    if (date.toDateString() === yesterday.toDateString()) return 'Kecha';
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    msgs.forEach(msg => {
      const msgDate = formatDate(msg.created_at);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm flex-shrink-0">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <button onClick={() => navigate('/chat')} className="mr-3 p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>

            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {doctor?.name.split(' ')[1]?.charAt(0) || 'D'}
                </span>
              </div>
              {doctor?.is_online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>

            <div className="ml-3 min-w-0">
              <h1 className="font-semibold text-gray-900 truncate">{doctor?.name}</h1>
              <p className="text-xs text-gray-500">
                {doctor?.is_online ? (
                  <span className="text-green-600">Online</span>
                ) : (
                  <span>Offline</span>
                )}
                {' • '}{doctor?.specialty}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Phone className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Video className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-gray-700 font-medium mb-1">Chat boshlang</h3>
            <p className="text-sm text-gray-500">Shifokorga xabar yuboring</p>
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div key={`group-${groupIndex}`}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {group.date}
                </span>
              </div>

              {/* Messages */}
              {group.messages.map((msg, msgIndex) => (
                <div
                  key={msg.id}
                  className={`flex mb-3 ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${msg.sender === 'patient' ? 'order-2' : ''}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        msg.sender === 'patient'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                      } ${msg.is_sending ? 'opacity-70' : ''}`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>

                    <div className={`flex items-center mt-1 text-xs text-gray-400 ${
                      msg.sender === 'patient' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{formatTime(msg.created_at)}</span>
                      {msg.sender === 'patient' && (
                        <span className="ml-1">
                          {msg.is_sending ? (
                            <Clock className="h-3 w-3" />
                          ) : msg.is_read ? (
                            <CheckCheck className="h-3 w-3 text-blue-400" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center mb-3">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Actions popup */}
      {showActions && (
        <div className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 z-10">
          <div className="grid grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Camera className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-600">Kamera</span>
            </button>
            <button className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Image className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-600">Galereya</span>
            </button>
            <button className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Paperclip className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs text-gray-600">Fayl</span>
            </button>
            <button className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <Mic className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-xs text-gray-600">Ovoz</span>
            </button>
          </div>
          <button
            onClick={() => setShowActions(false)}
            className="w-full mt-3 py-2 text-gray-500 text-sm hover:bg-gray-100 rounded-lg"
          >
            Bekor qilish
          </button>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
          >
            {showActions ? (
              <X className="h-6 w-6 text-gray-500" />
            ) : (
              <Paperclip className="h-6 w-6 text-gray-500" />
            )}
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Xabar yozing..."
              className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full">
              <Smile className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {newMessage.trim() ? (
            <button
              onClick={sendMessage}
              disabled={sending}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button className="p-3 hover:bg-gray-100 rounded-full flex-shrink-0">
              <Mic className="h-6 w-6 text-gray-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}