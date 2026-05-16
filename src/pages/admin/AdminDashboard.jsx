import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, FileText, CheckCircle, CreditCard, Clock, TrendingUp, AlertCircle, MapPin } from 'lucide-react'
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
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of all registrations, payments, and exam activities</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, bg, iconBg, text, link }) => (
          <Link to={link} key={label} className={`stat-card ${bg} border-0 hover:scale-105 transition-transform`}>
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={text} />
            </div>
            <p className={`text-2xl font-bold ${text}`}>{value ?? 0}</p>
            <p className="text-xs text-gray-600 mt-1 leading-tight">{label}</p>
          </Link>
        ))}
      </div>

      {/* Overview chart (static) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-700" />
              Application Status Overview
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Approved', count: stats.approved, total: stats.total, color: 'bg-green-500' },
              { label: 'Pending', count: stats.pending, total: stats.total, color: 'bg-yellow-400' },
              { label: 'Rejected', count: stats.rejected, total: stats.total, color: 'bg-red-400' },
            ].map(({ label, count, total, color }) => {
              const pct = total ? Math.round((count / total) * 100) : 0
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700 font-medium">{label}</span>
                    <span className="text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Payment Rate</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{stats.total ? Math.round((stats.paid / stats.total) * 100) : 0}%</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Approval Rate</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Review Pending Applications', to: '/admin/applications', color: 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100', count: stats.pending },
              { label: 'Generate Admit Cards', to: '/admin/admit-cards', color: 'text-blue-700 bg-blue-50 hover:bg-blue-100' },
              { label: 'Manage Exam Centers', to: '/admin/centers', color: 'text-green-700 bg-green-50 hover:bg-green-100' },
              { label: 'Upload Results', to: '/admin/results', color: 'text-purple-700 bg-purple-50 hover:bg-purple-100' },
              { label: 'Upload Papers', to: '/admin/papers', color: 'text-red-700 bg-red-50 hover:bg-red-100' },
              { label: 'View Audit Logs', to: '/admin/audit-logs', color: 'text-gray-700 bg-gray-50 hover:bg-gray-100' },
            ].map(({ label, to, color, count }) => (
              <Link key={to} to={to} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${color} text-sm font-medium`}>
                <span>{label}</span>
                {count !== undefined && <span className="bg-white rounded-full px-2 py-0.5 text-xs font-bold">{count}</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent applications */}
      <div className="table-container">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Recent Applications</h2>
          <Link to="/admin/applications" className="text-sm text-blue-700 font-medium hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3 text-left font-semibold">Student</th>
                <th className="px-6 py-3 text-left font-semibold">Category</th>
                <th className="px-6 py-3 text-left font-semibold">Post Applied</th>
                <th className="px-6 py-3 text-left font-semibold">Date</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentApps.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No applications yet</td></tr>
              ) : recentApps.map(app => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <p className="text-sm font-semibold text-gray-900">{app.students?.full_name || '—'}</p>
                    <p className="text-xs text-gray-400">{app.students?.email}</p>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{app.students?.category}</td>
                  <td className="px-6 py-3 text-sm text-gray-700 max-w-48 truncate">{app.exam_post}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{new Date(app.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-3"><span className={`badge-${app.status}`}>{app.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
