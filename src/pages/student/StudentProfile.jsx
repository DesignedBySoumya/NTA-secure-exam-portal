import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Upload, User, Camera, FileSignature, CreditCard, Save, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS', 'PH']
const STATES = ['Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Other']

export default function StudentProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    full_name: '', dob: '', email: '', phone: '', category: 'General',
    address: '', city: '', state: '', pincode: '', father_name: '', mother_name: '',
  })
  const [uploads, setUploads] = useState({ photo: null, signature: null, id_proof: null })
  const [previews, setPreviews] = useState({ photo: null, signature: null, id_proof: null })
  const [studentId, setStudentId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const photoRef = useRef()
  const sigRef = useRef()
  const idRef = useRef()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('students').select('*').eq('user_id', user.id).single()
      if (data) {
        setStudentId(data.id)
        setForm({
          full_name: data.full_name || '',
          dob: data.dob || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          category: data.category || 'General',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          father_name: data.father_name || '',
          mother_name: data.mother_name || '',
        })
        setPreviews({
          photo: data.photo_url,
          signature: data.signature_url,
          id_proof: data.id_proof_url,
        })
      }
      setLoading(false)
    }
    if (user) load()
  }, [user])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFileChange = (field, ref) => (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('File must be less than 2MB'); return }
    setUploads({ ...uploads, [field]: file })
    const reader = new FileReader()
    reader.onload = (ev) => setPreviews({ ...previews, [field]: ev.target.result })
    reader.readAsDataURL(file)
  }

  const uploadFile = async (file, path) => {
    const { data, error } = await supabase.storage.from('exam-documents').upload(path, file, { upsert: true })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('exam-documents').getPublicUrl(path)
    return publicUrl
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let photoUrl = previews.photo
      let sigUrl = previews.signature
      let idUrl = previews.id_proof

      if (uploads.photo) photoUrl = await uploadFile(uploads.photo, `${user.id}/photo.${uploads.photo.name.split('.').pop()}`)
      if (uploads.signature) sigUrl = await uploadFile(uploads.signature, `${user.id}/signature.${uploads.signature.name.split('.').pop()}`)
      if (uploads.id_proof) idUrl = await uploadFile(uploads.id_proof, `${user.id}/id_proof.${uploads.id_proof.name.split('.').pop()}`)

      const payload = { ...form, photo_url: photoUrl, signature_url: sigUrl, id_proof_url: idUrl, user_id: user.id }

      if (studentId) {
        await supabase.from('students').update(payload).eq('id', studentId)
      } else {
        const { data } = await supabase.from('students').insert(payload).select().single()
        setStudentId(data.id)
      }
      toast.success('Profile saved successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Update your personal information and upload required documents</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Document uploads */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Upload size={18} className="text-blue-700" />
            Document Upload
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo */}
            <div>
              <label className="form-label">Passport Photo *</label>
              <div
                onClick={() => photoRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all h-40"
              >
                {previews.photo ? (
                  <img src={previews.photo} alt="Photo" className="h-32 w-24 object-cover rounded-lg" />
                ) : (
                  <>
                    <Camera size={32} className="text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500 text-center">Click to upload<br/>JPG/PNG, max 2MB</p>
                  </>
                )}
              </div>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange('photo', photoRef)} />
            </div>

            {/* Signature */}
            <div>
              <label className="form-label">Signature *</label>
              <div
                onClick={() => sigRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all h-40"
              >
                {previews.signature ? (
                  <img src={previews.signature} alt="Signature" className="h-16 w-full object-contain" />
                ) : (
                  <>
                    <FileSignature size={32} className="text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500 text-center">Click to upload<br/>JPG/PNG, max 2MB</p>
                  </>
                )}
              </div>
              <input ref={sigRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange('signature', sigRef)} />
            </div>

            {/* ID Proof */}
            <div>
              <label className="form-label">ID Proof (Aadhar/PAN) *</label>
              <div
                onClick={() => idRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all h-40"
              >
                {previews.id_proof ? (
                  <div className="flex flex-col items-center">
                    <CreditCard size={32} className="text-green-500 mb-2" />
                    <p className="text-xs text-green-600 font-medium">ID Proof Uploaded</p>
                    <CheckCircle size={16} className="text-green-500 mt-1" />
                  </div>
                ) : (
                  <>
                    <CreditCard size={32} className="text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500 text-center">Aadhar/PAN/Passport<br/>PDF/JPG, max 2MB</p>
                  </>
                )}
              </div>
              <input ref={idRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange('id_proof', idRef)} />
            </div>
          </div>
        </div>

        {/* Personal details */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-700" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Full Name *</label>
              <input name="full_name" className="form-input" value={form.full_name} onChange={handleChange} required placeholder="As per official records" />
            </div>
            <div>
              <label className="form-label">Date of Birth *</label>
              <input name="dob" type="date" className="form-input" value={form.dob} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Email Address *</label>
              <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Phone Number *</label>
              <input name="phone" type="tel" className="form-input" value={form.phone} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Father's Name</label>
              <input name="father_name" className="form-input" value={form.father_name} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Mother's Name</label>
              <input name="mother_name" className="form-input" value={form.mother_name} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4">Address Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">Full Address *</label>
              <textarea name="address" className="form-input" rows={2} value={form.address} onChange={handleChange} required placeholder="House/Flat No, Street, Area" />
            </div>
            <div>
              <label className="form-label">City *</label>
              <input name="city" className="form-input" value={form.city} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">State *</label>
              <select name="state" className="form-input" value={form.state} onChange={handleChange}>
                <option value="">Select State</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Pincode *</label>
              <input name="pincode" className="form-input" value={form.pincode} onChange={handleChange} maxLength={6} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary px-8 py-3">
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
