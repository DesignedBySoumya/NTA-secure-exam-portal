import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ClipboardList, Plus, Save, Trash2, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingExam, setEditingExam] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    setLoading(true)
    const { data } = await supabase.from('exams').select('*').order('created_at')
    setExams(data || [])
    setLoading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Exam name is required')
    setSaving(true)
    try {
      if (editingExam) {
        await supabase.from('exams').update({ name: form.name, description: form.description }).eq('id', editingExam.id)
        toast.success('Exam updated')
      } else {
        await supabase.from('exams').insert({ name: form.name, description: form.description })
        toast.success('Exam added')
      }
      setEditingExam(null)
      setForm({ name: '', description: '' })
      fetchExams()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam? This will affect applications tied to it.')) return
    try {
      await supabase.from('exams').delete().eq('id', id)
      toast.success('Exam deleted')
      fetchExams()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="page-header mb-6">
        <h1 className="page-title">Manage Exams</h1>
        <p className="page-subtitle">Add, edit or remove exams available for students</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="card">
            <h2 className="text-base font-bold text-gray-900 mb-4">{editingExam ? 'Edit Exam' : 'Add New Exam'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="form-label">Exam Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-2">
                {editingExam && (
                  <button type="button" onClick={() => { setEditingExam(null); setForm({ name: '', description: '' }) }} className="btn-secondary flex-1">Cancel</button>
                )}
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  <Save size={16} /> {editingExam ? 'Update' : 'Add'} Exam
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardList size={18} className="text-blue-700" /> Current Exams
            </h2>
            {loading ? (
              <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" /></div>
            ) : exams.length > 0 ? (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {exams.map(exam => (
                  <div key={exam.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{exam.name}</h3>
                      {exam.description && <p className="text-xs text-gray-500 mt-1">{exam.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingExam(exam); setForm({ name: exam.name, description: exam.description || '' }) }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(exam.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center p-8 bg-gray-50 rounded-xl border border-gray-100">No exams available. Add one from the left.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
