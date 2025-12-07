// src/pages/Payments.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CreditCard, CheckCircle, XCircle, Clock,
  Download, Filter, Calendar, ChevronRight, Receipt
} from 'lucide-react';

interface Payment {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: 'payme' | 'click' | 'cash';
  doctor_name: string;
  service: string;
}

const DEMO_PAYMENTS: Payment[] = [
  {
    id: '1',
    date: '2024-01-15',
    amount: 150000,
    status: 'completed',
    method: 'payme',
    doctor_name: 'Dr. Akbar Karimov',
    service: 'Kardiolog konsultatsiya'
  },
  {
    id: '2',
    date: '2024-01-10',
    amount: 80000,
    status: 'completed',
    method: 'click',
    doctor_name: 'Dr. Malika Rahimova',
    service: 'Terapevt konsultatsiya'
  },
  {
    id: '3',
    date: '2024-01-05',
    amount: 120000,
    status: 'completed',
    method: 'cash',
    doctor_name: 'Dr. Bobur Alimov',
    service: 'Nevrolog konsultatsiya'
  },
  {
    id: '4',
    date: '2024-01-02',
    amount: 200000,
    status: 'failed',
    method: 'payme',
    doctor_name: 'Dr. Nilufar Saidova',
    service: 'Pediatr konsultatsiya'
  },
  {
    id: '5',
    date: '2023-12-28',
    amount: 100000,
    status: 'completed',
    method: 'click',
    doctor_name: 'Dr. Jasur Toshmatov',
    service: 'Dermatolog konsultatsiya'
  }
];

export default function Payments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>(DEMO_PAYMENTS);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: "To'langan", icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'pending':
        return { label: 'Kutilmoqda', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'failed':
        return { label: 'Bekor qilingan', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { label: status, icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'payme': return '💳';
      case 'click': return '📱';
      case 'cash': return '💵';
      default: return '💳';
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'payme': return 'Payme';
      case 'click': return 'Click';
      case 'cash': return 'Naqd';
      default: return method;
    }
  };

  const filteredPayments = payments.filter(p => filter === 'all' || p.status === filter);

  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">To'lovlar tarixi</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
          <p className="text-green-100 text-sm">Jami to'langan</p>
          <p className="text-3xl font-bold mt-1">{totalPaid.toLocaleString()} so'm</p>
          <p className="text-green-200 text-sm mt-2">
            {payments.filter(p => p.status === 'completed').length} ta to'lov
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'completed', label: "To'langan" },
            { id: 'pending', label: 'Kutilmoqda' },
            { id: 'failed', label: 'Bekor' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Payments List */}
        <div className="space-y-3">
          {filteredPayments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">To'lovlar yo'q</h3>
              <p className="text-gray-500">Bu filtr bo'yicha to'lovlar topilmadi</p>
            </div>
          ) : (
            filteredPayments.map(payment => {
              const statusConfig = getStatusConfig(payment.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={payment.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getMethodIcon(payment.method)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{payment.doctor_name}</p>
                        <p className="text-sm text-gray-500">{payment.service}</p>
                      </div>
                    </div>
                    <div className={`flex items-center px-2 py-1 rounded-full ${statusConfig.bg}`}>
                      <StatusIcon className={`h-4 w-4 ${statusConfig.color} mr-1`} />
                      <span className={`text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(payment.date).toLocaleDateString('uz-UZ')}
                      <span className="mx-2">•</span>
                      {getMethodName(payment.method)}
                    </div>
                    <p className="font-bold text-gray-900">
                      {payment.amount.toLocaleString()} so'm
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}