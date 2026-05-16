import { useEffect, useState } from 'react'
import { supabase, logAudit } from '../../lib/supabase'
import { BookOpen, Upload, Lock, Unlock, Eye, Plus, X, Save, Clock, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Papers() {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ exam_id: '', subject: '', release_time: '', description: '' })
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    fetchPapers()
    const t = setInterval(() => setNow(new Date()), 10000)
    return () => clearInterval(t)
  }, [])

  const fetchPapers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('papers').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('Fetch papers error:', error)
      toast.error('Could not fetch papers. Table might be missing.')
    }
    setPapers(data || [])
    setLoading(false)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) { toast.error('Select a paper file to upload'); return }
    setSaving(true)
    try {
      const path = `papers/${form.exam_id}/${file.name}`
      const { error: uploadError } = await supabase.storage.from('exam-papers').upload(path, file, { upsert: true })
      if (uploadError) throw new Error(`Storage error: ${uploadError.message}`)
      
      const { error: insertError } = await supabase.from('papers').insert({
        ...form,
        file_path: path,
        access_status: 'locked',
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      if (insertError) throw new Error(`Database error: ${insertError.message}`)
      
      await logAudit('PAPER_UPLOADED', { exam_id: form.exam_id, subject: form.subject })
      toast.success('Paper uploaded and encrypted!')
      setShowForm(false)
      setForm({ exam_id: '', subject: '', release_time: '', description: '' })
      setFile(null)
      fetchPapers()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const isReleased = (paper) => new Date(paper.release_time) <= now

  const statusBadge = (paper) => {
    if (isReleased(paper)) return <span className="badge-approved"><Unlock size={12} />Released</span>
    return <span className="badge-pending"><Lock size={12} />Locked</span>
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title">Question Papers</h1>
          <p className="page-subtitle">Upload and manage encrypted exam papers with timed release</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> Upload Paper
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-yellow-800">Security Notice</p>
          <p className="text-xs text-yellow-700">All paper access is logged. Papers are encrypted at rest. Only center staff can access papers after release time.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {papers.map(paper => (
            <div key={paper.id} className={`card ${isReleased(paper) ? 'border-green-200' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isReleased(paper) ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {isReleased(paper) ? <Unlock size={20} className="text-green-700" /> : <Lock size={20} className="text-gray-500" />}
                </div>
                {statusBadge(paper)}
              </div>
              <h3 className="font-bold text-gray-900">{paper.subject}</h3>
              <p className="text-xs text-gray-500 mt-0.5 font-mono">Exam ID: {paper.exam_id}</p>
              {paper.description && <p className="text-xs text-gray-400 mt-2">{paper.description}</p>}

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={12} />
                  <span>Release: {new Date(paper.release_time).toLocaleString('en-IN')}</span>
                </div>
                {!isReleased(paper) && (
                  <div className="text-blue-600 font-medium">
                    Releases in: {Math.max(0, Math.round((new Date(paper.release_time) - now) / 60000))} min
                  </div>
                )}
              </div>
            </div>
          ))}
          {papers.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p>No papers uploaded yet</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Upload Question Paper</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="form-label">Exam ID *</label>
                <input className="form-input font-mono" value={form.exam_id} onChange={e => setForm({ ...form, exam_id: e.target.value })} required placeholder="e.g. NEB2026-GRP-A" />
              </div>
              <div>
                <label className="form-label">Subject *</label>
                <input className="form-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Paper Release Time *</label>
                <input type="datetime-local" className="form-input" value={form.release_time} onChange={e => setForm({ ...form, release_time: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Paper File (PDF) *</label>
                <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 ${file ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
                  onClick={() => document.getElementById('paper-file').click()}>
                  {file ? (
                    <div className="text-green-700">
                      <BookOpen size={24} className="mx-auto mb-1" />
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <Upload size={24} className="mx-auto mb-1" />
                      <p className="text-sm">Click to upload PDF</p>
                    </div>
                  )}
                  <input id="paper-file" type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files[0])} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload size={16} />}
                  Upload Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
