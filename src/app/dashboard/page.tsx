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
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          console.log('No hay usuario, redirigiendo al login')
          window.location.href = '/auth/login'
          return
        }

        setUser(user)

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setProfile(profileData)

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🐕</span>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Cargando tu información...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  const petsCount = pets.length
  const maxPets = profile?.max_pets || 3
  const availableSlots = maxPets - petsCount
  const activePets = pets.filter(pet => pet.is_active).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 hidden lg:block">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              PetGuard
            </span>
          </div>
          
          <nav className="space-y-2">
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
              <span className="text-xl">📊</span>
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <span className="text-xl">🐕</span>
              <span>Mis Mascotas</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <span className="text-xl">📍</span>
              <span>Reportes</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <span className="text-xl">⚙️</span>
              <span>Configuración</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ¡Hola, {profile?.full_name?.split(' ')[0] || 'Usuario'}! 👋
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Gestiona la información de tus mascotas
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-600">
                    {petsCount}/{maxPets} mascotas
                  </span>
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🐾</span>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Total
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Mascotas Registradas</h3>
              <p className="text-3xl font-bold text-gray-900">{petsCount}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  Activos
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Chips Activos</h3>
              <p className="text-3xl font-bold text-gray-900">{activePets}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">+</span>
                </div>
                <span className="text-xs font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                  Disponibles
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Espacios Libres</h3>
              <p className="text-3xl font-bold text-gray-900">{availableSlots}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-2">¿Listo para proteger otra mascota?</h2>
            <p className="text-blue-100 mb-6">
              Agrega una nueva mascota y genera su chip NFC en minutos
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.location.href = '/dashboard/pets/add'}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-md"
              >
                + Agregar Mascota
              </button>
              <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/20">
                Ver Perfil
              </button>
              <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/20">
                Historial
              </button>
            </div>
          </div>

          {/* Pets Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mis Mascotas</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Gestiona la información de tus compañeros
                </p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Ver todas →
              </button>
            </div>
            
            {pets && pets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {pets.map((pet) => (
                  <div 
                    key={pet.id} 
                    className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center ring-2 ring-white shadow-md">
                        {pet.photo_url ? (
                          <img
                            src={pet.photo_url}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">🐕</span>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pet.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {pet.is_active ? '● Activo' : '○ Inactivo'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{pet.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {pet.breed || 'Sin raza especificada'}
                    </p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">ID:</span>
                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-blue-600 font-semibold">
                          {pet.short_id}
                        </code>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🐾</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tienes mascotas registradas
                </h3>
                <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                  Comienza agregando tu primera mascota para protegerla con tecnología NFC
                </p>
                <button
                  onClick={() => window.location.href = '/dashboard/pets/add'}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  + Agregar Primera Mascota
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}