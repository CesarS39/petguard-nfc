'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      
      // Importante: primero refresh, luego redirect
      router.refresh()
      router.push('/')
    } catch (error) {
      console.error('Error during logout:', error)
      // Forzar redirect incluso si hay error
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleLogout}
      disabled={loading}
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Cerrando...' : 'Cerrar Sesión'}
    </button>
  )
}