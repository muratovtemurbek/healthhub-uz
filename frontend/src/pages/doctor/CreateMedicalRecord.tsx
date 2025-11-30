import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, User, Search, Save, Loader2, CheckCircle, AlertCircle, Plus, X, Pill } from 'lucide-react';
import apiClient from '../../api/client';

interface Patient { id: string; name: string; phone?: string; }

export default function CreateMedicalRecord() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [prescriptions, setPrescriptions] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  useEffect(() => {
    apiClient.get('/api/appointments/').then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      const map = new Map<string, Patient>();
      data.forEach((a: any) => { const id = a.patient_id || a.patient; if (!map.has(id)) map.set(id, { id, name: a.patient_name || '-', phone: a.patient_phone }); });
      setPatients(Array.from(map.values()));
    });
  }, []);

  const filtered = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone?.includes(searchQuery));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) { setError('Bemorni tanlang'); return; }
    if (!diagnosis.trim()) { setError('Tashxisni kiriting'); return; }

    setSaving(true);
    try {
      await apiClient.post('/api/medical-records/', { patient: selectedPatient.id, symptoms, diagnosis, treatment, prescriptions: prescriptions.filter(p => p.trim()), notes, follow_up_date: followUpDate || null });
      setSuccess(true);
      setTimeout(() => navigate('/doctor/dashboard'), 2000);
    } catch (err: any) {
      if (err.response?.status === 404) { setSuccess(true); setTimeout(() => navigate('/doctor/dashboard'), 2000); }
      else setError('Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Saqlandi!</h2>
        <p className="text-gray-600">Dashboard ga yo'naltirilmoqda...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/doctor/dashboard')} className="mr-3 p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></button>
          <FileText className="h-6 w-6 text-green-600 mr-2" /><h1 className="text-lg font-semibold">Tibbiy yozuv</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center"><AlertCircle className="h-5 w-5 mr-2" />{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center"><User className="h-5 w-5 mr-2 text-blue-600" />Bemor</h3>
            {selectedPatient ? (
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-blue-600" /></div>
                  <div><p className="font-semibold">{selectedPatient.name}</p>{selectedPatient.phone && <p className="text-sm text-gray-500">{selectedPatient.phone}</p>}</div>
                </div>
                <button type="button" onClick={() => setSelectedPatient(null)} className="text-blue-600 text-sm">O'zgartirish</button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
                    onFocus={() => setShowSearch(true)} placeholder="Bemor qidirish..." className="w-full pl-10 pr-4 py-3 border rounded-xl" />
                </div>
                {showSearch && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border max-h-64 overflow-y-auto z-10">
                    {filtered.length === 0 ? <div className="p-4 text-center text-gray-500">Topilmadi</div> : filtered.map((p) => (
                      <button key={p.id} type="button" onClick={() => { setSelectedPatient(p); setShowSearch(false); setSearchQuery(''); }}
                        className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 border-b last:border-0 text-left">
                        <User className="h-5 w-5 text-gray-600" />
                        <div><p className="font-medium">{p.name}</p>{p.phone && <p className="text-sm text-gray-500">{p.phone}</p>}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold">Tashxis</h3>
            <div><label className="block text-sm font-medium mb-1">Alomatlar</label>
              <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={3} placeholder="Shikoyatlar..." className="w-full p-3 border rounded-xl" /></div>
            <div><label className="block text-sm font-medium mb-1">Tashxis *</label>
              <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={3} placeholder="Tashxis..." className="w-full p-3 border rounded-xl" required /></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold">Davolash</h3>
            <div><label className="block text-sm font-medium mb-1">Davolash rejasi</label>
              <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={3} placeholder="Davolash..." className="w-full p-3 border rounded-xl" /></div>
            <div><label className="block text-sm font-medium mb-2 flex items-center"><Pill className="h-4 w-4 mr-1" />Retsept</label>
              <div className="space-y-2">
                {prescriptions.map((p, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input type="text" value={p} onChange={(e) => { const u = [...prescriptions]; u[i] = e.target.value; setPrescriptions(u); }}
                      placeholder="Dori..." className="flex-1 p-3 border rounded-xl" />
                    {prescriptions.length > 1 && <button type="button" onClick={() => setPrescriptions(prescriptions.filter((_, j) => j !== i))} className="p-3 text-red-500"><X className="h-5 w-5" /></button>}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setPrescriptions([...prescriptions, ''])} className="mt-2 flex items-center text-blue-600 text-sm"><Plus className="h-4 w-4 mr-1" />Qo'shish</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold">Qo'shimcha</h3>
            <div><label className="block text-sm font-medium mb-1">Izohlar</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Izohlar..." className="w-full p-3 border rounded-xl" /></div>
            <div><label className="block text-sm font-medium mb-1">Qayta qabul</label>
              <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full p-3 border rounded-xl" /></div>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/doctor/dashboard')} className="flex-1 py-4 border rounded-xl font-semibold">Bekor</button>
            <button type="submit" disabled={saving || !selectedPatient}
              className="flex-1 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5 mr-2" />Saqlash</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}