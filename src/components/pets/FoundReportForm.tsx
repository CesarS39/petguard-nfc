'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface FoundReportFormProps {
  petId: string
  petName: string
}

export default function FoundReportForm({ petId, petName }: FoundReportFormProps) {
  const supabase = createClientComponentClient()
  const [formData, setFormData] = useState({
    finder_name: '',
    finder_phone: '',
    finder_email: '',
    location: '',
    message: ''
  })
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setLocation(coords)
        
        // Usar coordenadas como ubicación si el campo está vacío
        if (!formData.location.trim()) {
          setFormData({
            ...formData,
            location: `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`
          })
        } else {
          setFormData({
            ...formData,
            location: formData.location + ` (Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)})`
          })
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('No se pudo obtener tu ubicación. Puedes describirla manualmente.')
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('found_reports')
        .insert([{
          pet_id: petId,
          finder_name: formData.finder_name || 'Anónimo',
          finder_phone: formData.finder_phone || null,
          finder_email: formData.finder_email || null,
          location: formData.location,
          latitude: location?.lat || null,
          longitude: location?.lng || null,
          message: formData.message || null
        }])

      if (error) throw error

      setSubmitted(true)
    } catch (error: any) {
      setError(error.message || 'Error al enviar el reporte')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-xl">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-3">
          ¡Reporte enviado!
        </h3>
        <p className="text-gray-600 mb-6 text-lg">
          La familia de {petName} ha sido notificada y te contactará pronto.
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
          <p className="text-sm text-blue-800 font-medium">
            <strong>Mantén a {petName} seguro</strong> mientras llega su familia. 
            Ofrécele agua y un lugar cómodo para descansar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Ubicación - OBLIGATORIO */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          ¿Dónde encontraste a {petName}? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Ej: Parque Central, Calle 5..."
          />
          <button
            type="button"
            onClick={getLocation}
            className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 text-sm font-bold whitespace-nowrap transition-all shadow-md"
          >
            📍 GPS
          </button>
        </div>
        {location && (
          <p className="text-xs text-green-600 mt-2 font-medium">
            ✓ Ubicación GPS agregada
          </p>
        )}
      </div>

      {/* Campos opcionales */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <p className="text-sm font-bold text-gray-700">Información de contacto <span className="text-gray-400 font-normal">(opcional)</span></p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tu nombre
          </label>
          <input
            type="text"
            name="finder_name"
            value={formData.finder_name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="¿Cómo te llamas?"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tu teléfono
            </label>
            <input
              type="tel"
              name="finder_phone"
              value={formData.finder_phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Tu número"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tu email
            </label>
            <input
              type="email"
              name="finder_email"
              value={formData.finder_email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje adicional
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            placeholder={`Cuéntanos cómo está ${petName}...`}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !formData.location.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-bold text-lg"
      >
        {loading ? 'Enviando...' : `🚀 Notificar que encontré a ${petName}`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Solo la ubicación es obligatoria. Tu información de contacto ayudará al dueño a coordinarse contigo.
      </p>
    </form>
  )
}