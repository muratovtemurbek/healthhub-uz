import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Patient Pages
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import Doctors from './pages/Doctors';
import BookAppointment from './pages/BookAppointment';
import Medicines from './pages/Medicines';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';
import MedicalHistory from './pages/MedicalHistory';
import Notifications from './pages/Notifications';
import TelegramVerification from './pages/TelegramVerification';

// Payment Pages
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentHistory from './pages/PaymentHistory';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import CreateMedicalRecord from './pages/doctor/CreateMedicalRecord';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminPayments from './pages/admin/AdminPayments';
import AdminAppointments from './pages/admin/AdminAppointments';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ========== PATIENT ROUTES ========== */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/ai-chat" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <AIChat />
          </ProtectedRoute>
        } />
        <Route path="/doctors" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Doctors />
          </ProtectedRoute>
        } />
        <Route path="/doctors/:doctorId/book" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <BookAppointment />
          </ProtectedRoute>
        } />
        <Route path="/book-appointment/:doctorId" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <BookAppointment />
          </ProtectedRoute>
        } />
        <Route path="/medicines" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Medicines />
          </ProtectedRoute>
        } />
        <Route path="/appointments" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Appointments />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/medical-history" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <MedicalHistory />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/verify-telegram" element={
          <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
            <TelegramVerification />
          </ProtectedRoute>
        } />

        {/* ========== PAYMENT ROUTES ========== */}
        <Route path="/payment" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PaymentPage />
          </ProtectedRoute>
        } />
        <Route path="/payment/success" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PaymentSuccess />
          </ProtectedRoute>
        } />
        <Route path="/payment/history" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PaymentHistory />
          </ProtectedRoute>
        } />

        {/* ========== DOCTOR ROUTES ========== */}
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/doctor/appointments" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAppointments />
          </ProtectedRoute>
        } />
        <Route path="/doctor/patients" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorPatients />
          </ProtectedRoute>
        } />
        <Route path="/doctor/medical-record/new" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <CreateMedicalRecord />
          </ProtectedRoute>
        } />

        {/* ========== ADMIN ROUTES ========== */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/doctors" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDoctors />
          </ProtectedRoute>
        } />
        <Route path="/admin/hospitals" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminHospitals />
          </ProtectedRoute>
        } />
        <Route path="/admin/payments" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPayments />
          </ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAppointments />
          </ProtectedRoute>
        } />

        {/* ========== 404 ========== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
