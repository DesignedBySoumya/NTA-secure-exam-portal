import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { MapPin, Plus, Edit2, Users, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ExamCenters() {
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', city: '', state: '', address: '', capacity: '', incharge_name: '', incharge_phone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchCenters() }, [])

  const fetchCenters = async () => {
    setLoading(true)
    const { data } = await supabase.from('exam_centers').select('*, applications(count)').order('name')
    setCenters(data || [])
    setLoading(false)
  }

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', code: '', city: '', state: '', address: '', capacity: '', incharge_name: '', incharge_phone: '' })
    setShowForm(true)
  }

  const openEdit = (center) => {
    setEditing(center)
    setForm({ name: center.name, code: center.code, city: center.city, state: center.state, address: center.address || '', capacity: center.capacity || '', incharge_name: center.incharge_name || '', incharge_phone: center.incharge_phone || '' })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await supabase.from('exam_centers').update(form).eq('id', editing.id)
        toast.success('Center updated!')
      } else {
        await supabase.from('exam_centers').insert(form)
        toast.success('Center added!')
      }
      setShowForm(false)
      fetchCenters()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title">Exam Centers</h1>
          <p className="page-subtitle">Manage examination center locations and staff</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} /> Add Center
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {centers.map(center => (
            <div key={center.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin size={20} className="text-blue-700" />
                </div>
                <button onClick={() => openEdit(center)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700">
                  <Edit2 size={14} />
                </button>
              </div>
              <h3 className="font-bold text-gray-900">{center.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{center.city}, {center.state}</p>
              {center.address && <p className="text-xs text-gray-400 mt-1">{center.address}</p>}

              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-400">Center Code</p>
                  <p className="font-bold font-mono text-blue-700">{center.code}</p>
                </div>
                <div>
                  <p className="text-gray-400">Capacity</p>
                  <p className="font-bold">{center.capacity || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Incharge</p>
                  <p className="font-semibold">{center.incharge_name || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Students Allotted</p>
                  <p className="font-bold text-green-700 flex items-center gap-1">
                    <Users size={12} />
                    {center.applications?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {centers.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <MapPin size={40} className="mx-auto mb-3 opacity-30" />
              <p>No exam centers added yet</p>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{editing ? 'Edit Center' : 'Add Exam Center'}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Center Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Center Code *</label>
                  <input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required placeholder="e.g. CEN001" />
                </div>
                <div>
                  <label className="form-label">Capacity</label>
                  <input type="number" className="form-input" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">City *</label>
                  <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">State *</label>
                  <input className="form-input" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Address</label>
                  <textarea className="form-input" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Incharge Name</label>
                  <input className="form-input" value={form.incharge_name} onChange={e => setForm({ ...form, incharge_name: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Incharge Phone</label>
                  <input className="form-input" value={form.incharge_phone} onChange={e => setForm({ ...form, incharge_phone: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                  {editing ? 'Update' : 'Add Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
