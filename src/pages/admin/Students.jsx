import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Users, CheckCircle, Clock, XCircle, AlertTriangle, MapPin,
  Camera, Navigation, Phone, Search, X, ChevronRight, Shield,
  Bell, RefreshCw, Send, Zap, MessageSquare
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
]

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'badge-approved', dot: 'bg-green-500' },
  delayed: { label: 'Delayed', color: 'badge-pending', dot: 'bg-yellow-500' },
  absent: { label: 'Absent', color: 'badge-rejected', dot: 'bg-red-500' },
  offline: { label: 'Offline', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  backup: { label: 'Backup', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
}

const RISK_COLORS = {
  low: 'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
}

export default function StaffOperations() {
  const [staff, setStaff] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({ state: '', role: '', status: '', search: '', risk: '' })
  const [lastSync, setLastSync] = useState(new Date())
  const [isSyncing, setIsSyncing] = useState(false)
  const [logs, setLogs] = useState([
    { id: 1, text: 'Priya Sharma (INV-22418) verified at DL-22', time: '2m ago', type: 'success' },
    { id: 2, text: 'GPS alert: Ramesh Patel (VER-11842) out of range', time: '5m ago', type: 'warning' },
    { id: 3, text: 'Bulk ping sent to Mumbai Tech Hub', time: '12m ago', type: 'info' },
  ])

  const load = async () => {
    setIsSyncing(true)
    const { data, error } = await supabase.from('staff_attendance').select('*').order('created_at', { ascending: false })
    const source = (!error && data?.length > 0) ? data : MOCK_STAFF
    setStaff(source)
    setFiltered(source)
    setLastSync(new Date())
    setIsSyncing(false)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let result = [...staff]
    if (filters.state) result = result.filter(s => s.state === filters.state)
    if (filters.role) result = result.filter(s => s.role === filters.role)
    if (filters.status) result = result.filter(s => s.attendance_status === filters.status)
    if (filters.risk) result = result.filter(s => s.risk_level === filters.risk)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(s =>
        s.full_name.toLowerCase().includes(q) ||
        s.staff_id.toLowerCase().includes(q) ||
        s.center_code.toLowerCase().includes(q)
      )
    }
    // High risk first
    result.sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 }
      return (riskOrder[a.risk_level] ?? 3) - (riskOrder[b.risk_level] ?? 3)
    })
    setFiltered(result)
  }, [filters, staff])

  const states = [...new Set(staff.map(s => s.state).filter(Boolean))]
  const roles = [...new Set(staff.map(s => s.role).filter(Boolean))]

  const counts = {
    total: staff.length,
    active: staff.filter(s => s.attendance_status === 'active').length,
    delayed: staff.filter(s => s.attendance_status === 'delayed').length,
    critical: staff.filter(s => s.risk_level === 'high').length,
  }

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }))
  const clearFilters = () => setFilters({ state: '', role: '', status: '', search: '', risk: '' })

  const broadcastAlert = () => {
    alert("Broadcasting high-priority alert to all active staff members...")
    setLogs([{ id: Date.now(), text: 'System-wide broadcast sent', time: 'Just now', type: 'info' }, ...logs])
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="page-header mb-0">
            <h1 className="page-title flex items-center gap-2">
              Staff Command Center
              <Zap size={20} className="text-blue-600 fill-blue-600" />
            </h1>
            <p className="page-subtitle flex items-center gap-2">
              National Examination Workforce Real-time Telemetry
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1 text-xs">
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                Synced: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={broadcastAlert} className="bg-red-50 text-red-700 border border-red-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-100 transition-colors shadow-sm">
              <Bell size={14} className="animate-bounce" />
              Broadcast Alert
            </button>
            <button onClick={load} className="bg-white border border-gray-200 p-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Operational Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Deployment', value: counts.total, color: 'text-blue-700', bg: 'bg-blue-50', icon: Users, sub: 'Registered Staff' },
            { label: 'Engagement', value: counts.active, color: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle, sub: 'Actively Verified' },
            { label: 'Latency', value: counts.delayed, color: 'text-yellow-700', bg: 'bg-yellow-50', icon: Clock, sub: 'Check-in Delayed' },
            { label: 'Risk Level', value: counts.critical, color: 'text-red-700', bg: 'bg-red-50', icon: Shield, sub: 'High Priority Alerts' },
          ].map(({ label, value, color, bg, icon: Icon, sub }) => (
            <div key={label} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon size={16} className={color} />
                </div>
              </div>
              <p className={`text-3xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Advanced Filters */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="form-input pl-10 text-sm h-10"
              placeholder="Search Staff, ID, or Center..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 h-10 px-2 bg-gray-50 border border-gray-100 rounded-xl">
            <Filter size={14} className="text-gray-400" />
            <select className="bg-transparent border-0 text-xs font-bold text-gray-600 focus:ring-0 cursor-pointer" value={filters.risk} onChange={e => setFilter('risk', e.target.value)}>
              <option value="">All Risks</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <select className="bg-transparent border-0 text-xs font-bold text-gray-600 focus:ring-0 cursor-pointer" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
              <option value="">All Status</option>
              {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          {Object.values(filters).some(Boolean) && (
            <button onClick={clearFilters} className="text-xs font-bold text-red-600 hover:text-red-700 underline px-2">Reset</button>
          )}
        </div>

        {/* Command Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><RefreshCw size={32} className="animate-spin text-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-16 text-center text-gray-400">
            <Shield size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-bold text-gray-500">Telemetry Data Missing</p>
            <p className="text-sm mt-1">No personnel matches the current filtering criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(s => {
              const status = STATUS_CONFIG[s.attendance_status] || STATUS_CONFIG.offline
              const risk = RISK_COLORS[s.risk_level] || RISK_COLORS.low
              return (
                <div
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={`bg-white border border-gray-200 rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden ${s.risk_level === 'high' ? 'ring-2 ring-red-50 ring-offset-0' : ''}`}
                >
                  {/* Risk indicator bar */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${s.risk_level === 'high' ? 'bg-red-500' : s.risk_level === 'medium' ? 'bg-yellow-400' : 'bg-green-500'}`} />
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg group-hover:bg-blue-700 transition-colors">
                        {s.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">{s.staff_id}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${risk}`}>Risk: {s.risk_level}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 leading-tight mt-1">{s.full_name}</h3>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{s.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-gray-400" />
                      <p className="text-xs text-gray-600 font-medium">
                        <span className="font-black text-gray-900">{s.center_code}</span> • {s.center_name}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${s.gps_verified ? 'text-green-600' : 'text-gray-300'}`}>
                          <Navigation size={10} /> GPS
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${s.face_verified ? 'text-green-600' : 'text-gray-300'}`}>
                          <Camera size={10} /> Face
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase flex items-center gap-1.5 ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${s.attendance_status === 'active' ? 'animate-pulse' : ''}`} />
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Activity Log Sidebar */}
      <div className="w-72 hidden 2xl:block">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sticky top-6 shadow-sm">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-between">
            Live Stream
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </h2>
          <div className="space-y-6">
            {logs.map(log => (
              <div key={log.id} className="relative pl-6 border-l-2 border-gray-100 pb-2">
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${log.type === 'warning' ? 'bg-yellow-400' : log.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                <p className="text-[11px] font-bold text-gray-900 leading-tight">{log.text}</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">{log.time}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-colors">
            View Operations Journal
          </button>
        </div>
      </div>

      {/* Detail Slide-Over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto animate-[slideIn_0.2s_ease-out]">
            <div className="p-8 pb-6 relative">
              <button onClick={() => setSelected(null)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
              <div className="w-20 h-20 rounded-3xl bg-slate-950 flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl">
                {selected.full_name.charAt(0)}
              </div>
              <h2 className="text-2xl font-black text-gray-900 leading-none">{selected.full_name}</h2>
              <p className="text-sm font-bold text-blue-600 mt-2">{selected.staff_id} • {selected.role}</p>
            </div>

            <div className="px-8 pb-8 space-y-8">
              <div className="flex gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-black uppercase flex items-center gap-2 ${STATUS_CONFIG[selected.attendance_status]?.color}`}>
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[selected.attendance_status]?.dot}`} />
                  {STATUS_CONFIG[selected.attendance_status]?.label}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-black uppercase border ${RISK_COLORS[selected.risk_level]}`}>
                  {selected.risk_level} Risk
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operational Detail</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Assigned State</p>
                    <p className="text-sm font-black text-gray-900">{selected.state}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Verified By</p>
                    <p className="text-sm font-black text-gray-900">{selected.face_verified ? 'Face ID' : 'Manual'}</p>
                  </div>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Center Coordinates</p>
                  <p className="text-sm font-black text-blue-900">{selected.center_code} - {selected.center_name}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                  <Phone size={18} /> Call Personnel
                </button>
                <button className="w-full py-4 bg-white border-2 border-slate-100 text-gray-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95">
                  <MessageSquare size={18} /> Text Notification
                </button>
                <button className="w-full py-4 bg-white border-2 border-slate-100 text-gray-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95">
                  <RefreshCw size={18} /> Force Re-sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
