'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import FoundReportForm from '@/components/pets/FoundReportForm'
import Link from 'next/link'

export default function PublicPetPage() {
  const params = useParams()
  const supabase = createClientComponentClient()
  const [pet, setPet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const { data: petData, error: petError } = await supabase
          .from('pets')
          .select('*')
          .eq('short_id', params.id)
          .eq('is_active', true)
          .single()

        if (petError) throw petError
        if (!petData) {
          setError('Mascota no encontrada')
          return
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, phone, email')
          .eq('user_id', petData.user_id)
          .single()

        const combinedData = {
          ...petData,
          profiles: profileData || { 
            full_name: 'Dueño no disponible', 
            phone: null, 
            email: 'No disponible' 
          }
        }

        setPet(combinedData)
      } catch (error: any) {
        setError('Error al cargar la información')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPet()
    }
  }, [params.id, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated background circles */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <div className="text-center relative z-10">
          <div className="relative inline-block">
            <div className="w-32 h-32 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl animate-bounce">🐾</span>
            </div>
          </div>
          <p className="mt-8 text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Cargando información...
          </p>
        </div>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTE2IDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDEwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        
        <div className="text-center max-w-lg mx-auto bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 relative z-10">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-red-400 to-orange-500 rounded-full mb-4 shadow-xl">
              <span className="text-7xl">😢</span>
            </div>
          </div>
          <h2 className="text-4xl font-black text-gray-800 mb-4">
            ¡Ups! No encontrado
          </h2>
          <p className="text-gray-600 mb-2 text-lg">
            El código <span className="font-mono font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-lg">{params.id}</span>
          </p>
          <p className="text-gray-600 mb-8">
            no corresponde a ninguna mascota activa
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const owner = pet.profiles

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-green-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating paw prints */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 text-6xl animate-float">🐾</div>
        <div className="absolute top-40 right-20 text-4xl animate-float animation-delay-1000">🐾</div>
        <div className="absolute bottom-40 left-1/4 text-5xl animate-float animation-delay-2000">🐾</div>
        <div className="absolute bottom-20 right-1/3 text-7xl animate-float animation-delay-3000">🐾</div>
      </div>

      {/* Hero Header */}
      <div className="relative pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-block mb-4 sm:mb-6 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-green-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-5xl sm:text-7xl">🐶</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-3 sm:mb-4 px-4">
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-green-500 bg-clip-text text-transparent">
              ¡Hola! Soy {pet.name}
            </span>
          </h1>
          
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-full px-6 sm:px-8 py-3 sm:py-4 shadow-xl border-4 border-white mx-4">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              🏠 Por favor, ayúdame a volver a casa
            </p>
          </div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pb-20 space-y-8">
        {/* Pet Photo with fancy frame */}
        {pet.photo_url && (
          <div className="flex justify-center -mt-4 px-4">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-r from-blue-600 via-cyan-600 to-green-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
              
              {/* Photo frame */}
              <div className="relative">
                <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 rounded-full animate-spin-slow"></div>
                <div className="relative bg-white p-2 sm:p-3 rounded-full">
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    className="w-64 h-64 sm:w-80 sm:h-80 object-cover rounded-full shadow-2xl"
                  />
                </div>
              </div>

              {/* Floating hearts */}
              <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 text-3xl sm:text-4xl animate-bounce">💕</div>
              <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 text-4xl sm:text-5xl animate-bounce animation-delay-1000">✨</div>
            </div>
          </div>
        )}

        {/* Pet Info Cards - Bento Grid Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Name Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl transform hover:scale-105 transition-all">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎯</div>
            <p className="text-xs sm:text-sm font-bold opacity-90 uppercase tracking-wider mb-2">Mi nombre es</p>
            <p className="text-3xl sm:text-4xl font-black">{pet.name}</p>
          </div>

          {/* Breed Card */}
          {pet.breed && (
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl transform hover:scale-105 transition-all">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🐕</div>
              <p className="text-xs sm:text-sm font-bold opacity-90 uppercase tracking-wider mb-2">Soy un</p>
              <p className="text-2xl sm:text-3xl font-black">{pet.breed}</p>
            </div>
          )}

          {/* Age Card */}
          {pet.age && (
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl transform hover:scale-105 transition-all">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎂</div>
              <p className="text-xs sm:text-sm font-bold opacity-90 uppercase tracking-wider mb-2">Mi edad</p>
              <p className="text-2xl sm:text-3xl font-black">{pet.age}</p>
            </div>
          )}
        </div>

        {/* Medical Info - Important Alert Style */}
        {pet.medical_conditions && (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-4xl">⚠️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-red-600 mb-3 uppercase tracking-tight">
                    ¡Información Médica Importante!
                  </h3>
                  <p className="text-xl text-gray-700 leading-relaxed font-medium">{pet.medical_conditions}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reward Card */}
        {pet.reward && (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-green-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-yellow-50 to-green-50 rounded-3xl p-8 shadow-2xl border-4 border-yellow-300">
              <div className="flex items-center gap-6">
                <div className="text-6xl animate-bounce">💰</div>
                <div>
                  <h3 className="text-xl font-black text-green-700 mb-2 uppercase">¡Recompensa Disponible!</h3>
                  <p className="text-2xl font-black text-gray-800">{pet.reward}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Section - Modern Cards */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-6 sm:mb-8">
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              👨‍👩‍👧 Contacta a mi familia
            </span>
          </h2>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Dueño</p>
            <p className="text-2xl sm:text-3xl font-black text-gray-800">{owner.full_name}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {owner.phone && (
              <a
                href={`tel:${owner.phone}`}
                className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                <div className="relative text-white text-center">
                  <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">📱</div>
                  <p className="font-bold text-xs sm:text-sm mb-1 sm:mb-2">Llamar Ahora</p>
                  <p className="font-mono text-lg sm:text-xl font-black break-all">{owner.phone}</p>
                </div>
              </a>
            )}

            <a
              href={`mailto:${owner.email}?subject=¡Encontré a ${pet.name}!&body=Hola, encontré a ${pet.name}. Por favor contáctame.`}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              <div className="relative text-white text-center">
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">✉️</div>
                <p className="font-bold text-xs sm:text-sm mb-1 sm:mb-2">Enviar Email</p>
                <p className="text-xs sm:text-sm opacity-90">Contacto rápido</p>
              </div>
            </a>
          </div>
        </div>

        {/* Report Form - Exciting Style */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-green-500 rounded-2xl sm:rounded-3xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-green-500 p-6 sm:p-8 text-white text-center">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">🎉</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3">
                ¡Lo encontré!
              </h2>
              <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto px-4">
                Reporta que encontraste a {pet.name} para que su familia sepa que está a salvo
              </p>
            </div>
            <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-cyan-50">
              <FoundReportForm petId={pet.id} petName={pet.name} />
            </div>
          </div>
        </div>

        {/* Footer - Brand */}
        <div className="text-center pt-8 sm:pt-12">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-white/90 backdrop-blur-xl px-8 sm:px-10 py-5 sm:py-6 rounded-2xl sm:rounded-full shadow-2xl border-4 border-white">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl sm:text-3xl">🐾</span>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Protegido por</p>
              <Link 
                href="/"
                className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-green-500 bg-clip-text text-transparent hover:scale-110 transition-transform inline-block"
              >
                PetGuard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(10px, 10px) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}