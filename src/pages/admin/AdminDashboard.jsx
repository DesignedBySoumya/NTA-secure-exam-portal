import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, FileText, CheckCircle, CreditCard, Clock, TrendingUp, AlertCircle, MapPin, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, paid: 0, centers: 0 })
  const [recentApps, setRecentApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: total },
        { count: pending },
        { count: approved },
        { count: rejected },
        { count: paid },
        { count: centers },
      ] = await Promise.all([
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('exam_centers').select('*', { count: 'exact', head: true }),
      ])
      setStats({ total, pending, approved, rejected, paid, centers })

      const { data: apps } = await supabase
        .from('applications')
        .select('*, students(full_name, email, category)')
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentApps(apps || [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Registrations', value: stats.total, icon: Users, color: 'blue', bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-700', link: '/admin/applications' },
    { label: 'Pending Verification', value: stats.pending, icon: Clock, color: 'yellow', bg: 'bg-yellow-50', iconBg: 'bg-yellow-100', text: 'text-yellow-700', link: '/admin/applications' },
    { label: 'Approved Students', value: stats.approved, icon: CheckCircle, color: 'green', bg: 'bg-green-50', iconBg: 'bg-green-100', text: 'text-green-700', link: '/admin/applications' },
    { label: 'Payments Completed', value: stats.paid, icon: CreditCard, color: 'purple', bg: 'bg-purple-50', iconBg: 'bg-purple-100', text: 'text-purple-700', link: '/admin/applications' },
    { label: 'Rejected', value: stats.rejected, icon: AlertCircle, color: 'red', bg: 'bg-red-50', iconBg: 'bg-red-100', text: 'text-red-700', link: '/admin/applications' },
    { label: 'Exam Centers', value: stats.centers, icon: MapPin, color: 'indigo', bg: 'bg-indigo-50', iconBg: 'bg-indigo-100', text: 'text-indigo-700', link: '/admin/centers' },
  ]

  if (loading) return <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-10 rounded-3xl text-white shadow-2xl shadow-blue-900/20">
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-2 tracking-tight">Admin Command Center</h1>
          <p className="text-blue-200 text-sm font-medium max-w-xl leading-relaxed">
            Real-time overview of National Exam Portal operations, financial metrics, and candidate verification.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute right-10 -top-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl mix-blend-screen" />
          <div className="absolute right-40 top-20 w-48 h-48 bg-indigo-500 rounded-full blur-3xl mix-blend-screen" />
        </div>
      </div>

      {/* Glassmorphic Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {statCards.map(({ label, value, icon: Icon, color, bg, text, link }) => (
          <Link to={link} key={label} className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4 shadow-inner ring-4 ring-white`}>
                <Icon size={22} className={text} />
              </div>
              <div>
                <p className={`text-3xl font-black ${text} tracking-tight`}>{value ?? 0}</p>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Application Status Chart Container */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl"><TrendingUp size={20} className="text-blue-600" /></div>
              Application Analytics
            </h2>
          </div>
          
          <div className="space-y-6">
            {[
              { label: 'Approved Verified', count: stats.approved, total: stats.total, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Pending Review', count: stats.pending, total: stats.total, color: 'bg-amber-500', bg: 'bg-amber-50' },
              { label: 'Rejected Deficient', count: stats.rejected, total: stats.total, color: 'bg-rose-500', bg: 'bg-rose-50' },
            ].map(({ label, count, total, color, bg }) => {
              const pct = total ? Math.round((count / total) * 100) : 0
              return (
                <div key={label} className="group">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-slate-700">{label}</span>
                    <span className="font-mono text-slate-500 font-medium">{count} ({pct}%)</span>
                  </div>
                  <div className={`h-4 ${bg} rounded-full overflow-hidden p-0.5 border border-slate-100`}>
                    <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Conversion</p>
                <p className="text-4xl font-black text-blue-900">{stats.total ? Math.round((stats.paid / stats.total) * 100) : 0}%</p>
                <p className="text-xs text-blue-700/70 mt-2 font-medium">Payment completion rate</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100/50 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Acceptance</p>
                <p className="text-4xl font-black text-emerald-900">{stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%</p>
                <p className="text-xs text-emerald-700/70 mt-2 font-medium">Overall approval rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 flex flex-col">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl"><Activity size={20} className="text-indigo-600" /></div>
            Command Panel
          </h2>
          <div className="flex-1 space-y-3">
            {[
              { label: 'Review Applications', to: '/admin/applications', color: 'text-amber-700 bg-amber-50 border-amber-100 hover:bg-amber-100', count: stats.pending },
              { label: 'Generate Admit Cards', to: '/admin/admit-cards', color: 'text-blue-700 bg-blue-50 border-blue-100 hover:bg-blue-100' },
              { label: 'Manage Exam Centers', to: '/admin/centers', color: 'text-emerald-700 bg-emerald-50 border-emerald-100 hover:bg-emerald-100' },
              { label: 'Upload Results', to: '/admin/results', color: 'text-purple-700 bg-purple-50 border-purple-100 hover:bg-purple-100' },
              { label: 'Secure Papers', to: '/admin/papers', color: 'text-rose-700 bg-rose-50 border-rose-100 hover:bg-rose-100' },
              { label: 'Security Audit Logs', to: '/admin/audit-logs', color: 'text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100' },
            ].map(({ label, to, color, count }) => (
              <Link key={to} to={to} className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${color} group`}>
                <span className="font-bold text-sm">{label}</span>
                {count !== undefined ? (
                  <span className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-black shadow-sm">{count} pending</span>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black">→</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl"><FileText size={20} className="text-slate-600" /></div>
            Recent Filings
          </h2>
          <Link to="/admin/applications" className="text-sm text-blue-600 font-bold hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-xl">View Directory</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Candidate Profile</th>
                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Exam Target</th>
                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Filing Date</th>
                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentApps.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-medium">System is awaiting applications</td></tr>
              ) : recentApps.map(app => (
                <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{app.students?.full_name || '—'}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{app.students?.email}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">{app.students?.category || 'Gen'}</span>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-700 max-w-xs truncate">{app.exam_post}</td>
                  <td className="px-8 py-5 text-sm font-mono text-slate-500">{new Date(app.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-8 py-5">
                    <span className={`text-xs px-3 py-1.5 rounded-xl font-bold
                      ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                        app.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 
                        'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
