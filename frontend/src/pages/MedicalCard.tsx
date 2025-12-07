// src/pages/MedicalCard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Droplet, Activity, AlertTriangle,
  Pill, Edit2, Save, X, Plus, Trash2, User, Phone
} from 'lucide-react';

interface MedicalCard {
  blood_type: string;
  height: number;
  weight: number;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
  emergency_contact: {
    name: string;
    phone: string;
    relation: string;
  };
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function MedicalCard() {
  const navigate = useNavigate();
  const [card, setCard] = useState<MedicalCard>({
    blood_type: 'A+',
    height: 175,
    weight: 70,
    allergies: ['Penisilin', 'Aspirin'],
    chronic_conditions: ['Gipertoniya'],
    current_medications: ['Lisinopril 10mg'],
    emergency_contact: {
      name: 'Karimov Alisher',
      phone: '+998901234567',
      relation: 'Aka'
    }
  });
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<MedicalCard>(card);
  const [newItem, setNewItem] = useState({ allergies: '', conditions: '', medications: '' });

  const handleSave = () => {
    setCard(editData);
    setEditing(false);
  };

  const addItem = (type: 'allergies' | 'chronic_conditions' | 'current_medications', value: string) => {
    if (!value.trim()) return;
    setEditData({
      ...editData,
      [type]: [...editData[type], value.trim()]
    });
    setNewItem({ ...newItem, [type === 'allergies' ? 'allergies' : type === 'chronic_conditions' ? 'conditions' : 'medications']: '' });
  };

  const removeItem = (type: 'allergies' | 'chronic_conditions' | 'current_medications', index: number) => {
    setEditData({
      ...editData,
      [type]: editData[type].filter((_, i) => i !== index)
    });
  };

  const getBMI = () => {
    if (!card.height || !card.weight) return null;
    const heightM = card.height / 100;
    return (card.weight / (heightM * heightM)).toFixed(1);
  };

  const getBMIStatus = () => {
    const bmi = Number(getBMI());
    if (bmi < 18.5) return { label: 'Kam vazn', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-100' };
    if (bmi < 30) return { label: 'Ortiqcha vazn', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Semizlik', color: 'text-red-600', bg: 'bg-red-100' };
  };

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
              <button onClick={() => setEditing(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
              <button onClick={handleSave} className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg">
                <Save className="h-4 w-4 mr-1" />
                Saqlash
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
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
                  {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              ) : (
                <p className="text-2xl font-bold text-red-600">{card.blood_type}</p>
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
                  value={editData.height}
                  onChange={(e) => setEditData({ ...editData, height: Number(e.target.value) })}
                  className="w-full px-2 py-1 border rounded text-center text-sm"
                />
              ) : (
                <p className="text-2xl font-bold text-blue-600">{card.height}</p>
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
                  value={editData.weight}
                  onChange={(e) => setEditData({ ...editData, weight: Number(e.target.value) })}
                  className="w-full px-2 py-1 border rounded text-center text-sm"
                />
              ) : (
                <p className="text-2xl font-bold text-green-600">{card.weight}</p>
              )}
              <p className="text-xs text-gray-500">Vazn (kg)</p>
            </div>
          </div>

          {/* BMI */}
          {getBMI() && (
            <div className={`mt-4 p-3 rounded-xl ${getBMIStatus().bg}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">BMI (Tana massasi indeksi)</span>
                <span className={`font-bold ${getBMIStatus().color}`}>
                  {getBMI()} - {getBMIStatus().label}
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
            {(editing ? editData.chronic_conditions : card.chronic_conditions).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-lg">
                <span className="text-red-700">{item}</span>
                {editing && (
                  <button onClick={() => removeItem('chronic_conditions', idx)} className="text-red-500">
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
                  onKeyPress={(e) => e.key === 'Enter' && addItem('chronic_conditions', newItem.conditions)}
                />
                <button onClick={() => addItem('chronic_conditions', newItem.conditions)} className="px-3 py-2 bg-red-500 text-white rounded-lg">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Medications */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center mb-3">
            <Pill className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Joriy dorilar</h3>
          </div>

          <div className="space-y-2">
            {(editing ? editData.current_medications : card.current_medications).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg">
                <span className="text-purple-700">{item}</span>
                {editing && (
                  <button onClick={() => removeItem('current_medications', idx)} className="text-purple-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {editing && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newItem.medications}
                  onChange={(e) => setNewItem({ ...newItem, medications: e.target.value })}
                  placeholder="Yangi dori..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addItem('current_medications', newItem.medications)}
                />
                <button onClick={() => addItem('current_medications', newItem.medications)} className="px-3 py-2 bg-purple-500 text-white rounded-lg">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
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
                value={editData.emergency_contact.name}
                onChange={(e) => setEditData({ ...editData, emergency_contact: { ...editData.emergency_contact, name: e.target.value } })}
                placeholder="Ism"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="tel"
                value={editData.emergency_contact.phone}
                onChange={(e) => setEditData({ ...editData, emergency_contact: { ...editData.emergency_contact, phone: e.target.value } })}
                placeholder="Telefon"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                value={editData.emergency_contact.relation}
                onChange={(e) => setEditData({ ...editData, emergency_contact: { ...editData.emergency_contact, relation: e.target.value } })}
                placeholder="Qarindoshlik"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          ) : (
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium">{card.emergency_contact.name}</span>
                <span className="text-gray-500 text-sm ml-2">({card.emergency_contact.relation})</span>
              </div>
              <a href={`tel:${card.emergency_contact.phone}`} className="flex items-center text-green-600">
                <Phone className="h-4 w-4 mr-2" />
                {card.emergency_contact.phone}
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}