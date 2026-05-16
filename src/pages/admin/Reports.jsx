import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { BarChart3, PieChart, TrendingUp, Users, MapPin, CreditCard, Download } from 'lucide-react'

export default function Reports() {
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    byCategory: {},
    byPost: {},
    byState: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReports() {
      setLoading(true)
      // In a real app with 22 lakh students, we would use Supabase RPC or aggregate tables.
      // For this demo, we'll fetch the core counts.
      const { data: apps } = await supabase.from('applications').select('*, students(category, state)')
      
      const report = {
        total: apps?.length || 0,
        paid: apps?.filter(a => a.status !== 'pending')?.length || 0,
        byCategory: {},
        byPost: {},
        byState: {}
      }

      apps?.forEach(app => {
        // By Category
        const cat = app.students?.category || 'General'
        report.byCategory[cat] = (report.byCategory[cat] || 0) + 1
        
        // By Post
        report.byPost[app.exam_post] = (report.byPost[app.exam_post] || 0) + 1

        // By State
        const state = app.students?.state || 'Unknown'
        report.byState[state] = (report.byState[state] || 0) + 1
      })

      setStats(report)
      setLoading(false)
    }
    loadReports()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Advanced Analytics</h1>
          <p className="page-subtitle">Real-time intelligence and registration reports</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download size={16} /> Export Detailed Report (CSV)
        </button>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total Candidates</p>
              <p className="text-3xl font-black">{stats.total.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Paid Registrations</p>
              <p className="text-3xl font-black">{stats.paid.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-purple-100 text-xs font-bold uppercase tracking-wider">Conversion Rate</p>
              <p className="text-3xl font-black">{stats.total ? Math.round((stats.paid / stats.total) * 100) : 0}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
            <PieChart size={20} className="text-blue-600" />
            Category-wise Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.byCategory).map(([cat, count]) => {
              const pct = Math.round((count / stats.total) * 100)
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-gray-700">{cat}</span>
                    <span className="text-gray-500">{count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* State Breakdown */}
        <div className="card">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
            <MapPin size={20} className="text-emerald-600" />
            Top States by Registration
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.byState).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([state, count]) => {
              const pct = Math.round((count / stats.total) * 100)
              return (
                <div key={state} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                      {state.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-gray-700">{state}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">{count.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{pct}% Share</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
