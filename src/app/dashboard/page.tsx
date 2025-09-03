'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import LogoutButton from '@/components/auth/LogoutButton'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [pets, setPets] = useState<any[]>([])

  useEffect(() => {
    const getUser = async () => {
      try {
        // Obtener usuario actual
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          console.log('No hay usuario, redirigiendo al login')
          window.location.href = '/auth/login'
          return
        }

        setUser(user)

        // Obtener perfil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setProfile(profileData)

        // Obtener mascotas
        const { data: petsData } = await supabase
          .from('pets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setPets(petsData || [])
        
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
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

  const petsCount = pets.length
  const maxPets = profile?.max_pets || 3

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard PetGuard
              </h1>
              <p className="text-gray-600">
                Bienvenido, {profile?.full_name || user.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Mascotas: {petsCount}/{maxPets}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Mascotas Registradas</h3>
            <p className="text-2xl font-bold text-gray-900">{petsCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Espacios Disponibles</h3>
            <p className="text-2xl font-bold text-gray-900">{maxPets - petsCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Chips Activos</h3>
            <p className="text-2xl font-bold text-gray-900">
              {pets.filter(pet => pet.is_active).length}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.location.href = '/dashboard/pets/add'}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              + Agregar Mascota
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
              Ver Perfil
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Historial de Reportes
            </button>
          </div>
        </div>

        {/* Pets List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Mis Mascotas</h2>
          </div>
          {pets && pets.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {pets.map((pet) => (
                <div key={pet.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {pet.photo_url ? (
                        <img
                          src={pet.photo_url}
                          alt={pet.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 text-xl">🐕</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{pet.name}</h3>
                      <p className="text-sm text-gray-500">ID: {pet.short_id}</p>
                      {pet.breed && (
                        <p className="text-xs text-gray-400">{pet.breed}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pet.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pet.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                      Ver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 text-lg">No tienes mascotas registradas</p>
              <p className="text-gray-400 text-sm mt-2">
                Agrega tu primera mascota para comenzar
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}