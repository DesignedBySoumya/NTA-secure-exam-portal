import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, ShieldAlert, Radio, AlertTriangle, CheckCircle, Clock, XCircle, MapPin, Crosshair, Camera, Navigation, Phone, Filter } from 'lucide-react'

export default function StaffOperations() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)

  const mockStaff = [
    { id: '1', staff_id: 'INV-22418', full_name: 'Priya Sharma', role: 'Senior Invigilator', center_code: 'DL-22', center_name: 'DPS RK Puram', phone: '+91 9876543210', attendance_status: 'active', gps_verified: true, face_verified: true, check_in_time: new Date().toISOString(), risk_level: 'low' },
    { id: '2', staff_id: 'VER-11842', full_name: 'Ramesh Patel', role: 'Verification Officer', center_code: 'GJ-05', center_name: 'KV Ahmedabad', phone: '+91 9876543211', attendance_status: 'delayed', gps_verified: false, face_verified: false, check_in_time: null, risk_level: 'medium' },
    { id: '3', staff_id: 'TEC-09921', full_name: 'Anita Desai', role: 'Technical Operator', center_code: 'MH-12', center_name: 'Mumbai Tech Hub', phone: '+91 9876543212', attendance_status: 'absent', gps_verified: false, face_verified: false, check_in_time: null, risk_level: 'high' },
    { id: '4', staff_id: 'SEC-55410', full_name: 'Vikram Singh', role: 'Security Officer', center_code: 'DL-22', center_name: 'DPS RK Puram', phone: '+91 9876543213', attendance_status: 'active', gps_verified: true, face_verified: true, check_in_time: new Date(Date.now() - 3600000).toISOString(), risk_level: 'low' },
    { id: '5', staff_id: 'MED-77123', full_name: 'Dr. Alok Verma', role: 'Medical Staff', center_code: 'MP-01', center_name: 'Bhopal Central', phone: '+91 9876543214', attendance_status: 'backup', gps_verified: true, face_verified: false, check_in_time: new Date(Date.now() - 1800000).toISOString(), risk_level: 'low' },
    { id: '6', staff_id: 'FLY-33211', full_name: 'Sunita Reddy', role: 'Flying Squad', center_code: 'KA-08', center_name: 'Bangalore East', phone: '+91 9876543215', attendance_status: 'active', gps_verified: true, face_verified: true, check_in_time: new Date(Date.now() - 7200000).toISOString(), risk_level: 'medium' },
    { id: '7', staff_id: 'INV-22419', full_name: 'Karan Malhotra', role: 'Invigilator', center_code: 'DL-22', center_name: 'DPS RK Puram', phone: '+91 9876543216', attendance_status: 'active', gps_verified: true, face_verified: true, check_in_time: new Date(Date.now() - 3000000).toISOString(), risk_level: 'low' },
    { id: '8', staff_id: 'INV-88123', full_name: 'Neha Gupta', role: 'Invigilator', center_code: 'MH-12', center_name: 'Mumbai Tech Hub', phone: '+91 9876543217', attendance_status: 'offline', gps_verified: false, face_verified: false, check_in_time: null, risk_level: 'high' },
  ]

  const [alerts, setAlerts] = useState([
    { id: 1, text: '12 invigilators not checked-in at MH-22', severity: 'warning', color: 'text-amber-400' },
    { id: 2, text: 'Center DL-18 below minimum staff threshold', severity: 'critical', color: 'text-rose-500' },
    { id: 3, text: 'Verification officer logged out unexpectedly', severity: 'warning', color: 'text-amber-400' },
    { id: 4, text: 'Backup staff deployed to MP-12', severity: 'success', color: 'text-emerald-400' },
  ])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data, error } = await supabase.from('staff_attendance').select('*').order('created_at', { ascending: false })
      if (error || !data || data.length === 0) {
        setStaff(mockStaff)
      } else {
        setStaff(data)
      }
      setLoading(false)
    }
    loadData()

    const alertInterval = setInterval(() => {
      setAlerts(prev => {
        const newArr = [...prev]
        const first = newArr.shift()
        newArr.push(first)
        return newArr
      })
    }, 4000)

    return () => clearInterval(alertInterval)
  }, [])

  const statusConfig = {
    active: { label: 'ACTIVE', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle, glow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]' },
    delayed: { label: 'DELAYED', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock, glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]' },
    absent: { label: 'ABSENT', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: XCircle, glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]' },
    offline: { label: 'OFFLINE', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Radio, glow: '' },
    backup: { label: 'BACKUP ASSIGNED', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Users, glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]' },
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-300 p-6 -m-6 rounded-tl-xl font-sans relative overflow-hidden">
      {/* Background cyber grid effect */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        
        {/* Header & Live Alert Stream */}
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
              <Crosshair className="text-emerald-500 animate-pulse" size={28} />
              Live Staff Attendance Grid
            </h1>
            <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Monitoring 48,000+ Examination Staff Across 7,000 Centers
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 w-full lg:w-96 backdrop-blur-xl shadow-2xl flex items-center gap-3 overflow-hidden">
            <Radio size={20} className="text-emerald-500 animate-pulse flex-shrink-0" />
            <div className="flex-1 overflow-hidden relative h-6">
              {alerts.map((alert, idx) => (
                <div key={alert.id} className={`absolute inset-0 flex items-center gap-2 transition-all duration-500 ${idx === 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                  <span className={`text-sm font-bold truncate ${alert.color}`}>{alert.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Status Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Staff', count: '48,240', sub: 'Registered', color: 'text-blue-400', border: 'border-blue-500/30', glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]' },
            { label: 'Checked In', count: '44,892', sub: 'Active', color: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]', pulse: true },
            { label: 'Delayed', count: '2,104', sub: 'Pending Arrival', color: 'text-amber-400', border: 'border-amber-500/30', glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]' },
            { label: 'Absent', count: '1,244', sub: 'Missing', color: 'text-rose-400', border: 'border-rose-500/30', glow: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]' },
            { label: 'Critical Centers', count: '38', sub: 'Understaffed', color: 'text-rose-500', border: 'border-rose-500/50', glow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.4)]', alert: true },
          ].map((stat, i) => (
            <div key={i} className={`bg-slate-900/60 backdrop-blur-md border ${stat.border} p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${stat.glow} flex flex-col justify-between group`}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                {stat.pulse && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                {stat.alert && <ShieldAlert size={16} className="text-rose-500 animate-bounce" />}
              </div>
              <div>
                <p className={`text-3xl font-black font-mono ${stat.color}`}>{stat.count}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/40 p-2 rounded-xl border border-slate-800/50 backdrop-blur-sm">
          <div className="p-2 bg-slate-800/50 rounded-lg"><Filter size={16} className="text-slate-400" /></div>
          {['State', 'Center', 'Role', 'Attendance Status', 'Risk Level'].map(f => (
            <select key={f} className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500/50 transition-colors cursor-pointer appearance-none min-w-[120px]">
              <option>{f}</option>
            </select>
          ))}
          <div className="ml-auto text-xs font-mono text-slate-500 flex items-center gap-2 px-3">
            <Radio size={12} className="text-emerald-500 animate-pulse" /> LIVE SYNC
          </div>
        </div>

        {/* Main Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-slate-900/50 border border-rose-500/30 rounded-2xl p-12 text-center text-rose-400">
            <ShieldAlert size={48} className="mx-auto mb-4 opacity-50 animate-pulse" />
            <h2 className="text-xl font-bold">🚨 No workforce telemetry available</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {staff.map(s => {
              const status = statusConfig[s.attendance_status] || statusConfig.offline
              const StatusIcon = status.icon

              return (
                <div key={s.id} className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all duration-300 group flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold overflow-hidden shadow-inner">
                          {s.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-mono text-xs text-blue-400 font-bold tracking-wider">{s.staff_id}</p>
                          <p className="font-bold text-slate-200 mt-0.5 group-hover:text-white transition-colors">{s.full_name}</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-400 mb-4 font-medium px-2 py-1 bg-slate-800/50 rounded inline-block">{s.role}</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <MapPin size={14} className="text-slate-500" />
                        <span className="font-mono">{s.center_code}</span>
                        <span className="text-slate-500 truncate text-xs">({s.center_name})</span>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Navigation size={12} className={s.gps_verified ? 'text-emerald-500' : 'text-slate-600'} />
                          <span className={s.gps_verified ? 'text-emerald-500' : 'text-slate-500'}>GPS Verified</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Camera size={12} className={s.face_verified ? 'text-emerald-500' : 'text-slate-600'} />
                          <span className={s.face_verified ? 'text-emerald-500' : 'text-slate-500'}>Face Verified</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                        <Clock size={12} />
                        Check-in: <span className="font-mono text-slate-300">{s.check_in_time ? new Date(s.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-black tracking-widest mb-4 ${status.color} ${status.glow}`}>
                      <StatusIcon size={14} />
                      {status.label}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded-lg transition-colors border border-slate-700">View</button>
                      <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-1"><Phone size={12}/> Call</button>
                      <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded-lg transition-colors border border-slate-700">Reassign</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
