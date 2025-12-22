// src/components/SOSButton.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function SOSButton() {
  const navigate = useNavigate();
  const [hasActiveSOS, setHasActiveSOS] = useState(false);

  useEffect(() => {
    const checkActiveSOS = async () => {
      try {
        const response = await api.get('/accounts/sos/active/');
        if (response.data && response.data.id) {
          setHasActiveSOS(true);
        }
      } catch {
        setHasActiveSOS(false);
      }
    };

    checkActiveSOS();
  }, []);

  return (
    <button
      onClick={() => navigate('/emergency-sos')}
      className={`fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 transition-transform hover:scale-110 ${
        hasActiveSOS
          ? 'bg-red-600 animate-pulse'
          : 'bg-red-500 hover:bg-red-600'
      }`}
    >
      <AlertTriangle className="h-6 w-6 text-white" />
    </button>
  );
}
