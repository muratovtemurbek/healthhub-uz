// src/pages/FamilyMembers.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, Plus, Edit2, Trash2, User,
  Baby, Heart, Loader2, Calendar, Droplet
} from 'lucide-react';
import api from '../services/api';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  relationship_display: string;
  birth_date: string;
  age: number;
  gender: string;
  gender_display: string;
  blood_type: string;
  allergies: string[];
  chronic_conditions: string[];
  notes: string;
}

const RELATIONSHIPS = [
  { value: 'child', label: 'Farzand' },
  { value: 'spouse', label: 'Turmush o\'rtog\'i' },
  { value: 'parent', label: 'Ota-ona' },
  { value: 'sibling', label: 'Aka-uka/opa-singil' },
  { value: 'other', label: 'Boshqa' },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function FamilyMembers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    relationship: 'child',
    birth_date: '',
    gender: 'male',
    blood_type: '',
    allergies: [] as string[],
    chronic_conditions: [] as string[],
    notes: ''
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const response = await api.get('/accounts/family-members/');
      setMembers(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      relationship: 'child',
      birth_date: '',
      gender: 'male',
      blood_type: '',
      allergies: [],
      chronic_conditions: [],
      notes: ''
    });
    setEditingMember(null);
    setShowModal(true);
  };

  const openEditModal = (member: FamilyMember) => {
    setFormData({
      name: member.name,
      relationship: member.relationship,
      birth_date: member.birth_date,
      gender: member.gender,
      blood_type: member.blood_type || '',
      allergies: member.allergies || [],
      chronic_conditions: member.chronic_conditions || [],
      notes: member.notes || ''
    });
    setEditingMember(member);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.birth_date) {
      setError('Ism va tug\'ilgan sanani kiriting');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingMember) {
        await api.patch(`/accounts/family-members/${editingMember.id}/`, formData);
      } else {
        await api.post('/accounts/family-members/', formData);
      }
      setShowModal(false);
      loadMembers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Rostdan ham o\'chirmoqchimisiz?')) return;

    try {
      await api.delete(`/accounts/family-members/${id}/`);
      loadMembers();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        chronic_conditions: [...prev.chronic_conditions, newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      chronic_conditions: prev.chronic_conditions.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Oila a'zolari</h1>
              <p className="text-xs text-gray-500">{members.length} ta a'zo</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {members.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Oila a'zolari yo'q</h3>
            <p className="text-gray-500 mb-6">Oila a'zolaringizni qo'shing</p>
            <button
              onClick={openAddModal}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Qo'shish
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      member.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'
                    }`}>
                      {member.relationship === 'child' ? (
                        <Baby className={`h-6 w-6 ${member.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`} />
                      ) : (
                        <User className={`h-6 w-6 ${member.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`} />
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.relationship_display}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(member)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="h-4 w-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {member.age} yosh
                  </div>
                  {member.blood_type && (
                    <div className="flex items-center text-gray-500">
                      <Droplet className="h-4 w-4 mr-1 text-red-500" />
                      {member.blood_type}
                    </div>
                  )}
                  {member.allergies?.length > 0 && (
                    <div className="flex items-center text-gray-500">
                      <Heart className="h-4 w-4 mr-1 text-orange-500" />
                      {member.allergies.length} allergiya
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">
                {editingMember ? 'Tahrirlash' : 'Yangi a\'zo qo\'shish'}
              </h3>
            </div>

            <div className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ismi</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ismi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qarindoshlik</label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {RELATIONSHIPS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tug'ilgan sana</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jinsi</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                    className={`flex-1 py-2 rounded-lg border-2 ${
                      formData.gender === 'male' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    Erkak
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                    className={`flex-1 py-2 rounded-lg border-2 ${
                      formData.gender === 'female' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                    }`}
                  >
                    Ayol
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qon guruhi</label>
                <select
                  value={formData.blood_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, blood_type: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tanlang</option>
                  {BLOOD_TYPES.map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergiyalar</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Allergiya nomi"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  />
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="px-3 py-2 bg-gray-100 rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.allergies.map((a, i) => (
                    <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center">
                      {a}
                      <button onClick={() => removeAllergy(i)} className="ml-1">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surunkali kasalliklar</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Kasallik nomi"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                  />
                  <button
                    type="button"
                    onClick={addCondition}
                    className="px-3 py-2 bg-gray-100 rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.chronic_conditions.map((c, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
                      {c}
                      <button onClick={() => removeCondition(i)} className="ml-1">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Izoh</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Qo'shimcha ma'lumot"
                />
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
