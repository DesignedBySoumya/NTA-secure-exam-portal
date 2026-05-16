import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Trophy, Medal, Download, Search } from 'lucide-react'

export default function MeritList() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('results')
        .select('*, applications(exam_post, students(full_name, email, category, dob))')
        .not('merit_rank', 'is', null)
        .order('merit_rank')
      setResults(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = results.filter(r => {
    const name = r.applications?.students?.full_name || ''
    const cat = r.applications?.students?.category || ''
    return (
      name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === 'all' || cat === categoryFilter)
    )
  })

  const medalColor = (rank) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-amber-600'
    return 'text-gray-300'
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title">Merit List</h1>
          <p className="page-subtitle">Ranked list of qualifying candidates</p>
        </div>
        <button className="btn-secondary">
          <Download size={16} /> Export PDF
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9" placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input w-40" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {['General', 'OBC', 'SC', 'ST', 'EWS', 'PH'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Top 3 */}
      {!loading && filtered.slice(0, 3).length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 0, 2].map(idx => {
            const r = filtered[idx]
            if (!r) return <div key={idx} />
            return (
              <div key={r.id} className={`card text-center ${idx === 0 ? 'border-yellow-300 bg-yellow-50 order-2' : idx === 1 ? 'border-gray-200 order-1' : 'border-amber-200 bg-amber-50 order-3'}`}>
                <Medal size={32} className={`mx-auto mb-2 ${medalColor(r.merit_rank)}`} />
                <p className={`text-3xl font-black ${medalColor(r.merit_rank)}`}>#{r.merit_rank}</p>
                <p className="font-bold text-gray-900 mt-2">{r.applications?.students?.full_name}</p>
                <p className="text-sm text-gray-500">{r.applications?.students?.category}</p>
                <p className="text-xl font-bold text-blue-700 mt-2">{r.percentage}%</p>
                <p className="text-xs text-gray-400">{r.marks_obtained}/{r.total_marks}</p>
              </div>
            )
          })}
        </div>
      )}

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-semibold">Rank</th>
                <th className="px-5 py-3 text-left font-semibold">Candidate</th>
                <th className="px-5 py-3 text-left font-semibold">Post</th>
                <th className="px-5 py-3 text-left font-semibold">Category</th>
                <th className="px-5 py-3 text-left font-semibold">Marks</th>
                <th className="px-5 py-3 text-left font-semibold">Percentage</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">Merit list not published yet</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className={`hover:bg-gray-50 ${r.merit_rank <= 3 ? 'bg-yellow-50/50' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className={medalColor(r.merit_rank)} />
                      <span className="font-bold text-gray-900">#{r.merit_rank}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold">{r.applications?.students?.full_name}</p>
                    <p className="text-xs text-gray-400">{r.applications?.students?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600 max-w-36 truncate">{r.applications?.exam_post}</td>
                  <td className="px-5 py-3"><span className="badge-pending">{r.applications?.students?.category}</span></td>
                  <td className="px-5 py-3 text-sm font-semibold">{r.marks_obtained}/{r.total_marks}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-16">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${r.percentage}%` }} />
                      </div>
                      <span className="text-sm font-bold text-blue-700">{r.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><span className={r.status === 'passed' ? 'badge-approved' : 'badge-rejected'}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
