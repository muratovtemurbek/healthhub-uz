// src/pages/MedicalCard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Droplet, Activity, AlertTriangle,
  Pill, Edit2, Save, X, Plus, Trash2, User, Phone, Loader2
} from 'lucide-react';
import apiClient from '../api/client';

interface MedicalCardData {
  blood_type: string;
  height: number | null;
  weight: number | null;
  allergies: string[];
  chronic_diseases: string[];
  emergency_contact: {
    name: string;
    phone: string;
    relation: string;
  };
  bmi: number | null;
  bmi_status: {
    status: string;
    label: string;
    color: string;
  } | null;
}

const BLOOD_TYPES = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function MedicalCard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [card, setCard] = useState<MedicalCardData>({
    blood_type: '',
    height: null,
    weight: null,
    allergies: [],
    chronic_diseases: [],
    emergency_contact: {
      name: '',
      phone: '',
      relation: ''
    },
    bmi: null,
    bmi_status: null
  });
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<MedicalCardData>(card);
  const [newItem, setNewItem] = useState({ allergies: '', conditions: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Ma'lumotlarni yuklash
  useEffect(() => {
    fetchMedicalCard();
  }, []);

  const fetchMedicalCard = async () => {
    try {
      const response = await apiClient.get('/api/auth/medical-card/');
      const data = response.data;

      // API dan kelgan ma'lumotlarni formatlash
      const formattedData: MedicalCardData = {
        blood_type: data.blood_type || '',
        height: data.height || null,
        weight: data.weight || null,
        allergies: Array.isArray(data.allergies) ? data.allergies :
                   (data.allergies ? data.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        chronic_diseases: Array.isArray(data.chronic_diseases) ? data.chronic_diseases :
                          (data.chronic_diseases ? data.chronic_diseases.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        emergency_contact: data.emergency_contact || { name: '', phone: '', relation: '' },
        bmi: data.bmi || null,
        bmi_status: data.bmi_status || null
      };

      setCard(formattedData);
      setEditData(formattedData);

      // Agar tibbiy karta bo'sh bo'lsa - avtomatik tahrirlash rejimiga o'tish
      if (!data.blood_type && !data.height && !data.weight) {
        setEditing(true);
      }
    } catch (err) {
      console.error('Medical card fetch error:', err);
      setError('Tibbiy kartani yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const payload = {
        blood_type: editData.blood_type,
        height: editData.height,
        weight: editData.weight,
        allergies: editData.allergies,
        chronic_diseases: editData.chronic_diseases,
        emergency_contact: editData.emergency_contact
      };

      const response = await apiClient.patch('/api/auth/medical-card/', payload);

      if (response.data.medical_card) {
        const data = response.data.medical_card;
        const formattedData: MedicalCardData = {
          blood_type: data.blood_type || '',
          height: data.height || null,
          weight: data.weight || null,
          allergies: Array.isArray(data.allergies) ? data.allergies : [],
          chronic_diseases: Array.isArray(data.chronic_diseases) ? data.chronic_diseases : [],
          emergency_contact: data.emergency_contact || { name: '', phone: '', relation: '' },
          bmi: data.bmi || null,
          bmi_status: data.bmi_status || null
        };
        setCard(formattedData);
        setEditData(formattedData);
      }

      setEditing(false);
      setSuccessMessage('Tibbiy karta saqlandi!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type: 'allergies' | 'chronic_diseases', value: string) => {
    if (!value.trim()) return;
    setEditData({
      ...editData,
      [type]: [...editData[type], value.trim()]
    });
    setNewItem({ ...newItem, [type === 'allergies' ? 'allergies' : 'conditions']: '' });
  };

  const removeItem = (type: 'allergies' | 'chronic_diseases', index: number) => {
    setEditData({
      ...editData,
      [type]: editData[type].filter((_, i) => i !== index)
    });
  };

  const getBMI = () => {
    const height = editing ? editData.height : card.height;
    const weight = editing ? editData.weight : card.weight;
    if (!height || !weight) return null;
    const heightM = height / 100;
    return (weight / (heightM * heightM)).toFixed(1);
  };

  const getBMIStatus = () => {
    const bmi = Number(getBMI());
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Kam vazn', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-100' };
    if (bmi < 30) return { label: 'Ortiqcha vazn', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Semizlik', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Tibbiy karta</h1>
          </div>
          {!editing ? (
            <button onClick={() => { setEditing(true); setEditData(card); }} className="flex items-center px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
              <Edit2 className="h-4 w-4 mr-1" />
              Tahrirlash
            </button>
          ) : (
            <div className="flex space-x-2">
              <button onClick={() => { setEditing(false); setEditData(card); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Saqlash
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* First time notice */}
        {editing && !card.blood_type && !card.height && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl">
            <p className="font-medium">Tibbiy kartangizni to'ldiring</p>
            <p className="text-sm mt-1">Bu ma'lumotlar AI tahlil va shifokorlarga yordam beradi.</p>
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Blood Type */}
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Droplet className="h-8 w-8 text-red-600" />
              </div>
              {editing ? (
                <select
                  value={editData.blood_type}
                  onChange={(e) => setEditData({ ...editData, blood_type: e.target.value })}
                  className="w-full px-2 py-1 border rounded text-center text-sm"
                >
                  <option value="">Tanlang</option>
                  {BLOOD_TYPES.filter(bt => bt).map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              ) : (
                <p className="text-2xl font-bold text-red-600">{card.blood_type || '-'}</p>
              )}
              <p className="text-xs text-gray-500">Qon guruhi</p>
            </div>

            {/* Height */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              {editing ? (
                <input
                  type="number"
                  value={editData.height || ''}
                  onChange={(e) => setEditData({ ...editData, height: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-2 py-1 border rounded text-center text-sm"
                  placeholder="sm"
                />
              ) : (
                <p className="text-2xl font-bold text-blue-600">{card.height || '-'}</p>
              )}
              <p className="text-xs text-gray-500">Bo'y (sm)</p>
            </div>

            {/* Weight */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              {editing ? (
                <input
                  type="number"
                  value={editData.weight || ''}
                  onChange={(e) => setEditData({ ...editData, weight: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-2 py-1 border rounded text-center text-sm"
                  placeholder="kg"
                />
              ) : (
                <p className="text-2xl font-bold text-green-600">{card.weight || '-'}</p>
              )}
              <p className="text-xs text-gray-500">Vazn (kg)</p>
            </div>
          </div>

          {/* BMI */}
          {getBMI() && getBMIStatus() && (
            <div className={`mt-4 p-3 rounded-xl ${getBMIStatus()!.bg}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">BMI (Tana massasi indeksi)</span>
                <span className={`font-bold ${getBMIStatus()!.color}`}>
                  {getBMI()} - {getBMIStatus()!.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Allergiyalar</h3>
          </div>

          <div className="space-y-2">
            {(editing ? editData.allergies : card.allergies).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-orange-50 px-3 py-2 rounded-lg">
                <span className="text-orange-700">{item}</span>
                {editing && (
                  <button onClick={() => removeItem('allergies', idx)} className="text-orange-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {editing && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newItem.allergies}
                  onChange={(e) => setNewItem({ ...newItem, allergies: e.target.value })}
                  placeholder="Yangi allergiya..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addItem('allergies', newItem.allergies)}
                />
                <button onClick={() => addItem('allergies', newItem.allergies)} className="px-3 py-2 bg-orange-500 text-white rounded-lg">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}

            {!editing && card.allergies.length === 0 && (
              <p className="text-gray-500 text-sm">Allergiyalar yo'q</p>
            )}
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center mb-3">
            <Heart className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Surunkali kasalliklar</h3>
          </div>

          <div className="space-y-2">
            {(editing ? editData.chronic_diseases : card.chronic_diseases).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-lg">
                <span className="text-red-700">{item}</span>
                {editing && (
                  <button onClick={() => removeItem('chronic_diseases', idx)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {editing && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newItem.conditions}
                  onChange={(e) => setNewItem({ ...newItem, conditions: e.target.value })}
                  placeholder="Yangi kasallik..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addItem('chronic_diseases', newItem.conditions)}
                />
                <button onClick={() => addItem('chronic_diseases', newItem.conditions)} className="px-3 py-2 bg-red-500 text-white rounded-lg">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}

            {!editing && card.chronic_diseases.length === 0 && (
              <p className="text-gray-500 text-sm">Surunkali kasalliklar yo'q</p>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center mb-3">
            <Phone className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Shoshilinch aloqa</h3>
          </div>

          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editData.emergency_contact?.name || ''}
                onChange={(e) => setEditData({ ...editData, emergency_contact: { ...editData.emergency_contact, name: e.target.value } })}
                placeholder="Ism"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="tel"
                value={editData.emergency_contact?.phone || ''}
                onChange={(e) => setEditData({ ...editData, emergency_contact: { ...editData.emergency_contact, phone: e.target.value } })}
                placeholder="Telefon"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                value={editData.emergency_contact?.relation || ''}
                onChange={(e) => setEditData({ ...editData, emergency_contact: { ...editData.emergency_contact, relation: e.target.value } })}
                placeholder="Qarindoshlik (masalan: Ona, Aka)"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          ) : (
            card.emergency_contact?.name ? (
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium">{card.emergency_contact.name}</span>
                  {card.emergency_contact.relation && (
                    <span className="text-gray-500 text-sm ml-2">({card.emergency_contact.relation})</span>
                  )}
                </div>
                {card.emergency_contact.phone && (
                  <a href={`tel:${card.emergency_contact.phone}`} className="flex items-center text-green-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {card.emergency_contact.phone}
                  </a>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Shoshilinch aloqa kiritilmagan</p>
            )
          )}
        </div>
      </main>
    </div>
  );
}
