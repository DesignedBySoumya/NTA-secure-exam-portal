import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Users, UserCheck, QrCode, BookOpen, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CenterDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 })
  const [recentScans, setRecentScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [centerName, setCenterName] = useState('')

  useEffect(() => {
    async function load() {
      // Get staff's center
      const { data: role } = await supabase
        .from('user_roles').select('center_id').eq('user_id', user.id).maybeSingle()

      const centerId = role?.center_id
      if (centerId) {
        const { data: center } = await supabase
          .from('exam_centers').select('name').eq('id', centerId).single()
        setCenterName(center?.name || '')

        // Total applications at this center
        const { count: total } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('center_id', centerId)

        // Attendance rows joined through applications for this center
        // attendance has no center_id — filter by matching application_ids
        const { data: appIds } = await supabase
          .from('applications')
          .select('id')
          .eq('center_id', centerId)

        const ids = (appIds || []).map(a => a.id)

        let present = 0
        let scans = []
        if (ids.length > 0) {
          const { count: presentCount } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .in('application_id', ids)
            .eq('status', 'present')
          present = presentCount || 0

          const { data: scanData } = await supabase
            .from('attendance')
            .select('*, applications(exam_post, students(full_name, photo_url), admit_cards(roll_number))')
            .in('application_id', ids)
            .order('created_at', { ascending: false })
            .limit(5)
          scans = scanData || []
        }

        setStats({ total: total || 0, present, absent: (total || 0) - present })
        setRecentScans(scans)
      }
      setLoading(false)
    }
    if (user) load()
  }, [user])

  if (loading) return <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Center Dashboard</h1>
        <p className="page-subtitle">{centerName || 'Exam Center'} — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Total Students', value: stats.total, icon: Users, color: 'blue', bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-700' },
          { label: 'Marked Present', value: stats.present, icon: UserCheck, color: 'green', bg: 'bg-green-50', iconBg: 'bg-green-100', text: 'text-green-700' },
          { label: 'Absent / Not Scanned', value: stats.absent, icon: Clock, color: 'red', bg: 'bg-red-50', iconBg: 'bg-red-100', text: 'text-red-700' },
        ].map(({ label, value, icon: Icon, bg, iconBg, text }) => (
          <div key={label} className={`stat-card ${bg} border-0`}>
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={text} />
            </div>
            <p className={`text-3xl font-bold ${text}`}>{value}</p>
            <p className="text-sm text-gray-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Attendance progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Attendance Progress</h2>
          <span className="text-sm font-semibold text-blue-700">{stats.total ? Math.round((stats.present / stats.total) * 100) : 0}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${stats.total ? (stats.present / stats.total) * 100 : 0}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">{stats.present} of {stats.total} students marked present</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Link to="/center/scanner" className="card hover:shadow-md transition-shadow flex flex-col items-center text-center py-6 gap-3 group">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <QrCode size={28} className="text-blue-700" />
          </div>
          <div>
            <p className="font-bold text-gray-900">QR Scanner</p>
            <p className="text-xs text-gray-500">Scan & verify admit cards</p>
          </div>
        </Link>
        <Link to="/center/attendance" className="card hover:shadow-md transition-shadow flex flex-col items-center text-center py-6 gap-3 group">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <UserCheck size={28} className="text-green-700" />
          </div>
          <div>
            <p className="font-bold text-gray-900">Attendance List</p>
            <p className="text-xs text-gray-500">View and manage attendance</p>
          </div>
        </Link>
        <Link to="/center/papers" className="card hover:shadow-md transition-shadow flex flex-col items-center text-center py-6 gap-3 group">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
            <BookOpen size={28} className="text-orange-700" />
          </div>
          <div>
            <p className="font-bold text-gray-900">Question Papers</p>
            <p className="text-xs text-gray-500">Access released papers</p>
          </div>
        </Link>
      </div>

      {/* Recent scans */}
      {recentScans.length > 0 && (
        <div className="table-container">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Recent Scans</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentScans.map(scan => (
              <div key={scan.id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden">
                  {scan.applications?.students?.photo_url
                    ? <img src={scan.applications.students.photo_url} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{scan.applications?.students?.full_name}</p>
                  <p className="text-xs text-gray-400">Roll: {scan.applications?.admit_cards?.[0]?.roll_number}</p>
                </div>
                <div className="text-right">
                  <span className={`badge-${scan.status === 'present' ? 'verified' : 'rejected'}`}>{scan.status}</span>
                  <p className="text-xs text-gray-400 mt-1">{new Date(scan.created_at).toLocaleTimeString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
