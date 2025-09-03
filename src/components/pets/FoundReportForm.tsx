'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface FoundReportFormProps {
  petId: string
  petName: string
}

export default function FoundReportForm({ petId, petName }: FoundReportFormProps) {
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
        
        // Agregar coordenadas al campo location
        setFormData({
          ...formData,
          location: formData.location + ` (Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)})`
        })
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
          finder_name: formData.finder_name,
          finder_phone: formData.finder_phone || null,
          finder_email: formData.finder_email || null,
          location: formData.location || null,
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ¡Reporte enviado!
        </h3>
        <p className="text-gray-600 mb-4">
          El dueño de {petName} ha sido notificado. Te contactará pronto.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-700">
            <strong>Mantén a {petName} seguro</strong> mientras llega su familia. 
            Ofrécele agua y un lugar cómodo para descansar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre del finder */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tu nombre *
        </label>
        <input
          type="text"
          name="finder_name"
          required
          value={formData.finder_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="¿Cómo te llamas?"
        />
      </div>

      {/* Contacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tu teléfono
          </label>
          <input
            type="tel"
            name="finder_phone"
            value={formData.finder_phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      {/* Ubicación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ¿Dónde encontraste a {petName}?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej: Parque Central, Calle 5 con Carrera 10..."
          />
          <button
            type="button"
            onClick={getLocation}
            className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm whitespace-nowrap"
          >
            📍 Mi ubicación
          </button>
        </div>
        {location && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Ubicación GPS agregada
          </p>
        )}
      </div>

      {/* Mensaje adicional */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Información adicional (opcional)
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={`Cuéntanos cómo está ${petName}, si necesita atención médica, etc.`}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !formData.finder_name}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Enviando...' : `🚀 Notificar que encontré a ${petName}`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Al enviar este reporte, el dueño recibirá tu información de contacto para coordinar el reencuentro
      </p>
    </form>
  )
}
