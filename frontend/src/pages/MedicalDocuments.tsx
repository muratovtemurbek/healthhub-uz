// src/pages/MedicalDocuments.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, FileText, Image, File, Trash2,
  Download, Eye, Plus, Filter, Search, Star,
  Calendar, User, Building2, X, ChevronDown
} from 'lucide-react';
import apiClient from '../api/client';

interface Document {
  id: number;
  title: string;
  document_type: string;
  document_type_display: string;
  file_url: string;
  file_type: string;
  file_size: number;
  file_size_display: string;
  doctor_name: string;
  hospital_name: string;
  document_date: string;
  is_important: boolean;
  created_at: string;
}

const DOCUMENT_TYPES = [
  { id: 'all', name: 'Barchasi' },
  { id: 'analysis', name: 'Tahlillar' },
  { id: 'prescription', name: 'Retseptlar' },
  { id: 'xray', name: 'Rentgen' },
  { id: 'mri', name: 'MRT' },
  { id: 'ultrasound', name: 'UZI' },
  { id: 'certificate', name: 'Spravkalar' },
  { id: 'other', name: 'Boshqa' },
];

export default function MedicalDocuments() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [selectedType]);

  const fetchDocuments = async () => {
    try {
      const params = selectedType !== 'all' ? `?type=${selectedType}` : '';
      const res = await apiClient.get(`/api/accounts/documents/${params}`);
      setDocuments(res.data.documents || []);
    } catch (error) {
      // Demo data
      setDocuments([
        {
          id: 1,
          title: 'Qon tahlili natijasi',
          document_type: 'analysis',
          document_type_display: 'Tahlil natijasi',
          file_url: '/media/documents/blood_test.pdf',
          file_type: 'pdf',
          file_size: 245000,
          file_size_display: '245 KB',
          doctor_name: 'Dr. Akbar Karimov',
          hospital_name: 'Toshkent Tibbiyot Markazi',
          document_date: '2024-01-15',
          is_important: true,
          created_at: '2024-01-15T10:30:00Z',
        },
        {
          id: 2,
          title: 'EKG natijasi',
          document_type: 'analysis',
          document_type_display: 'Tahlil natijasi',
          file_url: '/media/documents/ekg.pdf',
          file_type: 'pdf',
          file_size: 180000,
          file_size_display: '180 KB',
          doctor_name: 'Dr. Malika Rahimova',
          hospital_name: 'Kardiologiya Markazi',
          document_date: '2024-01-10',
          is_important: true,
          created_at: '2024-01-10T14:00:00Z',
        },
        {
          id: 3,
          title: 'Retsept - Lisinopril',
          document_type: 'prescription',
          document_type_display: 'Retsept',
          file_url: '/media/documents/prescription.jpg',
          file_type: 'jpg',
          file_size: 120000,
          file_size_display: '120 KB',
          doctor_name: 'Dr. Akbar Karimov',
          hospital_name: 'Toshkent Tibbiyot Markazi',
          document_date: '2024-01-05',
          is_important: false,
          created_at: '2024-01-05T16:00:00Z',
        },
        {
          id: 4,
          title: "O'pka rentgeni",
          document_type: 'xray',
          document_type_display: 'Rentgen',
          file_url: '/media/documents/xray.jpg',
          file_type: 'jpg',
          file_size: 520000,
          file_size_display: '520 KB',
          doctor_name: 'Dr. Bobur Alimov',
          hospital_name: 'Respublika Shifoxonasi',
          document_date: '2023-12-20',
          is_important: false,
          created_at: '2023-12-20T11:00:00Z',
        },
        {
          id: 5,
          title: 'Tish UZI',
          document_type: 'ultrasound',
          document_type_display: 'UZI',
          file_url: '/media/documents/ultrasound.pdf',
          file_type: 'pdf',
          file_size: 350000,
          file_size_display: '350 KB',
          doctor_name: 'Dr. Nilufar Saidova',
          hospital_name: 'Stomatologiya Klinikasi',
          document_date: '2023-12-15',
          is_important: false,
          created_at: '2023-12-15T09:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.hospital_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (fileType: string) => {
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
      return Image;
    }
    if (fileType === 'pdf') {
      return FileText;
    }
    return File;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'analysis': return 'bg-blue-100 text-blue-600';
      case 'prescription': return 'bg-green-100 text-green-600';
      case 'xray': return 'bg-purple-100 text-purple-600';
      case 'mri': return 'bg-red-100 text-red-600';
      case 'ultrasound': return 'bg-cyan-100 text-cyan-600';
      case 'certificate': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const toggleImportant = async (docId: number) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === docId ? { ...doc, is_important: !doc.is_important } : doc
    ));
  };

  const deleteDocument = async (docId: number) => {
    if (window.confirm("Hujjatni o'chirmoqchimisiz?")) {
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center mb-4">
            <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold">Tibbiy hujjatlar</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish..."
              className="w-full pl-10 pr-4 py-3 bg-white/20 rounded-xl placeholder-white/60 text-white focus:outline-none focus:bg-white/30"
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 -mt-2">
        {/* Type Filter */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-4 overflow-x-auto">
          <div className="flex gap-1">
            {DOCUMENT_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  selectedType === type.id
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            <p className="text-xs text-gray-500">Jami</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">{documents.filter(d => d.is_important).length}</p>
            <p className="text-xs text-gray-500">Muhim</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{documents.filter(d => d.document_type === 'analysis').length}</p>
            <p className="text-xs text-gray-500">Tahlillar</p>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {filteredDocuments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Hujjatlar yo'q</h3>
              <p className="text-gray-500 mt-1">Yangi hujjat yuklang</p>
            </div>
          ) : (
            filteredDocuments.map(doc => {
              const FileIcon = getFileIcon(doc.file_type);
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-3 ${getTypeColor(doc.document_type)}`}>
                        <FileIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{doc.title}</h4>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${getTypeColor(doc.document_type)}`}>
                              {doc.document_type_display}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleImportant(doc.id)}
                            className="p-1"
                          >
                            <Star className={`h-5 w-5 ${doc.is_important ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                          </button>
                        </div>

                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-3.5 w-3.5 mr-1.5" />
                            {doc.doctor_name}
                          </div>
                          <div className="flex items-center">
                            <Building2 className="h-3.5 w-3.5 mr-1.5" />
                            {doc.hospital_name}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1.5" />
                              {new Date(doc.document_date).toLocaleDateString('uz-UZ')}
                            </span>
                            <span className="text-xs text-gray-400">{doc.file_size_display}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex border-t">
                    <button
                      onClick={() => setSelectedDocument(doc)}
                      className="flex-1 flex items-center justify-center py-3 text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Ko'rish</span>
                    </button>
                    <div className="w-px bg-gray-200" />
                    <button
                      className="flex-1 flex items-center justify-center py-3 text-green-600 hover:bg-green-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Yuklash</span>
                    </button>
                    <div className="w-px bg-gray-200" />
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="flex-1 flex items-center justify-center py-3 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">O'chirish</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Upload Button */}
      <button
        onClick={() => setShowUploadModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-teal-700"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={() => { setShowUploadModal(false); fetchDocuments(); }}
        />
      )}

      {/* Document Preview Modal */}
      {selectedDocument && (
        <DocumentPreviewModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onUpload }: { onClose: () => void; onUpload: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    document_type: 'analysis',
    doctor_name: '',
    hospital_name: '',
    document_date: '',
    file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async () => {
    // API call with FormData
    onUpload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-96 sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-900">Hujjat yuklash</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fayl</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
              {formData.file ? (
                <div className="text-center">
                  <FileText className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{formData.file.name}</p>
                  <p className="text-xs text-gray-400">{(formData.file.size / 1024).toFixed(0)} KB</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Fayl tanlang</p>
                  <p className="text-xs text-gray-400">PDF, JPG, PNG</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sarlavha</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl"
              placeholder="Hujjat nomi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turi</label>
            <select
              value={formData.document_type}
              onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl bg-white"
            >
              <option value="analysis">Tahlil natijasi</option>
              <option value="prescription">Retsept</option>
              <option value="xray">Rentgen</option>
              <option value="mri">MRT</option>
              <option value="ultrasound">UZI</option>
              <option value="certificate">Spravka</option>
              <option value="other">Boshqa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shifokor</label>
            <input
              type="text"
              value={formData.doctor_name}
              onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl"
              placeholder="Dr. ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sana</label>
            <input
              type="date"
              value={formData.document_date}
              onChange={(e) => setFormData({ ...formData, document_date: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.file || !formData.title}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Yuklash
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentPreviewModal({ document, onClose }: { document: Document; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 text-white">
        <h3 className="font-medium">{document.title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {['jpg', 'jpeg', 'png', 'gif'].includes(document.file_type) ? (
          <img
            src={document.file_url}
            alt={document.title}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <FileText className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">PDF faylni ko'rish</p>
            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-xl"
            >
              <Eye className="h-5 w-5 mr-2" />
              Ochish
            </a>
          </div>
        )}
      </div>
    </div>
  );
}