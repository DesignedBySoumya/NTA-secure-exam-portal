import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { BarChart3, Trophy, AlertCircle, Download } from 'lucide-react'

export default function StudentResults() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: st } = await supabase.from('students').select('*').eq('user_id', user.id).single()
      if (st) {
        const { data: app } = await supabase.from('applications').select('*').eq('student_id', st.id).single()
        if (app) {
          const { data: result } = await supabase.from('results').select('*').eq('application_id', app.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
          setData({ student: st, application: app, result })
        }
      }
      setLoading(false)
    }
    if (user) load()
  }, [user])

  if (loading) return <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Results & Scorecard</h1>
        <p className="page-subtitle">View your examination results and merit position</p>
      </div>

      {!data?.result ? (
        <div className="card text-center py-16">
          <BarChart3 size={56} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Results Not Published</h3>
          <p className="text-sm text-gray-500">Results will be published after the examination is conducted and evaluated.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-gray-900">Score Summary</h2>
                <button className="btn-secondary text-xs py-1.5"><Download size={14} />Download Scorecard</button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total Marks', value: data.result.total_marks, color: 'blue' },
                  { label: 'Marks Obtained', value: data.result.marks_obtained, color: 'green' },
                  { label: 'Percentage', value: `${data.result.percentage?.toFixed(1)}%`, color: 'purple' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`bg-${color}-50 rounded-xl p-4 text-center`}>
                    <p className={`text-3xl font-bold text-${color}-700`}>{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Subject-wise */}
              {data.result.subject_scores && (
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Subject-wise Scores</h3>
                  <div className="space-y-3">
                    {Object.entries(JSON.parse(data.result.subject_scores || '{}')).map(([subject, score]) => (
                      <div key={subject}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{subject}</span>
                          <span className="font-semibold">{score}/100</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="card text-center">
              <Trophy size={40} className="text-yellow-500 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Merit Rank</p>
              <p className="text-5xl font-black text-gray-900 my-2">#{data.result.merit_rank || '—'}</p>
              <span className={`badge-${data.result.status === 'passed' ? 'approved' : 'rejected'}`}>
                {data.result.status === 'passed' ? '✓ Passed' : '✗ Not Qualified'}
              </span>
            </div>

            <div className="card">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Result Details</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Post Applied', value: data.application.exam_post },
                  { label: 'Result Date', value: data.result.created_at ? new Date(data.result.created_at).toLocaleDateString('en-IN') : '—' },
                  { label: 'Cut-off Marks', value: data.result.cutoff_marks || '—' },
                  { label: 'Qualifying Status', value: data.result.status === 'passed' ? '✓ Qualified' : '✗ Not Qualified' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
