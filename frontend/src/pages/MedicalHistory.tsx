import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import apiClient from '../api/client';

interface MedicalRecord {
  id: string;
  doctor_name: string;
  diagnosis: string;
  symptoms: string;
  treatment_plan: string;
  prescription: string;
  created_at: string;
}

export default function MedicalHistory() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const response = await apiClient.get('/api/appointments/medical-records/');
      console.log('Medical records API response:', response.data);

      let data = response.data;
      if (data && data.results) data = data.results;

      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Safe array
  const displayRecords = Array.isArray(records) ? records : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/dashboard')} className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Tibbiy Tarix</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : displayRecords.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tibbiy tarix bo'sh</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{record.doctor_name}</h3>
                    <p className="text-sm text-gray-500">{record.created_at}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Tashxis:</span>
                    <p className="text-gray-900">{record.diagnosis}</p>
                  </div>
                  {record.prescription && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-purple-700">Retsept:</span>
                      <p className="text-purple-900">{record.prescription}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}