import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FoundReportForm from '@/components/pets/FoundReportForm'
import Link from 'next/link'

interface PageProps {
  params: {
    id: string
  }
}

export default async function PublicPetPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient()
  
  // Obtener información de la mascota por short_id
  const { data: pet } = await supabase
    .from('pets')
    .select(`
      *,
      profiles!inner(full_name, phone, email)
    `)
    .eq('short_id', params.id)
    .eq('is_active', true)
    .single()

  if (!pet) {
    notFound()
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
                PetGuard NFC
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = createServerSupabaseClient()
  
  const { data: pet } = await supabase
    .from('pets')
    .select('name, breed')
    .eq('short_id', params.id)
    .eq('is_active', true)
    .single()

  if (!pet) {
    return {
      title: 'Mascota no encontrada - PetGuard NFC'
    }
  }

  return {
    title: `${pet.name} - Mascota perdida | PetGuard NFC`,
    description: `Ayuda a ${pet.name} a volver a casa. Si encontraste esta mascota, aquí puedes contactar a su familia.`,
  }
}