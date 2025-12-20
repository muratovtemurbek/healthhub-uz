// src/pages/EmergencySOS.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, MapPin, AlertTriangle, Plus,
  Loader2, User, Clock, CheckCircle, XCircle, Edit2, Trash2
} from 'lucide-react';
import api from '../services/api';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
}

interface ActiveSOS {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
  status_display: string;
  triggered_at: string;
  notified_contacts: any[];
}

export default function EmergencySOS() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [activeSOS, setActiveSOS] = useState<ActiveSOS | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    relationship: '',
    is_primary: false
  });

  useEffect(() => {
    loadData();
    getCurrentLocation();
  }, []);

  const loadData = async () => {
    try {
      const [contactsRes, sosRes] = await Promise.all([
        api.get('/accounts/emergency-contacts/'),
        api.get('/accounts/sos/active/').catch(() => null)
      ]);
      setContacts(contactsRes.data.results || contactsRes.data || []);
      if (sosRes?.data && sosRes.data.id) {
        setActiveSOS(sosRes.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error('Location error:', error)
      );
    }
  };

  const triggerSOS = async () => {
    if (contacts.length === 0) {
      alert('Avval favqulodda kontakt qo\'shing!');
      return;
    }

    setTriggering(true);
    try {
      const response = await api.post('/accounts/sos/trigger/', {
        latitude: location?.lat,
        longitude: location?.lng,
        address: '',
        notes: ''
      });
      setActiveSOS(response.data.sos);
      setShowSOSModal(false);
      alert('SOS yuborildi! Kontaktlaringizga xabar berildi.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setTriggering(false);
    }
  };

  const cancelSOS = async () => {
    if (!activeSOS) return;
    try {
      await api.post(`/accounts/sos/${activeSOS.id}/cancel/`);
      setActiveSOS(null);
    } catch (err) {
      console.error('Error cancelling SOS:', err);
    }
  };

  const resolveSOS = async () => {
    if (!activeSOS) return;
    try {
      await api.post(`/accounts/sos/${activeSOS.id}/resolve/`);
      setActiveSOS(null);
    } catch (err) {
      console.error('Error resolving SOS:', err);
    }
  };

  const saveContact = async () => {
    if (!contactForm.name || !contactForm.phone) {
      alert('Ism va telefon raqamni kiriting');
      return;
    }

    setSaving(true);
    try {
      if (editingContact) {
        await api.patch(`/accounts/emergency-contacts/${editingContact.id}/`, contactForm);
      } else {
        await api.post('/accounts/emergency-contacts/', contactForm);
      }
      setShowContactModal(false);
      setEditingContact(null);
      setContactForm({ name: '', phone: '', relationship: '', is_primary: false });
      loadData();
    } catch (err) {
      console.error('Error saving contact:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Rostdan ham o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/accounts/emergency-contacts/${id}/`);
      loadData();
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const callEmergency = () => {
    window.location.href = 'tel:112';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Favqulodda yordam</h1>
            <p className="text-xs text-gray-500">SOS va kontaktlar</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Active SOS */}
        {activeSOS && (
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4">
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <span className="font-bold text-red-700">SOS Faol!</span>
            </div>
            <p className="text-sm text-red-600 mb-3">
              {new Date(activeSOS.triggered_at).toLocaleString('uz-UZ')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={resolveSOS}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Hal qilindi
              </button>
              <button
                onClick={cancelSOS}
                className="flex-1 py-2 bg-gray-600 text-white rounded-lg flex items-center justify-center"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Bekor qilish
              </button>
            </div>
          </div>
        )}

        {/* SOS Button */}
        {!activeSOS && (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <button
              onClick={() => setShowSOSModal(true)}
              className="w-32 h-32 bg-red-600 hover:bg-red-700 rounded-full mx-auto flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            >
              <div className="text-center text-white">
                <AlertTriangle className="h-12 w-12 mx-auto mb-1" />
                <span className="font-bold text-lg">SOS</span>
              </div>
            </button>
            <p className="text-gray-500 mt-4">Yordam kerak bo'lganda bosing</p>
          </div>
        )}

        {/* Call 112 */}
        <button
          onClick={callEmergency}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 flex items-center justify-center"
        >
          <Phone className="h-5 w-5 mr-2" />
          112 ga qo'ng'iroq qilish
        </button>

        {/* Location */}
        {location && (
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center">
            <MapPin className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium">Joylashuv aniqlandi</p>
              <p className="text-xs text-gray-500">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Favqulodda kontaktlar</h2>
            <button
              onClick={() => {
                setEditingContact(null);
                setContactForm({ name: '', phone: '', relationship: '', is_primary: false });
                setShowContactModal(true);
              }}
              className="p-2 bg-blue-50 text-blue-600 rounded-lg"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {contacts.length === 0 ? (
            <div className="p-8 text-center">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Kontaktlar yo'q</p>
            </div>
          ) : (
            <div className="divide-y">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      contact.is_primary ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <User className={`h-5 w-5 ${contact.is_primary ? 'text-red-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                      {contact.relationship && (
                        <p className="text-xs text-gray-400">{contact.relationship}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2 bg-green-50 text-green-600 rounded-lg"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => {
                        setEditingContact(contact);
                        setContactForm({
                          name: contact.name,
                          phone: contact.phone,
                          relationship: contact.relationship,
                          is_primary: contact.is_primary
                        });
                        setShowContactModal(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="h-4 w-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* SOS Confirmation Modal */}
      {showSOSModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">SOS yuborilsinmi?</h3>
            <p className="text-gray-500 mb-6">
              Barcha favqulodda kontaktlaringizga xabar yuboriladi
            </p>
            <div className="space-y-3">
              <button
                onClick={triggerSOS}
                disabled={triggering}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {triggering ? 'Yuborilmoqda...' : 'Ha, SOS yuborish'}
              </button>
              <button
                onClick={() => setShowSOSModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">
                {editingContact ? 'Kontaktni tahrirlash' : 'Yangi kontakt'}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ismi</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Ism"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="+998 XX XXX XX XX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qarindoshlik</label>
                <input
                  type="text"
                  value={contactForm.relationship}
                  onChange={(e) => setContactForm(prev => ({ ...prev, relationship: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Masalan: Ota, Ona, Do'st"
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contactForm.is_primary}
                  onChange={(e) => setContactForm(prev => ({ ...prev, is_primary: e.target.checked }))}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Asosiy kontakt</span>
              </label>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 py-2 border rounded-lg"
              >
                Bekor qilish
              </button>
              <button
                onClick={saveContact}
                disabled={saving}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
