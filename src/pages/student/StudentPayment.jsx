import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { CreditCard, CheckCircle, Clock, AlertCircle, IndianRupee, Download, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentPayment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [application, setApplication] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: st } = await supabase.from('students').select('*').eq('user_id', user.id).single()
      setStudent(st)
      if (st) {
        // Fetch most recent application
        const { data: app } = await supabase.from('applications')
          .select('*')
          .eq('student_id', st.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          
        setApplication(app)
        if (app) {
          // Fetch all payments for this application
          const { data: payments } = await supabase.from('payments')
            .select('*')
            .eq('application_id', app.id)
          
          let pay = payments?.find(p => p.status === 'completed') || payments?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
          
          if (!pay) {
            const { data: newPay } = await supabase.from('payments').insert({ 
              application_id: app.id, 
              amount: 500, 
              status: 'pending' 
            }).select().maybeSingle()
            pay = newPay
          }
          setPayment(pay)
        }
      }
      setLoading(false)
    }
    if (user) load()
  }, [user])

  const handlePayment = async () => {
    if (!payment) return
    setPaying(true)
    // Simulate payment gateway
    await new Promise(r => setTimeout(r, 2000))
    try {
      const txnId = `TXN${Date.now()}`
      await supabase.from('payments').update({
        status: 'completed',
        transaction_id: txnId,
        payment_date: new Date().toISOString(),
        payment_method: 'Online',
      }).eq('id', payment.id)
      setPayment({ ...payment, status: 'completed', transaction_id: txnId, payment_date: new Date().toISOString(), payment_method: 'Online' })
      toast.success('Payment successful!')
    } catch (err) {
      toast.error('Payment failed. Try again.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-5xl mx-auto">
      <div className="page-header mb-8 no-print">
        <h1 className="page-title">Application Payment</h1>
        <p className="page-subtitle">Complete your NEET 2026 application fee</p>
      </div>

      {!application ? (
        <div className="card text-center py-16 bg-slate-50 border-dashed no-print">
          <AlertCircle size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">No Application Found</h2>
          <p className="text-gray-500 mt-2">You need to submit your NEET application before making a payment.</p>
          <button onClick={() => navigate('/student/application')} className="btn-primary mt-6 inline-flex">Go to Application</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card border-none shadow-xl overflow-hidden p-0">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white no-print">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Payment Status</p>
                    <h2 className="text-2xl font-bold mt-1">
                      {payment?.status === 'completed' ? 'Receipt Confirmed' : 'Payment Required'}
                    </h2>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <IndianRupee size={24} />
                  </div>
                </div>
              </div>

              <div className="p-8">
                {payment?.status === 'completed' ? (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-800 no-print">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold">Transaction Successful</p>
                        <p className="text-xs opacity-90">Thank you! Your NEET application is now complete.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-gray-100 pb-4">
                        <span className="text-gray-500 text-sm">Invoice Number</span>
                        <span className="font-mono font-bold text-gray-900 uppercase">INV-{payment.id?.slice(0,8)}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-4">
                        <span className="text-gray-500 text-sm">Transaction ID</span>
                        <span className="font-mono font-bold text-gray-900">{payment.transaction_id}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-4">
                        <span className="text-gray-500 text-sm">Amount Paid</span>
                        <span className="text-lg font-bold text-blue-700">₹{payment.amount}.00</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-4">
                        <span className="text-gray-500 text-sm">Payment Date</span>
                        <span className="font-medium text-gray-900">{payment.payment_date ? new Date(payment.payment_date).toLocaleString('en-IN') : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-4">
                        <span className="text-gray-500 text-sm">Payment Mode</span>
                        <span className="font-medium text-gray-900">{payment.payment_method || 'Online'}</span>
                      </div>
                    </div>

                    <button onClick={() => window.print()} className="w-full btn-secondary py-4 flex items-center justify-center gap-2 font-bold no-print">
                      <Download size={18} /> Print Payment Receipt
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</p>
                          <h3 className="text-lg font-bold text-slate-800 mt-1">NEET 2026 Examination Fee</h3>
                          <p className="text-sm text-slate-500">National Eligibility cum Entrance Test</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-blue-700">₹{payment?.amount || 500}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Inclusive of GST</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 pt-6 border-t border-slate-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500 font-medium">Registration Fee</span>
                          <span className="text-slate-800 font-bold">₹{payment?.amount || 500}.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500 font-medium">Gateway Charges</span>
                          <span className="text-green-600 font-bold">FREE</span>
                        </div>
                        <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
                          <span>Total Payable</span>
                          <span>₹{payment?.amount || 500}.00</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <p className="text-sm font-bold text-slate-700 px-1">Select Payment Method</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['UPI (PhonePe/GPay)', 'Net Banking', 'Credit/Debit Card', 'Wallet'].map(m => (
                          <label key={m} className="flex items-center gap-4 p-4 border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                            <input type="radio" name="method" defaultChecked={m.includes('UPI')} className="w-4 h-4 accent-blue-600" />
                            <span className="text-sm font-bold text-slate-700">{m}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button onClick={handlePayment} disabled={paying}
                      className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]">
                      {paying ? (
                        <><div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> Securely Processing...</>
                      ) : (
                        <><CreditCard size={22} /> Proceed to Pay ₹{payment?.amount || 500}</>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-6 text-slate-400">
                      <Lock size={14} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted Secure Payment</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 no-print">
            <div className="card border-none shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4">Refund Policy</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Fees once paid will not be refunded under any circumstances. Candidates are advised to verify their eligibility before making the payment. 
              </p>
            </div>

            <div className="card border-none shadow-lg bg-indigo-50 border-l-4 border-indigo-500">
              <h3 className="font-bold text-indigo-900 mb-2">Helpdesk</h3>
              <p className="text-xs text-indigo-700">
                Having trouble with payment? Contact our support at:
              </p>
              <p className="text-sm font-bold text-indigo-900 mt-2">support@neet.gov.in</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
