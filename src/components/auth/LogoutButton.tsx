'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button 
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
    >
      Cerrar Sesión
    </button>
  )
}