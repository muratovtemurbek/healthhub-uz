// src/pages/doctor/DoctorChat.tsx
import { useState, useRef, useEffect } from 'react';
import {
  Search, Send, Paperclip, MoreVertical, Phone,
  Video, ArrowLeft, Check, CheckCheck, Clock,
  Image as ImageIcon, File, Smile
} from 'lucide-react';

interface Chat {
  id: number;
  patient_name: string;
  patient_avatar?: string;
  last_message: string;
  last_time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: number;
  text: string;
  sender: 'doctor' | 'patient';
  time: string;
  status: 'sent' | 'delivered' | 'read';
}

export default function DoctorChat() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chats] = useState<Chat[]>([
    { id: 1, patient_name: 'Aziza Karimova', last_message: 'Rahmat, doktor!', last_time: '14:30', unread: 2, online: true },
    { id: 2, patient_name: 'Bobur Aliyev', last_message: "Dori qachon ichishim kerak?", last_time: '13:45', unread: 0, online: false },
    { id: 3, patient_name: 'Dilnoza Rahimova', last_message: 'Tahlil natijalarini yubordim', last_time: '12:20', unread: 1, online: true },
    { id: 4, patient_name: 'Eldor Toshmatov', last_message: 'Yaxshi, tushunarli', last_time: 'Kecha', unread: 0, online: false },
    { id: 5, patient_name: 'Feruza Umarova', last_message: 'Keyingi qabul qachon?', last_time: 'Kecha', unread: 0, online: false },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Assalomu alaykum, doktor!', sender: 'patient', time: '14:00', status: 'read' },
    { id: 2, text: "Vaalaykum assalom! Qanday yordam bera olaman?", sender: 'doctor', time: '14:02', status: 'read' },
    { id: 3, text: "Bosh og'rig'im bor, 2 kundan beri davom etyapti", sender: 'patient', time: '14:05', status: 'read' },
    { id: 4, text: "Og'riq qaysi qismda? Qon bosimingizni o'lchab ko'rdingizmi?", sender: 'doctor', time: '14:07', status: 'read' },
    { id: 5, text: "Chakkamda og'riyapti. Qon bosimim normal - 120/80", sender: 'patient', time: '14:10', status: 'read' },
    { id: 6, text: "Yaxshi. Sizga Paracetamol 500mg tavsiya qilaman. Kuniga 2 marta, ovqatdan keyin iching. Agar 3 kun ichida yaxshilanmasa, qabulga yoziling.", sender: 'doctor', time: '14:15', status: 'read' },
    { id: 7, text: 'Rahmat, doktor!', sender: 'patient', time: '14:30', status: 'read' },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: 'doctor',
      time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="h-4 w-4 text-gray-400" />;
      case 'delivered': return <CheckCheck className="h-4 w-4 text-gray-400" />;
      case 'read': return <CheckCheck className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredChats = chats.filter(c =>
    c.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex bg-gray-50">
      {/* Chat List */}
      <div className={`w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Xabarlar</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chats */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition ${selectedChat?.id === chat.id ? 'bg-blue-50' : ''}`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{chat.patient_name.charAt(0)}</span>
                </div>
                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="flex-1 ml-3 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 truncate">{chat.patient_name}</p>
                  <span className="text-xs text-gray-500">{chat.last_time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{chat.last_message}</p>
              </div>
              {chat.unread > 0 && (
                <span className="ml-2 w-5 h-5 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center">
                  {chat.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSelectedChat(null)}
                className="lg:hidden p-2 mr-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{selectedChat.patient_name.charAt(0)}</span>
                </div>
                {selectedChat.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="ml-3">
                <p className="font-semibold text-gray-900">{selectedChat.patient_name}</p>
                <p className="text-xs text-gray-500">{selectedChat.online ? 'Online' : 'Offline'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Phone className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    msg.sender === 'doctor'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sender === 'doctor' ? 'text-blue-200' : 'text-gray-400'}`}>
                    <span className="text-xs">{msg.time}</span>
                    {msg.sender === 'doctor' && getStatusIcon(msg.status)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Paperclip className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <ImageIcon className="h-5 w-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Xabar yozing..."
                  className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <Smile className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-500">Suhbatni boshlash uchun bemor tanlang</p>
          </div>
        </div>
      )}
    </div>
  );
}