import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env file.")
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Kept for backward compatibility with the mock code
export async function getUserRole() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return 'student'
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.email)
    .single()
    
  if (error || !data) return 'student'
  return data.role
}

export async function logAudit(action, details) {
  await supabase.from('audit_logs').insert({
    action,
    details: details
  })
}
