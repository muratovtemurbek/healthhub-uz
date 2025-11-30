import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Search, MapPin, Phone, Clock, Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';
import apiClient from '../../api/client';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  working_hours?: string;
  is_active?: boolean;
}

export default function AdminHospitals() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({ name: '', address: '', phone: '', email: '', working_hours: '' });

  useEffect(() => { loadHospitals(); }, []);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/doctors/hospitals/');
      setHospitals(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingHospital(null);
    setFormData({ name: '', address: '', phone: '', email: '', working_hours: '' });
    setShowModal(true);
  };

  const openEditModal = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setFormData({
      name: hospital.name || '',
      address: hospital.address || '',
      phone: hospital.phone || '',
      email: hospital.email || '',
      working_hours: hospital.working_hours || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.address.trim()) return;
    setSaving(true);
    try {
      if (editingHospital) {
        await apiClient.patch(`/api/doctors/hospitals/${editingHospital.id}/`, formData);
        setHospitals(prev => prev.map(h => h.id === editingHospital.id ? { ...h, ...formData } : h));
      } else {
        const res = await apiClient.post('/api/doctors/hospitals/', formData);
        setHospitals(prev => [...prev, res.data]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteHospital = async (hospital: Hospital) => {
    if (!confirm(`${hospital.name} ni o'chirmoqchimisiz?`)) return;
    try {
      await apiClient.delete(`/api/doctors/hospitals/${hospital.id}/`);
      setHospitals(prev => prev.filter(h => h.id !== hospital.id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = hospitals.filter(h => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return h.name?.toLowerCase().includes(q) || h.address?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/admin/dashboard')} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Building2 className="h-6 w-6 text-orange-600 mr-2" />
            <h1 className="text-lg font-semibold">Shifoxonalar</h1>
          </div>
          <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700">
            <Plus className="h-5 w-5 mr-1" />Qo'shish
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Shifoxona qidirish..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center"><Loader2 className="h-10 w-10 text-orange-600 animate-spin mx-auto" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((hospital) => (
              <div key={hospital.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{hospital.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />{hospital.address}
                      </p>
                    </div>
                  </div>
                </div>
                {hospital.phone && (
                  <p className="text-sm text-gray-500 flex items-center mt-3">
                    <Phone className="h-4 w-4 mr-1" />{hospital.phone}
                  </p>
                )}
                {hospital.working_hours && (
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1" />{hospital.working_hours}
                  </p>
                )}
                <div className="mt-4 pt-4 border-t flex justify-end space-x-2">
                  <button onClick={() => openEditModal(hospital)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button onClick={() => deleteHospital(hospital)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Shifoxona topilmadi</p>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingHospital ? 'Tahrirlash' : 'Yangi shifoxona'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nomi *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border rounded-xl" placeholder="Shifoxona nomi" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Manzil *</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 border rounded-xl" placeholder="Manzil" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefon</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 border rounded-xl" placeholder="+998..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ish vaqti</label>
                <input type="text" value={formData.working_hours} onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                  className="w-full p-3 border rounded-xl" placeholder="08:00 - 18:00" />
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border rounded-xl font-semibold">Bekor</button>
              <button onClick={handleSave} disabled={saving || !formData.name || !formData.address}
                className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50">
                {saving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}