import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Read from localStorage for the mocked backend
    const savedUser = localStorage.getItem('mock_user')
    const savedRole = localStorage.getItem('mock_role')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setRole(savedRole)
    }
    setLoading(false)
  }, [])

  const signIn = async (email, password) => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000))
    
    // Determine role based on email for the demo
    let newRole = 'student'
    if (email.includes('admin')) newRole = 'admin'
    if (email.includes('staff')) newRole = 'center_staff'
    
    const mockUser = { id: email, email }
    localStorage.setItem('mock_user', JSON.stringify(mockUser))
    localStorage.setItem('mock_role', newRole)
    
    setUser(mockUser)
    setRole(newRole)
    return { user: mockUser }
  }

  const signUp = async (email, password, metadata = {}) => {
    await new Promise(r => setTimeout(r, 1000))
    return signIn(email, password)
  }

  const signOut = async () => {
    localStorage.removeItem('mock_user')
    localStorage.removeItem('mock_role')
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
