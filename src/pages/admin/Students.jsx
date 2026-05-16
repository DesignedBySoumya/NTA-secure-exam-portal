import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  Activity, Shield, MapPin, Users, Globe, AlertTriangle, 
  Search, Filter, Clock, Bell, Radio, Zap, Lock, Eye, 
  ExternalLink, ShieldAlert, Cpu, BarChart3, Wifi, Video
} from 'lucide-react'

export default function LiveMonitoring() {
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', msg: 'Center MP-22 internet unstable', time: '2m ago' },
    { id: 2, type: 'critical', msg: 'MH-44 attendance mismatch detected', time: '5m ago' },
    { id: 3, type: 'warning', msg: 'DL-18 CCTV disconnected', time: '8m ago' },
    { id: 4, type: 'success', msg: 'GJ-12 recovered successfully', time: '12m ago' }
  ])
  const [syncTime, setSyncTime] = useState(new Date())

  useEffect(() => {
    fetchMonitoringData()
    const interval = setInterval(() => {
      setSyncTime(new Date())
      // Randomly update alerts for "live" feel
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchMonitoringData = async () => {
    setLoading(true)
    const { data } = await supabase.from('exam_centers').select('*, applications(count)').order('name')
    setCenters(data || [])
    setLoading(false)
  }

  // Mock stats for the "war room" feel
  const stats = {
    online: centers.length,
    warning: 12,
    critical: 3,
    offline: 2
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F8FAFC] -m-6 p-6 font-sans selection:bg-blue-500/30">
      {/* Top Mission Control Bar */}
      <div className="flex items-center justify-between mb-8 bg-[#121A2B] p-4 rounded-2xl border border-[#1E293B] shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 animate-pulse"></div>
            <Radio className="text-[#3B82F6] relative z-10 animate-pulse" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-heading font-black tracking-tighter uppercase italic">📡 Live Center Monitoring</h1>
            <p className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-widest">National Command Center // Active Session</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#0B1220] rounded-lg border border-[#1E293B] font-mono text-[11px]">
            <Clock size={14} className="text-[#3B82F6]" />
            <span>SYNC: {syncTime.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
              <input 
                placeholder="Search Center ID..." 
                className="bg-[#0B1220] border border-[#1E293B] rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#3B82F6] transition-all w-64"
              />
            </div>
            <button className="p-2 bg-[#0B1220] border border-[#1E293B] rounded-xl hover:bg-[#1E293B] transition-colors relative">
              <Bell size={20} className="text-[#94A3B8]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Stats & Map */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Global Status Overview */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: 'Online Centers', val: stats.online, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', sub: '+12 in last 5m', icon: Wifi },
              { label: 'Warning Status', val: stats.warning, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', sub: 'Action Required', icon: AlertTriangle },
              { label: 'Critical Ops', val: stats.critical, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', sub: 'Immediate Response', icon: ShieldAlert },
              { label: 'Offline/Sync', val: stats.offline, color: 'text-[#94A3B8]', bg: 'bg-[#94A3B8]/10', sub: 'Maintenance Mode', icon: Radio },
            ].map((s, i) => (
              <div key={i} className="bg-[#121A2B] border border-[#1E293B] p-5 rounded-2xl relative overflow-hidden group">
                <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform ${s.color}`}>
                  <s.icon size={80} />
                </div>
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">{s.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black font-mono ${s.color}`}>{s.val}</span>
                  <span className="text-[10px] font-medium text-[#94A3B8]">/ 7000</span>
                </div>
                <p className="text-[10px] mt-2 font-medium opacity-60">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Section 2: India Live Map (Futuristic Visual) */}
          <div className="bg-[#121A2B] border border-[#1E293B] rounded-3xl p-8 relative overflow-hidden min-h-[400px] flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3B82F610,transparent_70%)]"></div>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#1E293B 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            <div className="relative text-center">
              <Globe size={160} className="text-[#3B82F6] opacity-20 mx-auto animate-[spin_20s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-48 rounded-full border border-[#3B82F6]/30 animate-ping"></div>
              </div>
              <div className="mt-8">
                <h2 className="text-2xl font-heading font-black tracking-tighter uppercase italic text-white/90">India Live Operations Map</h2>
                <p className="text-xs text-[#94A3B8] mt-2 font-mono">Interactive Geographic Intelligence • Real-time Pulse Tracking</p>
                <div className="mt-6 flex justify-center gap-8">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#10B981]">
                    <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></span> North Sector
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#EF4444]">
                    <span className="w-2 h-2 bg-[#EF4444] rounded-full animate-pulse"></span> West Sector
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#F59E0B]">
                    <span className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse"></span> South Sector
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map UI Decorations */}
            <div className="absolute top-6 left-6 p-4 border-l border-t border-[#1E293B] rounded-tl-xl">
              <p className="text-[10px] font-mono text-[#3B82F6]">LAT: 20.5937° N</p>
              <p className="text-[10px] font-mono text-[#3B82F6]">LNG: 78.9629° E</p>
            </div>
            <div className="absolute bottom-6 right-6 p-4 border-r border-b border-[#1E293B] rounded-br-xl text-right">
              <p className="text-[10px] font-mono text-white/40">SYSTEM STATUS: OPTIMAL</p>
              <p className="text-[10px] font-mono text-white/40">ENCRYPTION: AES-256</p>
            </div>
          </div>

          {/* Section 4: Center Monitoring Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-heading font-black uppercase tracking-widest text-white/70 flex items-center gap-2">
                <Radio size={16} className="text-[#3B82F6]" />
                Center Monitoring Grid
              </h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-[#1E293B] rounded-lg text-[10px] font-bold uppercase tracking-widest">Filter: Critical</button>
                <button className="px-3 py-1 bg-[#121A2B] border border-[#1E293B] rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Export Report</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {centers.slice(0, 4).map((center, i) => (
                <div key={center.id} className="bg-[#121A2B] border border-[#1E293B] rounded-2xl p-5 hover:border-[#3B82F6]/50 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${i % 3 === 0 ? 'bg-[#EF4444] animate-pulse shadow-[0_0_8px_#EF4444]' : 'bg-[#10B981]'} `}></div>
                      <div>
                        <h3 className="font-heading font-bold text-sm tracking-tight">{center.code} // {center.name}</h3>
                        <p className="text-[10px] text-[#94A3B8] font-mono uppercase">{center.city}, {center.state}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 bg-[#0B1220] rounded-lg hover:text-[#3B82F6] transition-colors"><Eye size={14} /></button>
                      <button className="p-1.5 bg-[#0B1220] rounded-lg hover:text-[#EF4444] transition-colors"><ShieldAlert size={14} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 mb-4">
                    <div className="space-y-1">
                      <p className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest">Check-in Status</p>
                      <div className="flex items-center gap-2">
                        <Users size={12} className="text-[#3B82F6]" />
                        <span className="text-[11px] font-mono font-bold">{center.applications?.[0]?.count || 0} / {center.capacity}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest">Network</p>
                      <div className="flex items-center gap-2">
                        <Wifi size={12} className={i % 3 === 0 ? 'text-[#EF4444]' : 'text-[#10B981]'} />
                        <span className="text-[11px] font-mono font-bold uppercase">{i % 3 === 0 ? 'Unstable' : 'Optimal'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest">CCTV Feed</p>
                      <div className="flex items-center gap-2">
                        <Video size={12} className="text-[#10B981]" />
                        <span className="text-[11px] font-mono font-bold uppercase">Active</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest">Vault Status</p>
                      <div className="flex items-center gap-2">
                        <Lock size={12} className="text-[#3B82F6]" />
                        <span className="text-[11px] font-mono font-bold uppercase text-[#3B82F6]">Locked</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-[#3B82F6] text-white text-[10px] font-black uppercase py-2 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors tracking-widest">View Stream</button>
                    <button className="flex-1 bg-[#1E293B] text-white text-[10px] font-black uppercase py-2 rounded-xl hover:bg-slate-700 transition-colors tracking-widest">Protocol</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Alerts & AI */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Section 3: Live Alert Stream */}
          <div className="bg-[#121A2B] border border-[#1E293B] rounded-3xl overflow-hidden flex flex-col h-[350px]">
            <div className="p-5 border-b border-[#1E293B] flex items-center justify-between bg-[#1E293B]/30">
              <h2 className="text-xs font-heading font-black uppercase tracking-widest flex items-center gap-2">
                <Radio size={14} className="text-[#EF4444] animate-pulse" />
                Live Incident Stream
              </h2>
              <span className="text-[10px] font-mono text-[#94A3B8]">AUTO-SYNC ON</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
              {alerts.map(alert => (
                <div key={alert.id} className="flex gap-3 text-[11px] group">
                  <span className="text-[#94A3B8] shrink-0">{alert.time}</span>
                  <div className="flex flex-col gap-1">
                    <p className={`
                      ${alert.type === 'critical' ? 'text-[#EF4444]' : ''}
                      ${alert.type === 'warning' ? 'text-[#F59E0B]' : ''}
                      ${alert.type === 'success' ? 'text-[#10B981]' : ''}
                      group-hover:translate-x-1 transition-transform
                    `}>
                      <span className="opacity-50">[{alert.type.toUpperCase()}]</span> {alert.msg}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-2 text-[10px] text-blue-500/50 animate-pulse">&gt;&gt;&gt; Awaiting next data packet...</div>
            </div>
          </div>

          {/* Section 5: AI Risk Intelligence */}
          <div className="bg-[#121A2B] border border-[#1E293B] rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Cpu size={80} className="text-[#3B82F6]" />
            </div>
            <h2 className="text-xs font-heading font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={14} className="text-[#F59E0B]" />
              AI Fraud Intelligence
            </h2>
            
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-[#0B1220] rounded-2xl border border-[#1E293B]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Global Risk Score</p>
                  <span className="text-[10px] font-black text-[#10B981]">SECURE</span>
                </div>
                <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] w-[15%]"></div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Anomaly Detection</p>
                <div className="flex items-start gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                  <ShieldAlert size={16} className="text-[#EF4444] shrink-0" />
                  <p className="text-[10px] leading-relaxed text-red-200/70 italic">3 centers show abnormal attendance spikes in the last 10 minutes. Investigating patterns.</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                  <Zap size={16} className="text-[#F59E0B] shrink-0" />
                  <p className="text-[10px] leading-relaxed text-amber-200/70 italic">47 candidates share same device fingerprint across GJ Sector. Potential proxy attempt.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Incident Response Panel */}
          <div className="bg-[#121A2B] border border-[#1E293B] rounded-3xl p-6">
            <h2 className="text-xs font-heading font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Radio size={14} className="text-white" />
              Incident Response Panel
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-2xl hover:bg-[#EF4444]/20 transition-all group">
                <Lock size={18} className="text-[#EF4444]" />
                <span className="text-[9px] font-black uppercase tracking-tighter text-[#EF4444]">Lock Center</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-2xl hover:bg-[#3B82F6]/20 transition-all">
                <Radio size={18} className="text-[#3B82F6]" />
                <span className="text-[9px] font-black uppercase tracking-tighter text-[#3B82F6]">Broadcast</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                <Zap size={18} className="text-white" />
                <span className="text-[9px] font-black uppercase tracking-tighter text-white">Force Sync</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                <ExternalLink size={18} className="text-white" />
                <span className="text-[9px] font-black uppercase tracking-tighter text-white">Escalate</span>
              </button>
            </div>
            <button className="w-full mt-4 py-3 bg-[#EF4444] text-white text-[10px] font-black uppercase rounded-2xl shadow-xl shadow-red-500/20 tracking-[0.2em]">Deploy Emergency Protocol</button>
          </div>

        </div>
      </div>
    </div>
  )
}
