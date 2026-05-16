import { useEffect, useState } from 'react'
import { supabase, logAudit } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { BookOpen, Lock, Unlock, Eye, AlertTriangle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CenterPapers() {
  const { user } = useAuth()
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    fetchPapers()
    const t = setInterval(() => setNow(new Date()), 10000)
    return () => clearInterval(t)
  }, [])

  const fetchPapers = async () => {
    setLoading(true)
    const { data } = await supabase.from('papers').select('*').order('release_time')
    setPapers(data || [])
    setLoading(false)
  }

  const isReleased = (paper) => new Date(paper.release_time) <= now

  const handleAccess = async (paper) => {
    if (!isReleased(paper)) {
      toast.error('Paper is not yet released')
      return
    }
    // Log access
    await logAudit('PAPER_ACCESSED', { paper_id: paper.id, exam_id: paper.exam_id, subject: paper.subject })
    // In production: get signed URL
    const { data } = await supabase.storage.from('exam-papers').createSignedUrl(paper.file_path, 300)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
      toast.success('Paper access logged. Opening...')
    } else {
      toast.error('Could not access paper. Contact admin.')
    }
  }

  const timeUntil = (dt) => {
    const diff = new Date(dt) - now
    if (diff <= 0) return 'Released'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return `${h}h ${m}m remaining`
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Question Papers</h1>
        <p className="page-subtitle">Access exam papers after scheduled release time</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <AlertTriangle size={20} className="text-orange-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-orange-800">Security Warning</p>
          <p className="text-xs text-orange-700">All paper access is monitored and logged. Unauthorized sharing is a criminal offence.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {papers.map(paper => {
            const released = isReleased(paper)
            return (
              <div key={paper.id} className={`card border-2 ${released ? 'border-green-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${released ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {released ? <Unlock size={22} className="text-green-600" /> : <Lock size={22} className="text-gray-400" />}
                  </div>
                  <div className="text-right">
                    {released
                      ? <span className="badge-approved"><Unlock size={12} />Released</span>
                      : <span className="badge-pending"><Lock size={12} />Locked</span>}
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-lg">{paper.subject}</h3>
                <p className="text-xs font-mono text-gray-500 mt-0.5">Exam ID: {paper.exam_id}</p>
                {paper.description && <p className="text-sm text-gray-600 mt-2">{paper.description}</p>}

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={14} />
                    <span>Release: <strong>{new Date(paper.release_time).toLocaleString('en-IN')}</strong></span>
                  </div>
                  {!released && (
                    <div className="bg-blue-50 rounded-lg px-3 py-2 text-blue-700 font-semibold text-sm">
                      ⏱ {timeUntil(paper.release_time)}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleAccess(paper)}
                  disabled={!released}
                  className={`w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    released
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Eye size={16} />
                  {released ? 'Access Paper' : 'Not Yet Available'}
                </button>
              </div>
            )
          })}
          {papers.length === 0 && (
            <div className="col-span-2 text-center py-16 text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p>No papers assigned to your center</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
