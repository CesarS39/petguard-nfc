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
        
        // Primero intentar obtener solo la mascota
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

        // Luego obtener el perfil del dueño
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, phone, email')
          .eq('user_id', petData.user_id)
          .single()

        console.log('Profile query result:', { profileData, profileError })

        if (profileError) {
          console.warn('No se encontró perfil:', profileError)
          // Continuar sin perfil si no existe
        }

        // Combinar los datos
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información...</p>
        </div>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-4">
            <span className="text-6xl">🐕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Mascota no encontrada
          </h2>
          <p className="text-gray-600 mb-4">
            El código {params.id} no corresponde a ninguna mascota activa o el enlace puede estar dañado.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    )
  }

  const owner = pet.profiles

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <span className="text-2xl">🐕</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Hola! Soy {pet.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Si me encontraste, por favor ayúdame a volver a casa
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Pet Photo */}
        {pet.photo_url && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <img
              src={pet.photo_url}
              alt={pet.name}
              className="w-48 h-48 object-cover rounded-full mx-auto"
            />
          </div>
        )}

        {/* Pet Info */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Información de {pet.name}
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Nombre:</span>
                <p className="text-gray-900">{pet.name}</p>
              </div>
              
              {pet.breed && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Raza:</span>
                  <p className="text-gray-900">{pet.breed}</p>
                </div>
              )}
              
              {pet.age && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Edad:</span>
                  <p className="text-gray-900">{pet.age}</p>
                </div>
              )}
              
              {pet.medical_conditions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <span className="text-sm font-medium text-yellow-800">
                    ⚠️ Información médica importante:
                  </span>
                  <p className="text-yellow-700 mt-1">{pet.medical_conditions}</p>
                </div>
              )}
              
              {pet.reward && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <span className="text-sm font-medium text-green-800">
                    💰 Recompensa:
                  </span>
                  <p className="text-green-700 mt-1">{pet.reward}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Contactar a mi familia
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Dueño:</span>
              <p className="text-gray-900">{owner.full_name}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {owner.phone && (
                <a
                  href={`tel:${owner.phone}`}
                  className="flex-1 bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  📞 Llamar: {owner.phone}
                </a>
              )}
              
              <a
                href={`mailto:${owner.email}?subject=Encontré a ${pet.name}&body=Hola, encontré a ${pet.name}. Por favor contáctame para coordinar su regreso.`}
                className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                ✉️ Enviar Email
              </a>
            </div>
          </div>
        </div>

        {/* Report Found Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              🎉 ¡Reportar que encontré a {pet.name}!
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Llena este formulario para notificar al dueño tu ubicación y datos de contacto
            </p>
          </div>
          <div className="p-6">
            <FoundReportForm petId={pet.id} petName={pet.name} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center space-x-2 text-gray-500">
            <span className="text-2xl">🏠</span>
            <div>
              <p className="text-sm">Protegido por</p>
              <Link 
                href="/"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
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