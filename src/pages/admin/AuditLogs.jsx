import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ClipboardList, Filter, Search, RefreshCw } from 'lucide-react'

const ACTION_COLORS = {
  APPLICATION_APPROVED: 'bg-green-100 text-green-700',
  APPLICATION_REJECTED: 'bg-red-100 text-red-700',
  ADMIT_CARD_GENERATED: 'bg-blue-100 text-blue-700',
  RESULT_UPLOADED: 'bg-purple-100 text-purple-700',
  MERIT_LIST_PUBLISHED: 'bg-yellow-100 text-yellow-700',
  PAPER_UPLOADED: 'bg-orange-100 text-orange-700',
  PAPER_ACCESSED: 'bg-gray-100 text-gray-700',
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  useEffect(() => { fetchLogs() }, [])

  const fetchLogs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    setLogs(data || [])
    setLoading(false)
  }

  const uniqueActions = [...new Set(logs.map(l => l.action))]

  const filtered = logs.filter(l => {
    const matchAction = actionFilter === 'all' || l.action === actionFilter
    const matchSearch = !search || l.action.includes(search.toUpperCase()) || l.details?.includes(search)
    return matchAction && matchSearch
  })

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Full activity log for compliance and security monitoring</p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input w-52" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="all">All Actions</option>
          {uniqueActions.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      <div className="table-container">
        <div className="px-6 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">{filtered.length} log entries</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-semibold">Timestamp</th>
                <th className="px-5 py-3 text-left font-semibold">Action</th>
                <th className="px-5 py-3 text-left font-semibold">User</th>
                <th className="px-5 py-3 text-left font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center"><div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">No audit logs found</td></tr>
              ) : filtered.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs font-mono text-gray-500">System</td>
                  <td className="px-5 py-3 text-xs text-gray-600 max-w-xs truncate font-mono">{log.details ? JSON.stringify(log.details) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
