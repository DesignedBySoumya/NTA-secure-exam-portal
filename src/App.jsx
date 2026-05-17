import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import RoleRedirect from './pages/auth/RoleRedirect'

// Student
import StudentDashboard from './pages/student/StudentDashboard'
import StudentProfile from './pages/student/StudentProfile'
import StudentApplication from './pages/student/StudentApplication'
import StudentPayment from './pages/student/StudentPayment'
import AdmitCard from './pages/student/AdmitCard'
import StudentResults from './pages/student/StudentResults'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import Applications from './pages/admin/Applications'
import Students from './pages/admin/Students'
import ExamCenters from './pages/admin/ExamCenters'
import AdminAdmitCards from './pages/admin/AdminAdmitCards'
import AdminResults from './pages/admin/AdminResults'
import MeritList from './pages/admin/MeritList'
import Papers from './pages/admin/Papers'
import AdminExams from './pages/admin/AdminExams'
import AuditLogs from './pages/admin/AuditLogs'

// Center
import CenterDashboard from './pages/center/CenterDashboard'
import QRScanner from './pages/center/QRScanner'
import Attendance from './pages/center/Attendance'
import StaffAttendance from './pages/center/StaffAttendance'
import CenterPapers from './pages/center/CenterPapers'

const STUDENT = ['student']
const ADMIN = ['admin', 'super_admin']
const CENTER = ['center_staff']
const ALL_STAFF = ['admin', 'super_admin', 'center_staff']

function AppLayout({ children, roles }) {
  return (
    <ProtectedRoute allowedRoles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '12px', fontSize: '14px' } }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/redirect" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <p className="text-6xl font-black text-gray-200 mb-4">403</p>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-500">You don't have permission to view this page.</p>
              </div>
            </div>
          } />

          {/* Student */}
          <Route path="/student/dashboard" element={<AppLayout roles={STUDENT}><StudentDashboard /></AppLayout>} />
          <Route path="/student/profile" element={<AppLayout roles={STUDENT}><StudentProfile /></AppLayout>} />
          <Route path="/student/application" element={<AppLayout roles={STUDENT}><StudentApplication /></AppLayout>} />
          <Route path="/student/payment" element={<AppLayout roles={STUDENT}><StudentPayment /></AppLayout>} />
          <Route path="/student/admit-card" element={<AppLayout roles={STUDENT}><AdmitCard /></AppLayout>} />
          <Route path="/student/results" element={<AppLayout roles={STUDENT}><StudentResults /></AppLayout>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<AppLayout roles={ADMIN}><AdminDashboard /></AppLayout>} />
          <Route path="/admin/applications" element={<AppLayout roles={ADMIN}><Applications /></AppLayout>} />
          <Route path="/admin/students" element={<AppLayout roles={ADMIN}><Students /></AppLayout>} />
          <Route path="/admin/centers" element={<AppLayout roles={ADMIN}><ExamCenters /></AppLayout>} />
          <Route path="/admin/admit-cards" element={<AppLayout roles={ADMIN}><AdminAdmitCards /></AppLayout>} />
          <Route path="/admin/results" element={<AppLayout roles={ADMIN}><AdminResults /></AppLayout>} />
          <Route path="/admin/merit-list" element={<AppLayout roles={ADMIN}><MeritList /></AppLayout>} />
          <Route path="/admin/papers" element={<AppLayout roles={ADMIN}><Papers /></AppLayout>} />
          <Route path="/admin/exams" element={<AppLayout roles={ADMIN}><AdminExams /></AppLayout>} />
          <Route path="/admin/audit-logs" element={<AppLayout roles={ADMIN}><AuditLogs /></AppLayout>} />

          {/* Center */}
          <Route path="/center/dashboard" element={<AppLayout roles={CENTER}><CenterDashboard /></AppLayout>} />
          <Route path="/center/scanner" element={<AppLayout roles={CENTER}><QRScanner /></AppLayout>} />
          <Route path="/center/student-attendance" element={<AppLayout roles={CENTER}><Attendance /></AppLayout>} />
          <Route path="/center/staff-attendance" element={<AppLayout roles={CENTER}><StaffAttendance /></AppLayout>} />
          <Route path="/center/papers" element={<AppLayout roles={CENTER}><CenterPapers /></AppLayout>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
