// src/pages/doctor/DoctorSchedule.tsx
import { useState } from 'react';
import {
  Calendar, Clock, Plus, Edit2, Trash2,
  ChevronLeft, ChevronRight, Check, X
} from 'lucide-react';

interface TimeSlot {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface DayOff {
  id: number;
  date: string;
  reason: string;
}

export default function DoctorSchedule() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [editMode, setEditMode] = useState(false);

  const [schedule] = useState<TimeSlot[]>([
    { id: 1, day: 'monday', start_time: '09:00', end_time: '13:00', is_active: true },
    { id: 2, day: 'monday', start_time: '14:00', end_time: '18:00', is_active: true },
    { id: 3, day: 'tuesday', start_time: '09:00', end_time: '13:00', is_active: true },
    { id: 4, day: 'tuesday', start_time: '14:00', end_time: '18:00', is_active: true },
    { id: 5, day: 'wednesday', start_time: '09:00', end_time: '13:00', is_active: true },
    { id: 6, day: 'wednesday', start_time: '14:00', end_time: '17:00', is_active: true },
    { id: 7, day: 'thursday', start_time: '09:00', end_time: '13:00', is_active: true },
    { id: 8, day: 'thursday', start_time: '14:00', end_time: '18:00', is_active: true },
    { id: 9, day: 'friday', start_time: '09:00', end_time: '13:00', is_active: true },
    { id: 10, day: 'friday', start_time: '14:00', end_time: '16:00', is_active: true },
    { id: 11, day: 'saturday', start_time: '10:00', end_time: '14:00', is_active: true },
  ]);

  const [daysOff] = useState<DayOff[]>([
    { id: 1, date: '2024-01-25', reason: 'Shaxsiy sabab' },
    { id: 2, date: '2024-02-01', reason: 'Konferensiya' },
  ]);

  const weekDays = [
    { key: 'monday', label: 'Dushanba' },
    { key: 'tuesday', label: 'Seshanba' },
    { key: 'wednesday', label: 'Chorshanba' },
    { key: 'thursday', label: 'Payshanba' },
    { key: 'friday', label: 'Juma' },
    { key: 'saturday', label: 'Shanba' },
    { key: 'sunday', label: 'Yakshanba' },
  ];

  const getDaySlots = (day: string) => {
    return schedule.filter(s => s.day === day && s.is_active);
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Ish jadvali</h1>
          <p className="text-gray-500 mt-1">Qabul vaqtlarini boshqaring</p>
        </div>
        <div className="mt-4 lg:mt-0 flex gap-3">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              editMode ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {editMode ? <Check className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
            {editMode ? 'Saqlash' : 'Tahrirlash'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus className="h-5 w-5" />
            Dam olish kuni
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const prev = new Date(currentWeek);
              prev.setDate(prev.getDate() - 7);
              setCurrentWeek(prev);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-gray-900">
              {weekDates[0].toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })} - {weekDates[6].toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => {
              const next = new Date(currentWeek);
              next.setDate(next.getDate() + 7);
              setCurrentWeek(next);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-7 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          {weekDays.map((day, index) => {
            const slots = getDaySlots(day.key);
            const date = weekDates[index];
            const isToday = new Date().toDateString() === date.toDateString();
            const isDayOff = daysOff.some(d => d.date === date.toISOString().split('T')[0]);

            return (
              <div key={day.key} className={`p-4 ${isToday ? 'bg-blue-50' : ''}`}>
                <div className="text-center mb-4">
                  <p className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    {day.label}
                  </p>
                  <p className={`text-2xl font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </p>
                </div>

                {isDayOff ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <p className="text-red-600 font-medium text-sm">Dam olish</p>
                  </div>
                ) : slots.length > 0 ? (
                  <div className="space-y-2">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-lg ${editMode ? 'bg-blue-100 border-2 border-dashed border-blue-300' : 'bg-green-50 border border-green-200'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>
                          {editMode && (
                            <button className="p-1 text-red-500 hover:bg-red-100 rounded">
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {editMode && (
                      <button className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition">
                        <Plus className="h-4 w-4 mx-auto" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    {day.key === 'sunday' ? (
                      <p className="text-gray-400 text-sm">Dam olish</p>
                    ) : editMode ? (
                      <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition">
                        <Plus className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm">Qo'shish</span>
                      </button>
                    ) : (
                      <p className="text-gray-400 text-sm">Bo'sh</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Days Off */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Dam olish kunlari</h2>
        {daysOff.length > 0 ? (
          <div className="space-y-3">
            {daysOff.map((dayOff) => (
              <div key={dayOff.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <Calendar className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(dayOff.date).toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-sm text-gray-500">{dayOff.reason}</p>
                  </div>
                </div>
                <button className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Dam olish kunlari yo'q</p>
        )}
      </div>
    </div>
  );
}