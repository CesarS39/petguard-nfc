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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header con diseño moderno */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4 shadow-lg">
              <span className="text-3xl">🐕</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Hola! Soy {pet.name}
            </h1>
            <p className="text-gray-600 text-lg">
              Si me encontraste, por favor ayúdame a volver a casa 🏠
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Pet Photo con diseño mejorado */}
        {pet.photo_url && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
            <div className="relative inline-block">
              <img
                src={pet.photo_url}
                alt={pet.name}
                className="w-56 h-56 object-cover rounded-3xl mx-auto shadow-xl ring-4 ring-white"
              />
              <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">💚</span>
              </div>
            </div>
          </div>
        )}

        {/* Pet Info con diseño card moderno */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="mr-2">📋</span>
              Información de {pet.name}
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Nombre</span>
                <p className="text-gray-900 font-bold text-lg mt-1">{pet.name}</p>
              </div>
              
              {pet.breed && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Raza</span>
                  <p className="text-gray-900 font-bold text-lg mt-1">{pet.breed}</p>
                </div>
              )}
              
              {pet.age && (
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Edad</span>
                  <p className="text-gray-900 font-bold text-lg mt-1">{pet.age}</p>
                </div>
              )}
            </div>
            
            {pet.medical_conditions && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-5 shadow-sm">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl flex-shrink-0">⚠️</span>
                  <div>
                    <span className="text-sm font-bold text-yellow-800 block mb-1">
                      Información médica importante
                    </span>
                    <p className="text-yellow-900 leading-relaxed">{pet.medical_conditions}</p>
                  </div>
                </div>
              </div>
            )}
            
            {pet.reward && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5 shadow-sm">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl flex-shrink-0">💰</span>
                  <div>
                    <span className="text-sm font-bold text-green-800 block mb-1">
                      Recompensa ofrecida
                    </span>
                    <p className="text-green-900 leading-relaxed">{pet.reward}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Info mejorado */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="mr-2">📞</span>
              Contactar a mi familia
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Dueño
              </span>
              <p className="text-gray-900 font-bold text-lg">{owner.full_name}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {owner.phone && (
                <a
                  href={`tel:${owner.phone}`}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold"
                >
                  <span className="text-lg mr-2">📞</span>
                  Llamar: {owner.phone}
                </a>
              )}
              
              <a
                href={`mailto:${owner.email}?subject=Encontré a ${pet.name}&body=Hola, encontré a ${pet.name}. Por favor contáctame para coordinar su regreso.`}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-center py-4 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-semibold"
              >
                <span className="text-lg mr-2">✉️</span>
                Enviar Email
              </a>
            </div>
          </div>
        </div>

        {/* Report Found Form con diseño atractivo */}
        <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-xl overflow-hidden border-2 border-white">
          <div className="px-6 py-5 bg-white/10 backdrop-blur-sm border-b border-white/20">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="mr-2 text-2xl">🎉</span>
              ¡Reportar que encontré a {pet.name}!
            </h2>
            <p className="text-sm text-blue-50 mt-2">
              Llena este formulario para notificar al dueño tu ubicación y datos de contacto
            </p>
          </div>
          <div className="p-6 bg-white">
            <FoundReportForm petId={pet.id} petName={pet.name} />
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center space-x-3 bg-white px-8 py-4 rounded-2xl shadow-md border border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">🐾</span>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500 font-medium">Protegido por</p>
              <Link 
                href="/"
                className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-green-700"
              >
                PetGuard
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
      title: 'Mascota no encontrada - PetGuard'
    }
  }

  return {
    title: `${pet.name} - Mascota perdida | PetGuard`,
    description: `Ayuda a ${pet.name} a volver a casa. Si encontraste esta mascota, aquí puedes contactar a su familia.`,
  }
}