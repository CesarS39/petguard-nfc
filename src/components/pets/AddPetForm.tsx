'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

interface AddPetFormProps {
  userId: string
}

export default function AddPetForm({ userId }: AddPetFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    medical_conditions: '',
    reward: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('pets')
        .insert([{
          ...formData,
          user_id: userId,
          short_id: '', // Se generará automáticamente por el trigger
          is_active: true
        }])
        .select()

      if (error) throw error

      // Redirigir al dashboard con mensaje de éxito
      router.push('/dashboard?success=pet-added')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Error al agregar mascota')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la mascota *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ej: Max, Luna, Rocky..."
        />
      </div>

      {/* Raza */}
      <div>
        <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
          Raza
        </label>
        <input
          type="text"
          id="breed"
          name="breed"
          value={formData.breed}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ej: Golden Retriever, Mestizo, Siamés..."
        />
      </div>

      {/* Edad */}
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
          Edad
        </label>
        <input
          type="text"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ej: 3 años, 8 meses, Cachorro..."
        />
      </div>

      {/* Condiciones médicas */}
      <div>
        <label htmlFor="medical_conditions" className="block text-sm font-medium text-gray-700 mb-1">
          Condiciones médicas importantes
        </label>
        <textarea
          id="medical_conditions"
          name="medical_conditions"
          value={formData.medical_conditions}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ej: Alergias, medicamentos, condiciones especiales..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Esta información aparecerá en la página pública para ayudar a quien encuentre a tu mascota
        </p>
      </div>

      {/* Recompensa */}
      <div>
        <label htmlFor="reward" className="block text-sm font-medium text-gray-700 mb-1">
          Recompensa (opcional)
        </label>
        <input
          type="text"
          id="reward"
          name="reward"
          value={formData.reward}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ej: $500, Recompensa disponible..."
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={loading || !formData.name.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Agregar Mascota'}
        </button>
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">¿Qué sigue?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Se generará un ID único para tu mascota (ej: ABC123)</li>
          <li>• Recibirás el chip NFC programado con la URL única</li>
          <li>• Podrás actualizar la información cuando quieras</li>
          <li>• La página pública estará disponible inmediatamente</li>
        </ul>
      </div>
    </form>
  )
}