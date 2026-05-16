import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { FileText, CreditCard, Download, BarChart3, Clock, CheckCircle, XCircle, AlertCircle, Activity, User, MapPin } from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [student, setStudent] = useState(null)
  const [application, setApplication] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
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
          const { data: payments } = await supabase.from('payments')
            .select('*')
            .eq('application_id', app.id)
          
          const completedPayment = payments?.find(p => p.status === 'completed')
          const latestPayment = payments?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
          setPayment(completedPayment || latestPayment)
        }
      }
      setLoading(false)
    }
    if (user) fetchData()
  }, [user])

  const statusIcon = (status) => {
    if (status === 'approved') return <CheckCircle size={16} className="text-green-500" />
    if (status === 'rejected') return <XCircle size={16} className="text-red-500" />
    return <Clock size={16} className="text-yellow-500" />
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="page-header relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-2xl text-white mb-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">NEET 2026 Dashboard</h1>
          <p className="text-blue-100 mt-1 opacity-90">Welcome back, {student?.full_name || user?.email}</p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Activity size={120} />
        </div>
      </div>

      {/* Profile completion alert */}
      {!student?.photo_url && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-base font-bold text-amber-900">Complete Your Profile</p>
            <p className="text-sm text-amber-700 mt-0.5">Upload your documents to unlock the NEET application form.</p>
          </div>
          <Link to="/student/profile" className="ml-auto bg-amber-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-700 transition-colors">
            Complete Now
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card border-none shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <FileText size={24} className="text-blue-600" />
            </div>
            {application && statusIcon(application.status)}
          </div>
          <p className="text-sm font-medium text-gray-500">Application Status</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-gray-900 capitalize">{application?.status || 'Not Started'}</p>
          </div>
          {application && (
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-400">Applied for NEET 2026</p>
            </div>
          )}
        </div>

        <div className="card border-none shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
              <CreditCard size={24} className="text-green-600" />
            </div>
            {payment && statusIcon(payment.status === 'completed' ? 'approved' : 'pending')}
          </div>
          <p className="text-sm font-medium text-gray-500">Payment Status</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{payment?.status === 'completed' ? 'Paid' : 'Pending'}</p>
          {payment?.status === 'completed' ? (
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs text-green-600 font-medium">Transaction: {payment.transaction_id?.slice(0,10)}...</p>
            </div>
          ) : application && (
            <Link to="/student/payment" className="text-xs text-blue-600 font-bold mt-4 block hover:underline">Pay Now →</Link>
          )}
        </div>

        <div className="card border-none shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
              <Download size={24} className="text-purple-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Admit Card</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {application?.status === 'approved' ? 'Ready' : 'Locked'}
          </p>
          {application?.status === 'approved' ? (
            <Link to="/student/admit-card" className="text-xs text-purple-600 font-bold mt-4 block hover:underline">Download Now →</Link>
          ) : (
            <p className="text-xs text-gray-400 mt-4">Awaiting Approval</p>
          )}
        </div>

        <div className="card border-none shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <BarChart3 size={24} className="text-orange-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Results</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">N/A</p>
          <p className="text-xs text-gray-400 mt-4">After Examination</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick actions */}
          <div className="card border-none shadow-md">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Navigation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/student/profile" className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-100">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">My Profile</p>
                  <p className="text-xs text-gray-500">Documents & Personal Details</p>
                </div>
              </Link>
              <Link to="/student/application" className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-green-50 transition-colors group border border-transparent hover:border-green-100">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">NEET Application</p>
                  <p className="text-xs text-gray-500">Update marks & preferences</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Exam Info */}
          {application && (
            <div className="card border-none shadow-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Application Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Exam Details</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">NEET (National Eligibility cum Entrance Test) 2026</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-[10px] text-blue-600 font-bold uppercase">10th %</p>
                      <p className="text-sm font-bold text-blue-900">{application.class_10_marks || '—'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-[10px] text-blue-600 font-bold uppercase">12th %</p>
                      <p className="text-sm font-bold text-blue-900">{application.class_12_marks || '—'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-[10px] text-blue-600 font-bold uppercase">Grad %</p>
                      <p className="text-sm font-bold text-blue-900">{application.graduation_marks || '—'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">City Preferences</p>
                  <div className="mt-2 space-y-2">
                    {application.city_pref_1 && <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                      <MapPin size={14} className="text-gray-400" /> 1. {application.city_pref_1}
                    </div>}
                    {application.city_pref_2 && <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                      <MapPin size={14} className="text-gray-400" /> 2. {application.city_pref_2}
                    </div>}
                    {application.city_pref_3 && <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                      <MapPin size={14} className="text-gray-400" /> 3. {application.city_pref_3}
                    </div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="lg:col-span-1">
          <div className="card border-none shadow-md h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-6">NEET Journey</h2>
            <div className="space-y-6 relative">
              <div className="absolute top-0 bottom-0 left-[9px] w-0.5 bg-gray-100"></div>
              {[
                { label: 'Registration', done: true, desc: 'Account verified' },
                { label: 'Documents Uploaded', done: !!student?.photo_url, desc: 'Photo, sign & ID proof' },
                { label: 'Application Submitted', done: !!application, desc: application ? 'NEET form complete' : 'Waiting' },
                { label: 'Payment Completed', done: payment?.status === 'completed', desc: payment?.status === 'completed' ? 'Fee received' : 'Pending' },
                { label: 'Admit Card Issued', done: application?.status === 'approved' && payment?.status === 'completed', desc: 'Pending admin review' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4 relative z-10">
                  <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-500 shadow-sm shadow-green-200' : 'bg-white border-2 border-gray-200'}`}>
                    {step.done && <CheckCircle size={10} className="text-white" />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
