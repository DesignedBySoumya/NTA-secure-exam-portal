import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function RoleRedirect() {
  const { role, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (role === 'admin' || role === 'super_admin') navigate('/admin/dashboard', { replace: true })
      else if (role === 'center_staff') navigate('/center/dashboard', { replace: true })
      else navigate('/student/dashboard', { replace: true })
    }
  }, [role, loading, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
