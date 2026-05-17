import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Search, UserCheck, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StaffAttendance() {
  const { user } = useAuth()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [centerId, setCenterId] = useState(null)
  const [markingId, setMarkingId] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: role } = await supabase.from('user_roles').select('center_id').eq('user_id', user.id).single()
      if (!role?.center_id) { setLoading(false); return }
      setCenterId(role.center_id)

      const { data } = await supabase
        .from('user_roles')
        .select('*, staff_attendance(*)')
        .eq('center_id', role.center_id)
      
      setStaff(data || [])
      setLoading(false)
    }
    if (user) load()
  }, [user])

  const markAttendance = async (staffMember) => {
    setMarkingId(staffMember.id)
    try {
      const { error } = await supabase
        .from('staff_attendance')
        .insert({ user_id: staffMember.user_id, center_id: centerId })
      
      if (error) throw error
      
      // Update local state
      setStaff(staff.map(s => s.id === staffMember.id ? { ...s, staff_attendance: [{ created_at: new Date().toISOString() }] } : s))
      toast.success('Attendance marked successfully')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setMarkingId(null)
    }
  }

  const filtered = staff.filter(s => {
    const email = s.user_id?.toLowerCase() || ''
    const role = s.role?.toLowerCase() || ''
    return email.includes(search.toLowerCase()) || role.includes(search.toLowerCase())
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Staff Attendance</h1>
        <p className="page-subtitle">Track and manage attendance for exam center staff</p>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9" placeholder="Search by email or role..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-semibold">Staff Member</th>
                <th className="px-5 py-3 text-left font-semibold">Role</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-left font-semibold">Time</th>
                <th className="px-5 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center"><div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500">No staff members found for this center.</td></tr>
              ) : filtered.map(s => {
                const isPresent = s.staff_attendance?.length > 0
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                           <span className="text-gray-600 font-bold text-xs">{s.user_id[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{s.user_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium capitalize">
                        {s.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {isPresent
                        ? <span className="badge-verified"><UserCheck size={12} />Present</span>
                        : <span className="badge-unpaid"><Clock size={12} />Absent</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {isPresent ? new Date(s.staff_attendance[0].created_at).toLocaleTimeString('en-IN') : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {!isPresent && (
                        <button 
                          onClick={() => markAttendance(s)} 
                          disabled={markingId === s.id}
                          className="btn-primary py-1 px-3 text-xs"
                        >
                          {markingId === s.id ? 'Marking...' : 'Mark Present'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
