import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, ShieldAlert, AlertTriangle, CheckCircle, Clock, XCircle, MapPin, Camera, Navigation, Phone, Filter } from 'lucide-react'

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
    { id: 1, text: '12 invigilators not checked-in at MH-22', severity: 'warning', color: 'text-yellow-800 bg-yellow-100 border-yellow-200' },
    { id: 2, text: 'Center DL-18 below minimum staff threshold', severity: 'critical', color: 'text-red-800 bg-red-100 border-red-200' },
    { id: 3, text: 'Verification officer logged out unexpectedly', severity: 'warning', color: 'text-yellow-800 bg-yellow-100 border-yellow-200' },
    { id: 4, text: 'Backup staff deployed to MP-12', severity: 'success', color: 'text-green-800 bg-green-100 border-green-200' },
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
    active: { label: 'Active', badge: 'bg-green-100 text-green-700', icon: CheckCircle },
    delayed: { label: 'Delayed', badge: 'bg-yellow-100 text-yellow-700', icon: Clock },
    absent: { label: 'Absent', badge: 'bg-red-100 text-red-700', icon: XCircle },
    offline: { label: 'Offline', badge: 'bg-gray-100 text-gray-700', icon: AlertTriangle },
    backup: { label: 'Backup Assigned', badge: 'bg-blue-100 text-blue-700', icon: Users },
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4 items-start justify-between mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title text-gray-900">Staff Attendance Operations</h1>
          <p className="page-subtitle text-gray-500">Monitoring 48,000+ Examination Staff Across 7,000 Centers</p>
        </div>

        {/* Simple Alert Banner */}
        <div className="w-full lg:w-[400px] flex flex-col gap-2 relative overflow-hidden h-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          {alerts.map((alert, idx) => (
            <div key={alert.id} className={`absolute inset-0 flex items-center px-4 transition-all duration-500 ${idx === 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'} ${alert.color}`}>
              <AlertTriangle size={16} className="mr-2" />
              <span className="text-sm font-semibold truncate">{alert.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Staff', count: '48,240', color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Checked In', count: '44,892', color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Delayed', count: '2,104', color: 'text-yellow-700', bg: 'bg-yellow-50' },
            { label: 'Absent', count: '1,244', color: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Critical Centers', count: '38', color: 'text-red-700', bg: 'bg-red-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-3xl font-black mt-2 ${stat.color}`}>{stat.count}</p>
            </div>
          ))}
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-3 items-center">
        <Filter size={18} className="text-gray-400" />
        {['State', 'Center', 'Role', 'Status', 'Risk Level'].map(f => (
          <select key={f} className="form-input py-1.5 text-sm w-auto cursor-pointer">
            <option>{f}</option>
          </select>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" /></div>
      ) : staff.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm">
          <ShieldAlert size={48} className="mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold">No workforce data available</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
           {staff.map(s => {
             const status = statusConfig[s.attendance_status] || statusConfig.offline
             return (
               <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                 <div className="flex justify-between items-start mb-3">
                   <div>
                     <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{s.staff_id}</span>
                     <h3 className="font-bold text-gray-900 mt-2 text-lg leading-tight">{s.full_name}</h3>
                     <p className="text-xs text-gray-500 font-medium">{s.role}</p>
                   </div>
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${status.badge}`}>
                     {s.full_name.charAt(0)}
                   </div>
                 </div>

                 <div className="border-t border-gray-100 pt-3 mt-1 space-y-2 mb-4">
                   <div className="flex items-center gap-2 text-sm text-gray-700">
                     <MapPin size={14} className="text-gray-400" />
                     <span className="font-semibold">{s.center_code}</span>
                     <span className="text-gray-500 truncate text-xs">({s.center_name})</span>
                   </div>
                   
                   <div className="flex gap-4 mt-2">
                     <div className="flex items-center gap-1.5 text-xs font-medium">
                       <Navigation size={12} className={s.gps_verified ? 'text-green-600' : 'text-gray-400'} />
                       <span className={s.gps_verified ? 'text-gray-700' : 'text-gray-400'}>GPS Verified</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-xs font-medium">
                       <Camera size={12} className={s.face_verified ? 'text-green-600' : 'text-gray-400'} />
                       <span className={s.face_verified ? 'text-gray-700' : 'text-gray-400'}>Face Match</span>
                     </div>
                   </div>

                   <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                     <Clock size={12} className="text-gray-400" />
                     Check-in: <span className="font-mono font-medium">{s.check_in_time ? new Date(s.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
                   </div>
                 </div>

                 <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                   <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status.badge}`}>
                     <status.icon size={12} />
                     {status.label}
                   </span>
                   <div className="flex gap-2">
                     <button className="p-1.5 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"><Phone size={16}/></button>
                     <button className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors">Details</button>
                   </div>
                 </div>
               </div>
             )
           })}
        </div>
      )}
    </div>
  )
}
