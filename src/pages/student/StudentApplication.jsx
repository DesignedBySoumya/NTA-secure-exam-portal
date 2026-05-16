import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { FileText, Send, Clock, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentApplication() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [application, setApplication] = useState(null)
  const [cities, setCities] = useState([])
  
  const [form, setForm] = useState({ 
    exam_post: 'NEET (National Eligibility cum Entrance Test)', 
    class_10_marks: '', 
    class_12_marks: '', 
    graduation_marks: '', 
    city_pref_1: '', 
    city_pref_2: '', 
    city_pref_3: '' 
  })
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      // Fetch unique cities from centers
      const { data: centersData } = await supabase.from('exam_centers').select('city')
      const uniqueCities = [...new Set((centersData || []).map(c => c.city))]
      setCities(uniqueCities)
      
      const { data: st } = await supabase.from('students').select('*').eq('user_id', user.id).single()
      setStudent(st)
      if (st) {
        const { data: app } = await supabase.from('applications')
          .select('*')
          .eq('student_id', st.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        setApplication(app)
        if (app) {
          setForm({ 
            exam_post: app.exam_post || 'NEET (National Eligibility cum Entrance Test)', 
            class_10_marks: app.class_10_marks || '', 
            class_12_marks: app.class_12_marks || '', 
            graduation_marks: app.graduation_marks || '', 
            city_pref_1: app.city_pref_1 || '', 
            city_pref_2: app.city_pref_2 || '', 
            city_pref_3: app.city_pref_3 || '' 
          })
        }
      }
      setLoading(false)
    }
    if (user) load()
  }, [user])

  const validateForm = () => {
    if (!form.exam_post) return "Please select an exam."
    if (!form.class_10_marks) return "Class 10 marks are required."
    if (!form.class_12_marks) return "Class 12 marks are required."
    if (!form.graduation_marks) return "Graduation marks are required."
    if (!form.city_pref_1) return "Preference 1 city is required."
    if (!form.city_pref_2) return "Preference 2 city is required."
    
    // Check for duplicate cities
    const prefs = [form.city_pref_1, form.city_pref_2, form.city_pref_3].filter(Boolean)
    const uniquePrefs = new Set(prefs)
    if (prefs.length !== uniquePrefs.size) {
      return "City preferences must be distinct. Please select different cities."
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!student) { toast.error('Please complete your profile first'); return }
    if (!student.photo_url || !student.signature_url || !student.id_proof_url) {
      toast.error('Upload photo, signature and ID proof before applying'); return
    }
    
    const errorMsg = validateForm()
    if (errorMsg) {
      toast.error(errorMsg)
      return
    }

    setSubmitting(true)
    try {
      if (!application) {
        const { data } = await supabase.from('applications').insert({ student_id: student.id, ...form, status: 'pending' }).select().single()
        setApplication(data)
        await supabase.from('payments').insert({ application_id: data.id, amount: 500, status: 'pending' })
        toast.success('Application submitted successfully!')
        navigate('/student/payment')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw your application? This cannot be undone.')) return
    try {
      await supabase.from('applications').delete().eq('id', application.id)
      setApplication(null)
      handleClear()
      toast.success('Application withdrawn successfully')
    } catch (err) {
      toast.error(err.message || 'Failed to withdraw application')
    }
  }

  const handleClear = () => {
    setForm(prev => ({
      ...prev,
      class_10_marks: '',
      class_12_marks: '',
      graduation_marks: '',
      city_pref_1: '',
      city_pref_2: '',
      city_pref_3: ''
    }))
  }

  const StatusCard = ({ status }) => {
    const config = {
      pending: { icon: Clock, color: 'yellow', label: 'Under Review', desc: 'Your application is being reviewed by admin' },
      approved: { icon: CheckCircle, color: 'green', label: 'Approved', desc: 'Congratulations! Your application has been approved' },
      rejected: { icon: XCircle, color: 'red', label: 'Rejected', desc: 'Your application was rejected. Contact admin for details' },
    }[status] || { icon: Clock, color: 'gray', label: 'Unknown', desc: '' }

    return (
      <div className={`bg-${config.color}-50 border border-${config.color}-200 rounded-xl p-5 flex items-center gap-4`}>
        <div className={`w-12 h-12 bg-${config.color}-100 rounded-xl flex items-center justify-center`}>
          <config.icon size={24} className={`text-${config.color}-600`} />
        </div>
        <div>
          <p className={`font-bold text-${config.color}-800`}>{config.label}</p>
          <p className={`text-sm text-${config.color}-700`}>{config.desc}</p>
        </div>
        <span className={`ml-auto badge-${status}`}>{status}</span>
      </div>
    )
  }

  if (loading) return <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Application</h1>
        <p className="page-subtitle">Submit and track your exam application</p>
      </div>

      {application && <div className="mb-6"><StatusCard status={application.status} /></div>}

      {application?.status === 'rejected' && application.reject_reason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
          <p className="text-sm text-red-700">{application.reject_reason}</p>
        </div>
      )}

      {!student?.photo_url && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={20} className="text-yellow-600" />
          <p className="text-sm text-yellow-800">Complete your profile (upload documents) before submitting an application.</p>
        </div>
      )}

      <div className="card">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-blue-700" />
          {application ? 'Application Details' : 'New Application'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Applying For</h3>
            <p className="text-blue-800 font-medium">NEET (National Eligibility cum Entrance Test)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="form-label">Class 10 Marks (%) *</label>
              <input type="number" step="0.01" max="100" className="form-input" placeholder="e.g. 85.50" value={form.class_10_marks} onChange={e => setForm({ ...form, class_10_marks: e.target.value })} disabled={application} />
            </div>
            <div>
              <label className="form-label">Class 12 Marks (%) *</label>
              <input type="number" step="0.01" max="100" className="form-input" placeholder="e.g. 88.00" value={form.class_12_marks} onChange={e => setForm({ ...form, class_12_marks: e.target.value })} disabled={application} />
            </div>
            <div>
              <label className="form-label">Graduation Marks (%) *</label>
              <input type="number" step="0.01" max="100" className="form-input" placeholder="e.g. 76.40" value={form.graduation_marks} onChange={e => setForm({ ...form, graduation_marks: e.target.value })} disabled={application} />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Exam Center Preferences (Max 3)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="form-label">Preference 1 *</label>
                <select className="form-input" value={form.city_pref_1} onChange={e => setForm({ ...form, city_pref_1: e.target.value })} disabled={application}>
                  <option value="">Select City</option>
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Preference 2 *</label>
                <select className="form-input" value={form.city_pref_2} onChange={e => setForm({ ...form, city_pref_2: e.target.value })} disabled={application}>
                  <option value="">Select City</option>
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Preference 3 (Optional)</label>
                <select className="form-input" value={form.city_pref_3} onChange={e => setForm({ ...form, city_pref_3: e.target.value })} disabled={application}>
                  <option value="">Select City</option>
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>
          </div>

          {!application && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={handleClear} className="btn-secondary px-6">
                <Trash2 size={16} className="text-gray-500" />
                Clear
              </button>
              <button type="submit" disabled={submitting} className="btn-primary px-8">
                {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <Send size={16} />
                Submit Application
              </button>
            </div>
          )}
          {application && application.status !== 'approved' && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={handleWithdraw} className="btn-secondary px-6 text-red-600 hover:bg-red-50 hover:border-red-200">
                Withdraw Application
              </button>
            </div>
          )}
          {application && application.status === 'approved' && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={handleWithdraw} className="btn-secondary px-6 text-red-600 hover:bg-red-50 hover:border-red-200">
                Reset Mock Data (Withdraw)
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
