import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, User, FileText, CreditCard, Download, BarChart3,
  Users, CheckSquare, MapPin, Award, Upload, ListOrdered,
  QrCode, UserCheck, Activity, Lock, BookOpen, ClipboardList,
  LogOut, Menu, X, Shield, Bell, ChevronDown
} from 'lucide-react'

const roleMenus = {
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/student/dashboard' },
    { label: 'My Profile', icon: User, to: '/student/profile' },
    { label: 'Application', icon: FileText, to: '/student/application' },
    { label: 'Payment', icon: CreditCard, to: '/student/payment' },
    { label: 'Admit Card', icon: Download, to: '/student/admit-card' },
    { label: 'Results', icon: BarChart3, to: '/student/results' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
    { label: 'Applications', icon: FileText, to: '/admin/applications' },
    { label: 'Staff Attendance', icon: Users, to: '/admin/students' },
    { label: 'Exam Centers', icon: MapPin, to: '/admin/centers' },
    { label: 'Admit Cards', icon: Award, to: '/admin/admit-cards' },
    { label: 'Results', icon: BarChart3, to: '/admin/results' },
    { label: 'Merit List', icon: ListOrdered, to: '/admin/merit-list' },
    { label: 'Exams', icon: ClipboardList, to: '/admin/exams' },
    { label: 'Papers', icon: BookOpen, to: '/admin/papers' },
    { label: 'Audit Logs', icon: ClipboardList, to: '/admin/audit-logs' },
  ],
  super_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
    { label: 'Applications', icon: FileText, to: '/admin/applications' },
    { label: 'Staff Attendance', icon: Users, to: '/admin/students' },
    { label: 'Exam Centers', icon: MapPin, to: '/admin/centers' },
    { label: 'Admit Cards', icon: Award, to: '/admin/admit-cards' },
    { label: 'Results', icon: BarChart3, to: '/admin/results' },
    { label: 'Merit List', icon: ListOrdered, to: '/admin/merit-list' },
    { label: 'Exams', icon: ClipboardList, to: '/admin/exams' },
    { label: 'Papers', icon: BookOpen, to: '/admin/papers' },
    { label: 'Audit Logs', icon: ClipboardList, to: '/admin/audit-logs' },
    { label: 'User Roles', icon: Shield, to: '/admin/user-roles' },
  ],
  center_staff: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/center/dashboard' },
    { label: 'QR Scanner', icon: QrCode, to: '/center/scanner' },
    { label: 'Student Attendance', icon: UserCheck, to: '/center/student-attendance' },
    { label: 'Staff Attendance', icon: Users, to: '/center/staff-attendance' },
    { label: 'Papers', icon: BookOpen, to: '/center/papers' },
  ],
}

export default function Layout({ children }) {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const menuItems = roleMenus[role] || roleMenus.student

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const roleLabel = {
    student: 'Student',
    admin: 'Administrator',
    super_admin: 'Super Admin',
    center_staff: 'Center Staff',
  }[role] || 'User'

  const roleColor = {
    student: 'bg-blue-100 text-blue-700',
    admin: 'bg-purple-100 text-purple-700',
    super_admin: 'bg-red-100 text-red-700',
    center_staff: 'bg-green-100 text-green-700',
  }[role] || 'bg-gray-100 text-gray-700'

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 lg:w-16'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0 z-30`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 min-h-[64px]">
          <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-blue-700 leading-tight">SECURE NATIONAL</p>
              <p className="text-xs font-bold text-gray-800 leading-tight">EXAM PORTAL</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : 'text-gray-600'}`
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        {sidebarOpen && (
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">{user?.email}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColor}`}>{roleLabel}</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-800">Secure National Exam Portal</h1>
            <p className="text-xs text-gray-400">Government Examination Management System</p>
          </div>

          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <ChevronDown size={14} className="text-gray-500" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-800">{user?.email}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColor}`}>{roleLabel}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
