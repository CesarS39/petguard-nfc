'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'

interface Report {
  id: string
  pet_id: string
  finder_name: string
  finder_phone: string | null
  finder_email: string | null
  location: string | null
  latitude: number | null
  longitude: number | null
  message: string | null
  created_at: string
  pets: {
    id: string
    name: string
    short_id: string
    photo_url: string | null
  }
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          window.location.href = '/auth/login'
          return
        }

        setUser(user)

        // Obtener todos los reportes de las mascotas del usuario
        const { data: reportsData, error: reportsError } = await supabase
          .from('found_reports')
          .select(`
            *,
            pets!inner(
              id,
              name,
              short_id,
              photo_url,
              user_id
            )
          `)
          .eq('pets.user_id', user.id)
          .order('created_at', { ascending: false })

        if (reportsError) throw reportsError

        setReports(reportsData || [])

      } catch (error: any) {
        console.error('Error fetching reports:', error)
        setError('Error al cargar los reportes')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Cargando reportes...</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`
    } else {
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
  }

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
            <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <span className="text-xl">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/pets" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <span className="text-xl">🐕</span>
              <span>Mis Mascotas</span>
            </Link>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
              <span className="text-xl">📍</span>
              <span>Reportes</span>
            </a>
            <Link href="/dashboard/profile" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <span className="text-xl">⚙️</span>
              <span>Configuración</span>
            </Link>
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
                  Reportes de Mascotas Encontradas 📍
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Aquí puedes ver todos los reportes de tus mascotas
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Volver al Dashboard
                </Link>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {reports.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">📍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No tienes reportes aún
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Cuando alguien encuentre a alguna de tus mascotas y reporte su ubicación, 
                verás la información aquí.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                Ver Mis Mascotas
              </Link>
            </div>
          ) : (
            // Reports List
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{reports.length}</span> reporte{reports.length !== 1 ? 's' : ''} en total
                </p>
              </div>

              {reports.map((report) => (
                <div 
                  key={report.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header del reporte */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center ring-2 ring-white shadow-md flex-shrink-0">
                          {report.pets.photo_url ? (
                            <img
                              src={report.pets.photo_url}
                              alt={report.pets.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">🐕</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            ¡{report.pets.name} fue encontrado!
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>🕐 {formatDate(report.created_at)}</span>
                            <span>•</span>
                            <code className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-blue-600">
                              {report.pets.short_id}
                            </code>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        ✓ Reportado
                      </span>
                    </div>

                    {/* Info del finder */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide block mb-2">
                          👤 Persona que encontró
                        </span>
                        <p className="text-gray-900 font-bold">{report.finder_name}</p>
                      </div>

                      {report.location && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                          <span className="text-xs font-semibold text-green-600 uppercase tracking-wide block mb-2">
                            📍 Ubicación
                          </span>
                          <p className="text-gray-900 font-medium text-sm">{report.location}</p>
                        </div>
                      )}
                    </div>

                    {/* Contacto */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-3">
                        📞 Información de contacto
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {report.finder_phone && (
                          <a
                            href={`tel:${report.finder_phone}`}
                            className="flex items-center space-x-2 text-sm bg-white px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
                          >
                            <span>📞</span>
                            <span className="text-gray-900 font-medium">{report.finder_phone}</span>
                          </a>
                        )}
                        {report.finder_email && (
                          <a
                            href={`mailto:${report.finder_email}`}
                            className="flex items-center space-x-2 text-sm bg-white px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
                          >
                            <span>✉️</span>
                            <span className="text-gray-900 font-medium">{report.finder_email}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Mensaje adicional */}
                    {report.message && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                        <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wide block mb-2">
                          💬 Mensaje adicional
                        </span>
                        <p className="text-gray-800 text-sm leading-relaxed">{report.message}</p>
                      </div>
                    )}

                    {/* Mapa */}
                    {report.latitude && report.longitude && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => openInMaps(report.latitude!, report.longitude!)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-semibold text-center"
                        >
                          🗺️ Ver ubicación en Google Maps
                        </button>
                        <button
                          onClick={() => {
                            const coords = `${report.latitude},${report.longitude}`
                            navigator.clipboard.writeText(coords)
                            alert('Coordenadas copiadas al portapapeles')
                          }}
                          className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                        >
                          📋 Copiar coordenadas
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}