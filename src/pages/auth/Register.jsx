import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    full_name: '', phone: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { user } = await signUp(form.email, form.password, { full_name: form.full_name })
      // Insert into user_roles
      if (user) {
        await supabase.from('user_roles').insert({ user_id: user.id, role: 'student' })
        await supabase.from('students').insert({
          user_id: user.id,
          email: form.email,
          full_name: form.full_name,
          phone: form.phone,
        })
      }
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)'
        }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-white/20 backdrop-blur rounded-2xl items-center justify-center mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Student Registration</h1>
          <p className="text-blue-200 text-sm mt-1">Create your exam portal account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {success ? (
            <div className="text-center py-6">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Registration Successful!</h3>
              <p className="text-sm text-gray-600">Check your email to verify your account. Redirecting to login...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Create Account</h2>
              <p className="text-sm text-gray-500 mb-6">Fill in the details to register as a student</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input name="full_name" type="text" className="form-input" placeholder="As per official documents"
                    value={form.full_name} onChange={handleChange} required />
                </div>

                <div>
                  <label className="form-label">Email Address *</label>
                  <input name="email" type="email" className="form-input" placeholder="your@email.com"
                    value={form.email} onChange={handleChange} required />
                </div>

                <div>
                  <label className="form-label">Phone Number *</label>
                  <input name="phone" type="tel" className="form-input" placeholder="+91 XXXXX XXXXX"
                    value={form.phone} onChange={handleChange} required />
                </div>

                <div>
                  <label className="form-label">Password *</label>
                  <div className="relative">
                    <input name="password" type={showPw ? 'text' : 'password'} className="form-input pr-9"
                      placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">Confirm Password *</label>
                  <input name="confirmPassword" type="password" className="form-input"
                    placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                  <strong>Note:</strong> Complete your profile with photo, signature, and ID proof after registration.
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-700 font-semibold hover:underline">Sign in</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
