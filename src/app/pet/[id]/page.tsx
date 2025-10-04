'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import FoundReportForm from '@/components/pets/FoundReportForm'
import Link from 'next/link'

export default function PublicPetPage() {
  const params = useParams()
  const [pet, setPet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPet = async () => {
      try {
        console.log('Buscando mascota con ID:', params.id)
        
        const { data: petData, error: petError } = await supabase
          .from('pets')
          .select('*')
          .eq('short_id', params.id)
          .eq('is_active', true)
          .single()

        console.log('Pet query result:', { petData, petError })

        if (petError) throw petError
        if (!petData) {
          setError('Mascota no encontrada')
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, phone, email')
          .eq('user_id', petData.user_id)
          .single()

        console.log('Profile query result:', { profileData, profileError })

        if (profileError) {
          console.warn('No se encontró perfil:', profileError)
        }

        const combinedData = {
          ...petData,
          profiles: profileData || { 
            full_name: 'Dueño no disponible', 
            phone: null, 
            email: 'No disponible' 
          }
        }

        console.log('Final pet data:', combinedData)
        setPet(combinedData)

      } catch (error: any) {
        console.error('Error completo:', error)
        setError('Error al cargar la información: ' + (error.message || 'Error desconocido'))
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPet()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-20 w-20 border-4 border-emerald-400/30 mx-auto"></div>
          </div>
          <p className="mt-6 text-slate-700 text-lg font-semibold">Cargando información...</p>
        </div>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
          <div className="mb-6 text-8xl">🐕</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Mascota no encontrada
          </h2>
          <p className="text-slate-600 mb-6 text-lg">
            El código <span className="font-mono font-bold text-blue-600">{params.id}</span> no corresponde a ninguna mascota activa.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg"
          >
            ← Ir al inicio
          </Link>
        </div>
      </div>
    )
  }

  const owner = pet.profiles

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm border-b border-slate-200/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-3xl mb-5 shadow-lg">
              <span className="text-5xl">🐕</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
              ¡Hola! Soy {pet.name}
            </h1>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
              Si me encontraste, por favor ayúdame a volver a casa 🏠
            </p>
          </div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-12 space-y-8">
        {/* Pet Photo */}
        {pet.photo_url && (
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img
                src={pet.photo_url}
                alt={pet.name}
                className="relative w-72 h-72 object-cover rounded-full ring-4 ring-white shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-4xl shadow-xl">
                ❤️
              </div>
            </div>
          </div>
        )}

        {/* Pet Info Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-600">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">📋</span> 
              <span>Información de {pet.name}</span>
            </h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Nombre</span>
                <p className="text-slate-800 text-2xl font-bold mt-1">{pet.name}</p>
              </div>
              
              {pet.breed && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Raza</span>
                  <p className="text-slate-800 text-2xl font-bold mt-1">{pet.breed}</p>
                </div>
              )}
              
              {pet.age && (
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-5 border border-cyan-100">
                  <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">Edad</span>
                  <p className="text-slate-800 text-2xl font-bold mt-1">{pet.age}</p>
                </div>
              )}
            </div>
            
            {pet.medical_conditions && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-amber-800 uppercase tracking-wider block mb-2">
                      Información médica importante
                    </span>
                    <p className="text-slate-700 font-medium text-lg leading-relaxed">{pet.medical_conditions}</p>
                  </div>
                </div>
              </div>
            )}
            
            {pet.reward && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider block mb-2">
                      Recompensa
                    </span>
                    <p className="text-slate-700 font-medium text-lg leading-relaxed">{pet.reward}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-green-600">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">👨‍👩‍👧‍👦</span> 
              <span>Contactar a mi familia</span>
            </h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-5 border border-slate-200">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Dueño</span>
              <p className="text-slate-800 text-2xl font-bold mt-1">{owner.full_name}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {owner.phone && (
                <a
                  href={`tel:${owner.phone}`}
                  className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <div className="relative z-10 text-center">
                    <span className="block text-3xl mb-2">📞</span>
                    <span className="block text-sm font-semibold opacity-90 mb-1">Llamar ahora</span>
                    <span className="block font-mono text-lg font-bold">{owner.phone}</span>
                  </div>
                </a>
              )}
              
              <a
                href={`mailto:${owner.email}?subject=Encontré a ${pet.name}&body=Hola, encontré a ${pet.name}. Por favor contáctame para coordinar su regreso.`}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <div className="relative z-10 text-center">
                  <span className="block text-3xl mb-2">✉️</span>
                  <span className="block text-sm font-semibold opacity-90 mb-1">Enviar Email</span>
                  <span className="block text-xs opacity-80">Contacto rápido</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Report Found Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-cyan-600 to-blue-600">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🎉</span> 
              <span>¡Reportar que encontré a {pet.name}!</span>
            </h2>
            <p className="text-blue-100 mt-2 text-sm">
              Llena este formulario para notificar al dueño tu ubicación y datos de contacto
            </p>
          </div>
          <div className="p-8 bg-slate-50">
            <FoundReportForm petId={pet.id} petName={pet.name} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center space-x-4 bg-white px-8 py-5 rounded-2xl border border-slate-200 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <div className="text-left">
              <p className="text-slate-500 text-xs font-medium">Protegido por</p>
              <Link 
                href="/"
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 font-black text-2xl transition-all"
              >
                LinkPet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}