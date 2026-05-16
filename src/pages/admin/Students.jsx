import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, Mail, Phone, Calendar, UserCheck, AlertCircle } from 'lucide-react'

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudents() {
      const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false })
      setStudents(data || [])
      setLoading(false)
    }
    fetchStudents()
  }, [])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="page-header mb-8 relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-3xl text-white shadow-xl shadow-blue-900/20">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">Registered Students</h1>
          <p className="text-blue-100 text-sm font-medium">Directory of all candidate profiles across the portal</p>
        </div>
        <Users size={120} className="absolute -top-4 -right-4 text-white opacity-10" />
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            All Students Database
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full">{students.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Candidate Info</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Contact Details</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">DOB</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Profile Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-400">No students registered yet</td></tr>
              ) : students.map(student => (
                <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden shadow-inner ring-4 ring-white group-hover:scale-105 transition-transform">
                        {student.photo_url && student.photo_url !== 'mock' ? (
                           <img src={student.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          student.full_name?.[0]?.toUpperCase() || 'S'
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{student.full_name}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {student.id.slice(0,8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {student.email}</p>
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {student.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">{student.category || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400"/> {student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="px-6 py-5">
                    {student.photo_url ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl w-max"><UserCheck size={14} /> Profile Complete</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl w-max"><AlertCircle size={14} /> Incomplete</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
