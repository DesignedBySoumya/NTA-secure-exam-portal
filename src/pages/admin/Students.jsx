import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Users, CheckCircle, Clock, XCircle, AlertTriangle, MapPin,
  Camera, Navigation, Phone, Search, X, ChevronRight, Shield
} from 'lucide-react'

const MOCK_STAFF = [
  { id: '1', staff_id: 'INV-22418', full_name: 'Priya Sharma', role: 'Senior Invigilator', center_code: 'DL-22', center_name: 'DPS RK Puram', state: 'Delhi', phone: '+91 9876543210', attendance_status: 'active', gps_verified: true, face_verified: true, check_in_time: new Date().toISOString(), risk_level: 'low' },
  { id: '2', staff_id: 'VER-11842', full_name: 'Ramesh Patel', role: 'Verification Officer', center_code: 'GJ-05', center_name: 'KV Ahmedabad', state: 'Gujarat', phone: '+91 9876543211', attendance_status: 'delayed', gps_verified: false, face_verified: false, check_in_time: null, risk_level: 'medium' },
  { id: '3', staff_id: 'TEC-09921', full_name: 'Anita Desai', role: 'Technical Operator', center_code: 'MH-12', center_name: 'Mumbai Tech Hub', state: 'Maharashtra', phone: '+91 9876543212', attendance_status: 'absent', gps_verified: false, face_verified: false, check_in_time: null, risk_level: 'high' },
  { id: '4', staff_id: 'SEC-55410', full_name: 'Vikram Singh', role: 'Security Officer', center_code: 'DL-22', center_name: 'DPS RK Puram', state: 'Delhi', phone: '+91 9876543213', attendance_status: 'active', gps_verified: true, face_verified: true, check_in_time: new Date(Date.now() - 3600000).toISOString(), risk_level: 'low' },
  { id: '5', staff_id: 'MED-77123', full_name: 'Dr. Alok Verma', role: 'Medical Staff', center_code: 'MP-01', center_name: 'Bhopal Central', state: 'Madhya Pradesh', phone: '+91 9876543214', attendance_status: 'backup', gps_verified: true, face_verified: false, check_in_time: new Date(Date.now() - 1800000).toISOString(), risk_level: 'low' },
  { id: '6', staff_id: 'FLY-33211', full_name: 'Sunita Reddy', role: 'Flying Squad', center_code: 'KA-08', center_name: 'Bangalore East', state: 'Karnataka', phone: '+91 9876543215', attendance_status: 'active', gps_verified: true, face_verified: true, check_in_time: new Date(Date.now() - 7200000).toISOString(), risk_level: 'medium' },
  { id: '7', staff_id: 'INV-22419', full_name: 'Karan Malhotra', role: 'Invigilator', center_code: 'DL-22', center_name: 'DPS RK Puram', state: 'Delhi', phone: '+91 9876543216', attendance_status: 'active', gps_verified: true, face_verified: true, check_in_time: new Date(Date.now() - 3000000).toISOString(), risk_level: 'low' },
  { id: '8', staff_id: 'INV-88123', full_name: 'Neha Gupta', role: 'Invigilator', center_code: 'MH-12', center_name: 'Mumbai Tech Hub', state: 'Maharashtra', phone: '+91 9876543217', attendance_status: 'offline', gps_verified: false, face_verified: false, check_in_time: null, risk_level: 'high' },
  { id: '9', staff_id: 'SEC-11200', full_name: 'Rajesh Kumar', role: 'Security Officer', center_code: 'MP-01', center_name: 'Bhopal Central', state: 'Madhya Pradesh', phone: '+91 9876543218', attendance_status: 'active', gps_verified: true, face_verified: true, check_in_time: new Date(Date.now() - 5400000).toISOString(), risk_level: 'low' },
  { id: '10', staff_id: 'FLY-44512', full_name: 'Meena Pillai', role: 'Flying Squad', center_code: 'GJ-05', center_name: 'KV Ahmedabad', state: 'Gujarat', phone: '+91 9876543219', attendance_status: 'delayed', gps_verified: true, face_verified: false, check_in_time: null, risk_level: 'medium' },
]

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'badge-approved', dot: 'bg-green-500' },
  delayed: { label: 'Delayed', color: 'badge-pending', dot: 'bg-yellow-500' },
  absent: { label: 'Absent', color: 'badge-rejected', dot: 'bg-red-500' },
  offline: { label: 'Offline', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  backup: { label: 'Backup', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
}

export default function StaffOperations() {
  const [staff, setStaff] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({ state: '', role: '', status: '', search: '' })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase.from('staff_attendance').select('*').order('created_at', { ascending: false })
      const source = (!error && data?.length > 0) ? data : MOCK_STAFF
      setStaff(source)
      setFiltered(source)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let result = [...staff]
    if (filters.state) result = result.filter(s => s.state === filters.state)
    if (filters.role) result = result.filter(s => s.role === filters.role)
    if (filters.status) result = result.filter(s => s.attendance_status === filters.status)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(s =>
        s.full_name.toLowerCase().includes(q) ||
        s.staff_id.toLowerCase().includes(q) ||
        s.center_code.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [filters, staff])

  const states = [...new Set(staff.map(s => s.state).filter(Boolean))]
  const roles = [...new Set(staff.map(s => s.role).filter(Boolean))]

  const counts = {
    total: staff.length,
    active: staff.filter(s => s.attendance_status === 'active').length,
    delayed: staff.filter(s => s.attendance_status === 'delayed').length,
    absent: staff.filter(s => s.attendance_status === 'absent').length,
  }

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }))
  const clearFilters = () => setFilters({ state: '', role: '', status: '', search: '' })
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title">Staff Operations</h1>
          <p className="page-subtitle">Examination workforce attendance monitoring and management</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          Live Monitoring
        </div>
      </div>

      {/* Stat Cards — matches Admin Dashboard style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Staff',  value: counts.total,   icon: Users,         bg: 'bg-blue-50',   iconBg: 'bg-blue-100',   text: 'text-blue-700'   },
          { label: 'Checked In',  value: counts.active,   icon: CheckCircle,   bg: 'bg-green-50',  iconBg: 'bg-green-100',  text: 'text-green-700'  },
          { label: 'Delayed',     value: counts.delayed,  icon: Clock,         bg: 'bg-yellow-50', iconBg: 'bg-yellow-100', text: 'text-yellow-700' },
          { label: 'Absent',      value: counts.absent,   icon: XCircle,       bg: 'bg-red-50',    iconBg: 'bg-red-100',    text: 'text-red-700'    },
        ].map(({ label, value, icon: Icon, bg, iconBg, text }) => (
          <div key={label} className={`stat-card ${bg} border-0 hover:scale-105 transition-transform`}>
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={text} />
            </div>
            <p className={`text-2xl font-bold ${text}`}>{value ?? 0}</p>
            <p className="text-xs text-gray-600 mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="form-input pl-9 text-sm"
            placeholder="Search name, ID, center..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
          />
        </div>
        <select className="form-input text-sm w-auto cursor-pointer" value={filters.state} onChange={e => setFilter('state', e.target.value)}>
          <option value="">All States</option>
          {states.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-input text-sm w-auto cursor-pointer" value={filters.role} onChange={e => setFilter('role', e.target.value)}>
          <option value="">All Roles</option>
          {roles.map(r => <option key={r}>{r}</option>)}
        </select>
        <select className="form-input text-sm w-auto cursor-pointer" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Status</option>
          {['active', 'delayed', 'absent', 'offline', 'backup'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <X size={14} /> Clear
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400 font-medium whitespace-nowrap">{filtered.length} of {staff.length} staff</span>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <AlertTriangle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No staff members found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => {
            const status = STATUS_CONFIG[s.attendance_status] || STATUS_CONFIG.offline
            return (
              <div
                key={s.id}
                onClick={() => setSelected(s)}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                      {s.full_name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-600">{s.staff_id}</span>
                      <h3 className="font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">{s.full_name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{s.role}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors mt-1 flex-shrink-0" />
                </div>

                <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-800">{s.center_code}</span>
                    <span className="text-gray-400 truncate">• {s.center_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <span className={`text-xs flex items-center gap-1 ${s.gps_verified ? 'text-green-600' : 'text-gray-400'}`}>
                        <Navigation size={11} /> GPS
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${s.face_verified ? 'text-green-600' : 'text-gray-400'}`}>
                        <Camera size={11} /> Face
                      </span>
                      {s.check_in_time && (
                        <span className="text-xs text-gray-500">
                          🕐 {new Date(s.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Slide-Over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto animate-[slideIn_0.25s_ease-out]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-700 text-white">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-blue-200" />
                <div>
                  <p className="font-mono text-sm text-blue-200">{selected.staff_id}</p>
                  <p className="font-bold text-white">{selected.full_name}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-blue-600 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-6">
              {/* Status */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Attendance Status</p>
                <span className={`text-sm px-4 py-1.5 rounded-full font-bold flex items-center gap-2 w-max ${STATUS_CONFIG[selected.attendance_status]?.color}`}>
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[selected.attendance_status]?.dot}`} />
                  {STATUS_CONFIG[selected.attendance_status]?.label}
                </span>
              </div>

              {/* Details */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Staff Details</p>
                <div className="space-y-3">
                  {[
                    { label: 'Role', value: selected.role },
                    { label: 'State', value: selected.state },
                    { label: 'Phone', value: selected.phone },
                    { label: 'Risk Level', value: selected.risk_level?.toUpperCase() },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">{label}</span>
                      <span className="font-semibold text-gray-900">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Assigned Center</p>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="font-black text-blue-700 font-mono">{selected.center_code}</p>
                  <p className="font-semibold text-gray-800 mt-1">{selected.center_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selected.state}</p>
                </div>
              </div>

              {/* Verification */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Verification Status</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-xl p-3 text-center border ${selected.gps_verified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <Navigation size={20} className={`mx-auto mb-1 ${selected.gps_verified ? 'text-green-600' : 'text-gray-400'}`} />
                    <p className={`text-xs font-bold ${selected.gps_verified ? 'text-green-700' : 'text-gray-500'}`}>
                      {selected.gps_verified ? 'GPS Verified' : 'GPS Pending'}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 text-center border ${selected.face_verified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <Camera size={20} className={`mx-auto mb-1 ${selected.face_verified ? 'text-green-600' : 'text-gray-400'}`} />
                    <p className={`text-xs font-bold ${selected.face_verified ? 'text-green-700' : 'text-gray-500'}`}>
                      {selected.face_verified ? 'Face Matched' : 'Face Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {selected.check_in_time && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Check-In Time</p>
                  <p className="text-2xl font-black text-gray-900">
                    {new Date(selected.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(selected.check_in_time).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 grid grid-cols-2 gap-3">
              <button className="btn-secondary flex items-center justify-center gap-2 w-full">
                <Phone size={15} /> Call
              </button>
              <button className="btn-primary flex items-center justify-center gap-2 w-full">
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
