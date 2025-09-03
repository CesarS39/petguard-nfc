'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import AddPetForm from '@/components/pets/AddPetForm'
import Link from 'next/link'

export default function AddPetPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [petsCount, setPetsCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar autenticación
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          window.location.href = '/auth/login'
          return
        }

        setUser(user)

        // Obtener perfil del usuario
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setProfile(profileData)

        // Contar mascotas existentes
        const { data: pets } = await supabase
          .from('pets')
          .select('id')
          .eq('user_id', user.id)

        setPetsCount(pets?.length || 0)

      } catch (error: any) {
        setError('Error al cargar los datos')
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  const maxPets = profile?.max_pets || 3

  if (petsCount >= maxPets) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-red-600 mb-4">Límite Alcanzado</h2>
          <p className="text-gray-600 mb-4">
            Ya tienes {petsCount} mascotas registradas. Tu plan permite máximo {maxPets} mascotas.
          </p>
          <div className="flex space-x-4">
            <Link 
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Volver al Dashboard
            </Link>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Actualizar Plan
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href="/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 inline-block"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            ← Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Agregar Nueva Mascota
          </h1>
          <p className="text-gray-600 mt-2">
            Registra una nueva mascota para generar su chip NFC personalizado
          </p>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-700">
              Mascotas registradas: {petsCount}/{maxPets}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Información de la Mascota
            </h2>
          </div>
          <div className="p-6">
            <AddPetForm userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}