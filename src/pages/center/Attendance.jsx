import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Search, Download, UserCheck, Clock } from 'lucide-react'

export default function Attendance() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [centerId, setCenterId] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: role } = await supabase.from('user_roles').select('center_id').eq('user_id', user.id).single()
      if (!role?.center_id) { setLoading(false); return }
      setCenterId(role.center_id)

      const { data } = await supabase
        .from('applications')
        .select('*, students(full_name, email, photo_url, category), admit_cards(roll_number, exam_date), attendance(*)')
        .eq('center_id', role.center_id)
        .eq('status', 'approved')
        .order('created_at')
      setStudents(data || [])
      setLoading(false)
    }
    if (user) load()
  }, [user])

  const filtered = students.filter(s => {
    const name = s.students?.full_name?.toLowerCase() || ''
    const roll = s.admit_cards?.[0]?.roll_number?.toLowerCase() || ''
    const isPresent = s.attendance?.length > 0
    const matchSearch = name.includes(search.toLowerCase()) || roll.includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'present' && isPresent) || (filter === 'absent' && !isPresent)
    return matchSearch && matchFilter
  })

  const presentCount = students.filter(s => s.attendance?.length > 0).length

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">View all students allotted to your center and their attendance status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card bg-blue-50 border-0">
          <p className="text-2xl font-bold text-blue-700">{students.length}</p>
          <p className="text-sm text-gray-600 mt-1">Total Allotted</p>
        </div>
        <div className="stat-card bg-green-50 border-0">
          <p className="text-2xl font-bold text-green-700">{presentCount}</p>
          <p className="text-sm text-gray-600 mt-1">Present</p>
        </div>
        <div className="stat-card bg-red-50 border-0">
          <p className="text-2xl font-bold text-red-700">{students.length - presentCount}</p>
          <p className="text-sm text-gray-600 mt-1">Absent</p>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9" placeholder="Search by name or roll no..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input w-36" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>
        <button className="btn-secondary"><Download size={16} /> Export</button>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-semibold">Student</th>
                <th className="px-5 py-3 text-left font-semibold">Roll No.</th>
                <th className="px-5 py-3 text-left font-semibold">Category</th>
                <th className="px-5 py-3 text-left font-semibold">Exam Time</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-left font-semibold">Scan Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center"><div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.map(app => {
                const isPresent = app.attendance?.length > 0
                const att = app.attendance?.[0]
                return (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                          {app.students?.photo_url
                            ? <img src={app.students.photo_url} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">{app.students?.full_name?.[0]}</div>}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{app.students?.full_name}</p>
                          <p className="text-xs text-gray-400">{app.students?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-sm">{app.admit_cards?.[0]?.roll_number || '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{app.students?.category}</td>
                    <td className="px-5 py-3 text-sm">{app.admit_cards?.[0]?.exam_date ? new Date(app.admit_cards[0].exam_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}</td>
                    <td className="px-5 py-3">
                      {isPresent
                        ? <span className="badge-verified"><UserCheck size={12} />Present</span>
                        : <span className="badge-unpaid"><Clock size={12} />Absent</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {att?.created_at ? new Date(att.created_at).toLocaleTimeString('en-IN') : '—'}
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
