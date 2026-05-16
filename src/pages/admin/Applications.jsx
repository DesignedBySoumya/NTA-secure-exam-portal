import { useEffect, useState } from 'react'
import { supabase, logAudit } from '../../lib/supabase'
import { Search, Filter, Eye, CheckCircle, XCircle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

export default function Applications() {
  const [apps, setApps] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [centers, setCenters] = useState([])
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    supabase.from('exam_centers').select('id, name, city').then(({ data }) => setCenters(data || []))
  }, [])

  useEffect(() => {
    fetchApps()
  }, [page, search, statusFilter])

  const fetchApps = async () => {
    setLoading(true)
    let query = supabase
      .from('applications')
      .select('*, students(full_name, email, phone, category, photo_url, dob), payments(status, amount)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    if (search) query = query.ilike('students.full_name', `%${search}%`)

    const { data, count } = await query
    setApps(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  const handleAction = async (appId, action, centerId = null) => {
    setActionLoading(true)
    try {
      const updates = { status: action }
      if (action === 'rejected') updates.reject_reason = rejectReason
      if (centerId) updates.center_id = centerId

      await supabase.from('applications').update(updates).eq('id', appId)
      await logAudit(`APPLICATION_${action.toUpperCase()}`, { application_id: appId, center_id: centerId })
      toast.success(`Application ${action} successfully`)
      setSelected(null)
      setRejectReason('')
      fetchApps()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Applications</h1>
        <p className="page-subtitle">Review, approve or reject student applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select className="form-input w-40" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{total} applications found</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-semibold">Candidate</th>
                <th className="px-5 py-3 text-left font-semibold">Post</th>
                <th className="px-5 py-3 text-left font-semibold">Category</th>
                <th className="px-5 py-3 text-left font-semibold">Payment</th>
                <th className="px-5 py-3 text-left font-semibold">Date</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center"><div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : apps.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No applications found</td></tr>
              ) : apps.map(app => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        {app.students?.photo_url
                          ? <img src={app.students.photo_url} className="w-full h-full object-cover" alt="" />
                          : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">{app.students?.full_name?.[0]}</div>}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{app.students?.full_name}</p>
                        <p className="text-xs text-gray-400">{app.students?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-700 max-w-40 truncate">{app.exam_post}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{app.students?.category}</td>
                  <td className="px-5 py-3">
                    <span className={app.payments?.[0]?.status === 'completed' ? 'badge-paid' : 'badge-unpaid'}>
                      {app.payments?.[0]?.status === 'completed' ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3"><span className={`badge-${app.status}`}>{app.status}</span></td>
                  <td className="px-5 py-3">
                    <button onClick={() => setSelected(app)} className="text-blue-700 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary py-1.5 px-3 disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary py-1.5 px-3 disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900">Application Details</h3>
              <button onClick={() => { setSelected(null); setRejectReason('') }} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Student info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 rounded-lg bg-gray-100 overflow-hidden">
                  {selected.students?.photo_url
                    ? <img src={selected.students.photo_url} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-400">No Photo</div>}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{selected.students?.full_name}</h4>
                  <p className="text-sm text-gray-500">{selected.students?.email}</p>
                  <p className="text-sm text-gray-500">{selected.students?.phone}</p>
                  <span className={`badge-${selected.status} mt-2`}>{selected.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Post Applied', value: selected.exam_post },
                  { label: 'Category', value: selected.students?.category },
                  { label: 'Qualification', value: selected.qualification || '—' },
                  { label: 'Date of Birth', value: selected.students?.dob ? new Date(selected.students.dob).toLocaleDateString('en-IN') : '—' },
                  { label: 'Application ID', value: `#${selected.id?.slice(0, 8).toUpperCase()}` },
                  { label: 'Applied On', value: new Date(selected.created_at).toLocaleDateString('en-IN') },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Assign center */}
              <div>
                <label className="form-label">Assign Exam Center</label>
                <select className="form-input" defaultValue={selected.center_id || ''}
                  onChange={e => setSelected({ ...selected, center_id: e.target.value })}>
                  <option value="">Select center...</option>
                  {centers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}
                </select>
              </div>

              {/* Actions */}
              {selected.status === 'pending' && (
                <div className="space-y-3">
                  <div>
                    <label className="form-label">Rejection Reason (if rejecting)</label>
                    <textarea className="form-input" rows={2} placeholder="Optional reason for rejection..."
                      value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleAction(selected.id, 'approved', selected.center_id)}
                      disabled={actionLoading} className="btn-success flex-1">
                      {actionLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={16} />}
                      Approve
                    </button>
                    <button onClick={() => handleAction(selected.id, 'rejected')}
                      disabled={actionLoading} className="btn-danger flex-1">
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {selected.status === 'approved' && selected.center_id !== selected._originalCenter && (
                <button onClick={() => handleAction(selected.id, 'approved', selected.center_id)}
                  disabled={actionLoading} className="btn-primary w-full">
                  <MapPin size={16} /> Update Center Assignment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
