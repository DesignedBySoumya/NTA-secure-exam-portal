import { useEffect, useState } from 'react'
import { supabase, logAudit } from '../../lib/supabase'
import { Upload, Search, BarChart3, Save, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminResults() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(null)
  const [editRow, setEditRow] = useState({})

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('applications')
        .select('*, students(full_name, email, category), results(*)')
        .eq('status', 'approved')
        .order('created_at')
      setApps(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleSaveResult = async (app) => {
    const vals = editRow[app.id] || {}
    const marksObtained = parseFloat(vals.marks_obtained || app.results?.[0]?.marks_obtained || 0)
    const totalMarks = parseFloat(vals.total_marks || app.results?.[0]?.total_marks || 300)
    const percentage = (marksObtained / totalMarks * 100).toFixed(2)
    const status = marksObtained >= (totalMarks * 0.4) ? 'passed' : 'failed'

    setSaving(app.id)
    try {
      const payload = {
        application_id: app.id,
        marks_obtained: marksObtained,
        total_marks: totalMarks,
        percentage: parseFloat(percentage),
        status,
        cutoff_marks: vals.cutoff_marks || app.results?.[0]?.cutoff_marks || 120,
        subject_scores: vals.subject_scores || app.results?.[0]?.subject_scores,
      }
      if (app.results?.[0]) {
        await supabase.from('results').update(payload).eq('id', app.results[0].id)
      } else {
        await supabase.from('results').insert(payload)
      }
      await logAudit('RESULT_UPLOADED', { application_id: app.id, marks: marksObtained })
      toast.success('Result saved!')
      // Reload
      const { data } = await supabase.from('applications').select('*, students(full_name, email, category), results(*)').eq('status', 'approved').order('created_at')
      setApps(data || [])
      setEditRow(prev => { const n = { ...prev }; delete n[app.id]; return n })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(null)
    }
  }

  const publishMeritList = async () => {
    // Rank by percentage desc
    const withResults = apps.filter(a => a.results?.[0]).sort((a, b) => b.results[0].percentage - a.results[0].percentage)
    for (let i = 0; i < withResults.length; i++) {
      await supabase.from('results').update({ merit_rank: i + 1 }).eq('id', withResults[i].results[0].id)
    }
    await logAudit('MERIT_LIST_PUBLISHED', { count: withResults.length })
    toast.success(`Merit list published for ${withResults.length} candidates!`)
    const { data } = await supabase.from('applications').select('*, students(full_name, email, category), results(*)').eq('status', 'approved').order('created_at')
    setApps(data || [])
  }

  const filtered = apps.filter(a =>
    a.students?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.students?.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title">Results Management</h1>
          <p className="page-subtitle">Upload marks and publish merit list</p>
        </div>
        <button onClick={publishMeritList} className="btn-success">
          <Trophy size={16} /> Publish Merit List
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="form-input pl-9" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-semibold">Student</th>
                <th className="px-5 py-3 text-left font-semibold">Post</th>
                <th className="px-5 py-3 text-left font-semibold">Total Marks</th>
                <th className="px-5 py-3 text-left font-semibold">Marks Obtained</th>
                <th className="px-5 py-3 text-left font-semibold">Percentage</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-left font-semibold">Rank</th>
                <th className="px-5 py-3 text-left font-semibold">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center"><div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.map(app => {
                const result = app.results?.[0]
                const edit = editRow[app.id] || {}
                return (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold">{app.students?.full_name}</p>
                      <p className="text-xs text-gray-400">{app.students?.category}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600 max-w-32 truncate">{app.exam_post}</td>
                    <td className="px-5 py-3">
                      <input type="number" className="form-input w-20 py-1.5 text-sm"
                        defaultValue={result?.total_marks || 300}
                        onChange={e => setEditRow(prev => ({ ...prev, [app.id]: { ...prev[app.id], total_marks: e.target.value } }))} />
                    </td>
                    <td className="px-5 py-3">
                      <input type="number" className="form-input w-24 py-1.5 text-sm"
                        defaultValue={result?.marks_obtained || ''}
                        placeholder="0"
                        onChange={e => setEditRow(prev => ({ ...prev, [app.id]: { ...prev[app.id], marks_obtained: e.target.value } }))} />
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold">{result?.percentage ? `${result.percentage}%` : '—'}</td>
                    <td className="px-5 py-3">
                      {result ? (
                        <span className={result.status === 'passed' ? 'badge-approved' : 'badge-rejected'}>{result.status}</span>
                      ) : <span className="badge-pending">Not entered</span>}
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-700">
                      {result?.merit_rank ? `#${result.merit_rank}` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleSaveResult(app)} disabled={saving === app.id}
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                        {saving === app.id ? <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                      </button>
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
