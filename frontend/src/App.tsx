// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import DoctorLayout from './layouts/DoctorLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Pages
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import Profile from './pages/Profile';
import AirQuality from './pages/AirQuality';
import MedicalCard from './pages/MedicalCard';
import MedicalHistory from './pages/MedicalHistory';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import Privacy from './pages/Privacy';
import Help from './pages/Help';
import Medicines from './pages/Medicines';
import SymptomChecker from './pages/SymptomChecker';
import ChatList from './pages/ChatList';
import ChatRoom from './pages/ChatRoom';
import ChangePassword from './pages/ChangePassword';
import PaymentPage from './pages/PaymentPage';
import PaymentHistory from './pages/PaymentHistory';
import PaymentSuccess from './pages/PaymentSuccess';
import Home from './pages/Home';
import ProfileEdit from './pages/ProfileEdit';
import TelegramVerification from './pages/TelegramVerification';
import AIChat from './pages/AIChat';
import MedicineReminders from './pages/MedicineReminders';
import HealthAnalytics from './pages/HealthAnalytics';
import Hospitals from './pages/Hospitals';
import MedicalDocuments from './pages/MedicalDocuments';
import VideoCall from './pages/VideoCall';
import NotificationSettings from './pages/NotificationSettings';
import PDFReports from './pages/PDFReports';
import VaccinationCalendar from './pages/VaccinationCalendar';
import LabResults from './pages/LabResults';
import HealthGoals from './pages/HealthGoals';
import VitalSigns from './pages/VitalSigns';
import FamilyMembers from './pages/FamilyMembers';
import EmergencySOS from './pages/EmergencySOS';
import PrescriptionOrders from './pages/PrescriptionOrders';
import LabTests from './pages/LabTests';

// Components
import SOSButton from './components/SOSButton';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorRecords from './pages/doctor/DoctorRecords';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorChat from './pages/doctor/DoctorChat';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminPatients from './pages/admin/AdminPatients';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';

// Auth Guard
function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && user) {
    const userRole = user.role || user.user_type || 'patient';
    if (!allowedRoles.includes(userRole)) {
      if (userRole === 'doctor') return <Navigate to="/doctor" />;
      if (userRole === 'admin') return <Navigate to="/admin" />;
      return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (token && user) {
    const userRole = user.role || user.user_type || 'patient';
    if (userRole === 'doctor') return <Navigate to="/doctor" />;
    if (userRole === 'admin') return <Navigate to="/admin" />;
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

function SOSButtonWrapper() {
  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isPatient = token && user && (user.role === 'patient' || user.user_type === 'patient' || (!user.role && !user.user_type));

  if (!isPatient) return null;
  return <SOSButton />;
}

export default function App() {
  return (
    <BrowserRouter>
      <SOSButtonWrapper />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Patient Routes with bottom nav */}
        <Route path="/" element={<PrivateRoute allowedRoles={['patient']}><MainLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="home" element={<Home />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/:doctorId/book" element={<BookAppointment />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="profile" element={<Profile />} />
          <Route path="medicines" element={<Medicines />} />
        </Route>

        {/* Patient Routes without bottom nav */}
        <Route path="/air-quality" element={<PrivateRoute allowedRoles={['patient']}><AirQuality /></PrivateRoute>} />
        <Route path="/medical-card" element={<PrivateRoute allowedRoles={['patient']}><MedicalCard /></PrivateRoute>} />
        <Route path="/medical-history" element={<PrivateRoute allowedRoles={['patient']}><MedicalHistory /></PrivateRoute>} />
        <Route path="/payments" element={<PrivateRoute allowedRoles={['patient']}><Payments /></PrivateRoute>} />
        <Route path="/payment" element={<PrivateRoute allowedRoles={['patient']}><PaymentPage /></PrivateRoute>} />
        <Route path="/payment-history" element={<PrivateRoute allowedRoles={['patient']}><PaymentHistory /></PrivateRoute>} />
        <Route path="/payment-success" element={<PrivateRoute allowedRoles={['patient']}><PaymentSuccess /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute allowedRoles={['patient']}><Notifications /></PrivateRoute>} />
        <Route path="/privacy" element={<PrivateRoute allowedRoles={['patient']}><Privacy /></PrivateRoute>} />
        <Route path="/help" element={<PrivateRoute allowedRoles={['patient']}><Help /></PrivateRoute>} />
        <Route path="/symptom-checker" element={<PrivateRoute allowedRoles={['patient']}><SymptomChecker /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute allowedRoles={['patient']}><ChatList /></PrivateRoute>} />
        <Route path="/chat/:roomId" element={<PrivateRoute allowedRoles={['patient']}><ChatRoom /></PrivateRoute>} />
        <Route path="/video-call/:roomId" element={<PrivateRoute allowedRoles={['patient', 'doctor']}><VideoCall /></PrivateRoute>} />
        <Route path="/ai-chat" element={<PrivateRoute allowedRoles={['patient']}><AIChat /></PrivateRoute>} />
        <Route path="/change-password" element={<PrivateRoute allowedRoles={['patient']}><ChangePassword /></PrivateRoute>} />
        <Route path="/profile/edit" element={<PrivateRoute allowedRoles={['patient']}><ProfileEdit /></PrivateRoute>} />
        <Route path="/telegram-verification" element={<PrivateRoute allowedRoles={['patient']}><TelegramVerification /></PrivateRoute>} />
        <Route path="/medicine-reminders" element={<PrivateRoute allowedRoles={['patient']}><MedicineReminders /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute allowedRoles={['patient']}><HealthAnalytics /></PrivateRoute>} />
        <Route path="/hospitals" element={<PrivateRoute allowedRoles={['patient']}><Hospitals /></PrivateRoute>} />
        <Route path="/documents" element={<PrivateRoute allowedRoles={['patient']}><MedicalDocuments /></PrivateRoute>} />
        <Route path="/notification-settings" element={<PrivateRoute allowedRoles={['patient']}><NotificationSettings /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute allowedRoles={['patient']}><PDFReports /></PrivateRoute>} />
        <Route path="/vaccinations" element={<PrivateRoute allowedRoles={['patient']}><VaccinationCalendar /></PrivateRoute>} />
        <Route path="/lab-results" element={<PrivateRoute allowedRoles={['patient']}><LabResults /></PrivateRoute>} />
        <Route path="/health-goals" element={<PrivateRoute allowedRoles={['patient']}><HealthGoals /></PrivateRoute>} />
        <Route path="/vital-signs" element={<PrivateRoute allowedRoles={['patient']}><VitalSigns /></PrivateRoute>} />
        <Route path="/family" element={<PrivateRoute allowedRoles={['patient']}><FamilyMembers /></PrivateRoute>} />
        <Route path="/emergency-sos" element={<PrivateRoute allowedRoles={['patient']}><EmergencySOS /></PrivateRoute>} />
        <Route path="/prescription-orders" element={<PrivateRoute allowedRoles={['patient']}><PrescriptionOrders /></PrivateRoute>} />
        <Route path="/lab-tests" element={<PrivateRoute allowedRoles={['patient']}><LabTests /></PrivateRoute>} />

        {/* Doctor Routes */}
        <Route path="/doctor" element={<PrivateRoute allowedRoles={['doctor']}><DoctorLayout /></PrivateRoute>}>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="records" element={<DoctorRecords />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="chat" element={<DoctorChat />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}