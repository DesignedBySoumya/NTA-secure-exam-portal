import { useEffect, useState } from 'react'
import { supabase, logAudit } from '../../lib/supabase'
import { Award, RefreshCw, QrCode, Send, CheckCircle, Search } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'

function generateRollNumber(index) {
  return `NEB2026${String(index + 1001).padStart(5, '0')}`
}

function generateSecretId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export default function AdminAdmitCards() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(null)
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(() => { fetchApps() }, [])

  const fetchApps = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('applications')
      .select('*, students(*), payments(status), exam_centers(name, city, address), admit_cards(*)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    setApps(data || [])
    setLoading(false)
  }

  const generateAdmitCard = async (app, index) => {
    if (app.payments?.[0]?.status !== 'completed') {
      toast.error('Payment not completed for this student')
      return
    }
    setGenerating(app.id)
    try {
      const rollNumber = generateRollNumber(index)
      const secretExamId = generateSecretId()
      const payload = {
        application_id: app.id,
        roll_number: rollNumber,
        secret_exam_id: secretExamId,
        exam_date: app.exam_date || '2026-08-15',
        exam_time: '10:00 AM',
        is_active: true,
      }
      if (app.admit_cards?.[0]) {
        await supabase.from('admit_cards').update(payload).eq('id', app.admit_cards[0].id)
      } else {
        await supabase.from('admit_cards').insert(payload)
      }
      await logAudit('ADMIT_CARD_GENERATED', { application_id: app.id, roll_number: rollNumber })
      toast.success(`Admit card generated: Roll No. ${rollNumber}`)
      fetchApps()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGenerating(null)
    }
  }

  const generateAll = async () => {
    const eligible = apps.filter(a => a.payments?.[0]?.status === 'completed' && !a.admit_cards?.[0])
    for (let i = 0; i < eligible.length; i++) {
      await generateAdmitCard(eligible[i], i)
    }
    toast.success(`Generated ${eligible.length} admit cards`)
  }

  const filtered = apps.filter(a =>
    a.students?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.students?.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Admit Cards</h1>
          <p className="page-subtitle">Generate and manage admit cards for approved students</p>
        </div>
        <button onClick={generateAll} className="btn-primary">
          <RefreshCw size={16} />
          Generate All Pending
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
                <th className="px-5 py-3 text-left font-semibold">Center</th>
                <th className="px-5 py-3 text-left font-semibold">Payment</th>
                <th className="px-5 py-3 text-left font-semibold">Roll No.</th>
                <th className="px-5 py-3 text-left font-semibold">Admit Card</th>
                <th className="px-5 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.map((app, i) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold">{app.students?.full_name}</p>
                    <p className="text-xs text-gray-400">{app.students?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-700 max-w-36 truncate">{app.exam_post}</td>
                  <td className="px-5 py-3 text-xs text-gray-600">{app.exam_centers?.name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={app.payments?.[0]?.status === 'completed' ? 'badge-paid' : 'badge-unpaid'}>
                      {app.payments?.[0]?.status === 'completed' ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-sm text-gray-700">{app.admit_cards?.[0]?.roll_number || '—'}</td>
                  <td className="px-5 py-3">
                    {app.admit_cards?.[0] ? (
                      <span className="badge-approved"><CheckCircle size={12} />Generated</span>
                    ) : (
                      <span className="badge-pending">Pending</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => generateAdmitCard(app, i)}
                        disabled={generating === app.id}
                        className="text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                        title="Generate Admit Card"
                      >
                        {generating === app.id
                          ? <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                          : <Award size={16} />}
                      </button>
                      {app.admit_cards?.[0] && (
                        <button onClick={() => setPreview(app)} className="text-green-700 hover:bg-green-50 p-1.5 rounded-lg transition-colors" title="Preview QR">
                          <QrCode size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">QR Code Preview</h3>
              <button onClick={() => setPreview(null)}>✕</button>
            </div>
            <div className="flex flex-col items-center gap-3">
              <QRCodeSVG
                value={JSON.stringify({
                  roll: preview.admit_cards?.[0]?.roll_number,
                  exam_id: preview.admit_cards?.[0]?.secret_exam_id,
                  app_id: preview.id,
                })}
                size={160} level="H"
              />
              <div className="text-center">
                <p className="font-bold text-gray-900">{preview.students?.full_name}</p>
                <p className="text-sm text-gray-500">Roll: {preview.admit_cards?.[0]?.roll_number}</p>
                <p className="text-xs text-gray-400 font-mono">ID: {preview.admit_cards?.[0]?.secret_exam_id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
