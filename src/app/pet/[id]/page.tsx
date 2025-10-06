'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface FoundReportFormProps {
  petId: string
  petName: string
}

export default function FoundReportForm({ petId, petName }: FoundReportFormProps) {
  const supabase = createClientComponentClient()
  
  // Estados del formulario
  const [finderName, setFinderName] = useState('')
  const [finderPhone, setFinderPhone] = useState('')
  const [finderEmail, setFinderEmail] = useState('')
  const [message, setMessage] = useState('')
  const [location, setLocation] = useState('')
  
  // Estados de geolocalización
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  
  // Estados de envío
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Verificar permisos de ubicación al montar el componente
  useEffect(() => {
    checkLocationPermission()
  }, [])

  const checkLocationPermission = async () => {
    // Verificar si la API de geolocalización está disponible
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización')
      return
    }

    // Verificar permisos si está disponible
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        setLocationPermission(permission.state)
        
        // Escuchar cambios en el permiso
        permission.addEventListener('change', () => {
          setLocationPermission(permission.state)
        })
      } catch (error) {
        console.log('No se pudo verificar permisos:', error)
      }
    }
  }

  const getLocation = () => {
    setGettingLocation(true)
    setLocationError('')

    console.log('🌍 Solicitando ubicación...')

    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización. Por favor, escribe la ubicación manualmente.')
      setGettingLocation(false)
      return
    }

    // Opciones para la geolocalización
    const options = {
      enableHighAccuracy: false, // false = más rápido
      timeout: 10000, // 10 segundos
      maximumAge: 300000 // 5 minutos de caché
    }

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        console.log('✅ Ubicación obtenida:', position)
        
        const { latitude, longitude, accuracy } = position.coords
        
        setCoordinates({ lat: latitude, lng: longitude })
        
        // Obtener nombre de ubicación usando API de geocodificación
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
          .then(res => res.json())
          .then(data => {
            console.log('📍 Geocoding data:', data)
            
            // Construir dirección legible
            const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            setLocation(address)
            setLocationError('')
            setGettingLocation(false)
            
            console.log('✅ Dirección obtenida:', address)
          })
          .catch(err => {
            console.warn('⚠️ Error en geocoding:', err)
            // Si falla geocoding, usar coordenadas
            setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
            setLocationError('')
            setGettingLocation(false)
          })
      },
      // Error callback
      (error) => {
        console.error('❌ Error de geolocalización:', error)
        setGettingLocation(false)
        
        let errorMessage = ''
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso denegado. Por favor, activa la ubicación en la configuración de tu navegador.'
            setLocationPermission('denied')
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible. Por favor, escribe la ubicación manualmente.'
            break
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado. Por favor, intenta de nuevo o escribe la ubicación.'
            break
          default:
            errorMessage = 'No se pudo obtener la ubicación. Por favor, escríbela manualmente.'
        }
        
        setLocationError(errorMessage)
      },
      options
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validación básica
    if (!finderName.trim()) {
      setError('Por favor ingresa tu nombre')
      setLoading(false)
      return
    }

    if (!finderPhone && !finderEmail) {
      setError('Por favor ingresa al menos un método de contacto (teléfono o email)')
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase
        .from('found_reports')
        .insert({
          pet_id: petId,
          finder_name: finderName.trim(),
          finder_phone: finderPhone.trim() || null,
          finder_email: finderEmail.trim() || null,
          location: location.trim() || null,
          latitude: coordinates?.lat || null,
          longitude: coordinates?.lng || null,
          message: message.trim() || null
        })

      if (insertError) throw insertError

      console.log('✅ Reporte enviado exitosamente')
      
      setSuccess(true)
      
      // Limpiar formulario
      setFinderName('')
      setFinderPhone('')
      setFinderEmail('')
      setMessage('')
      setLocation('')
      setCoordinates(null)
      
      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(false), 5000)
      
    } catch (error: any) {
      console.error('❌ Error al enviar reporte:', error)
      setError('Error al enviar el reporte. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre */}
      <div>
        <label htmlFor="finderName" className="block text-sm font-bold text-gray-700 mb-2">
          Tu nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="finderName"
          required
          value={finderName}
          onChange={(e) => setFinderName(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
          placeholder="Juan Pérez"
        />
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="finderPhone" className="block text-sm font-bold text-gray-700 mb-2">
          Tu teléfono <span className="text-gray-400 text-xs">(recomendado)</span>
        </label>
        <input
          type="tel"
          id="finderPhone"
          value={finderPhone}
          onChange={(e) => setFinderPhone(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
          placeholder="+52 123 456 7890"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="finderEmail" className="block text-sm font-bold text-gray-700 mb-2">
          Tu email <span className="text-gray-400 text-xs">(opcional)</span>
        </label>
        <input
          type="email"
          id="finderEmail"
          value={finderEmail}
          onChange={(e) => setFinderEmail(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
          placeholder="tu@email.com"
        />
      </div>

      {/* Ubicación */}
      <div>
        <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-2">
          ¿Dónde lo encontraste?
        </label>
        
        {/* Botón de obtener ubicación */}
        <div className="mb-3">
          <button
            type="button"
            onClick={getLocation}
            disabled={gettingLocation || locationPermission === 'denied'}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              gettingLocation 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : locationPermission === 'denied'
                ? 'bg-red-100 text-red-600 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
            }`}
          >
            {gettingLocation ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <span className="text-xl">📍</span>
                {locationPermission === 'denied' ? 'Ubicación denegada' : 'Usar mi ubicación actual'}
              </>
            )}
          </button>
          
          {/* Coordenadas obtenidas */}
          {coordinates && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <span className="text-lg">✓</span>
              <span>Ubicación obtenida ({coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)})</span>
            </div>
          )}
        </div>

        {/* Error de ubicación */}
        {locationError && (
          <div className="mb-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-yellow-800 font-medium">{locationError}</p>
                {locationPermission === 'denied' && (
                  <p className="text-xs text-yellow-700 mt-2">
                    Para habilitar la ubicación:
                    <br />• Safari: Configuración → Safari → Ubicación
                    <br />• Chrome: Configuración del sitio → Permisos → Ubicación
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Input manual de ubicación */}
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
          placeholder="Ej: Parque Central, cerca de la fuente"
        />
        <p className="text-xs text-gray-500 mt-2">
          Puedes escribir la ubicación manualmente o usar el botón de arriba
        </p>
      </div>

      {/* Mensaje adicional */}
      <div>
        <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
          Mensaje adicional <span className="text-gray-400 text-xs">(opcional)</span>
        </label>
        <textarea
          id="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 resize-none"
          placeholder="Información adicional sobre el estado de la mascota..."
        />
      </div>

      {/* Mensajes de error/éxito */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <p className="text-sm text-red-700 font-medium flex-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <p className="text-sm text-green-700 font-bold mb-1">
                ¡Reporte enviado exitosamente!
              </p>
              <p className="text-xs text-green-600">
                El dueño de {petName} ha sido notificado y te contactará pronto. ¡Gracias por tu ayuda!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Enviando reporte...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span className="text-2xl">📧</span>
            Enviar Reporte
          </span>
        )}
      </button>

      {/* Nota de privacidad */}
      <p className="text-xs text-center text-gray-500">
        Tu información será compartida únicamente con el dueño de {petName}
      </p>
    </form>
  )
}