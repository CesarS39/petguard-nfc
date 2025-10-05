'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function AddPetPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [canAddPet, setCanAddPet] = useState(false)
  const [petsCount, setPetsCount] = useState(0)
  const [maxPets, setMaxPets] = useState(3)
  
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    medical_conditions: '',
    reward: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Verificación de seguridad
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        const user = session?.user
        
        if (authError || !user) {
          router.replace('/auth/login')
          return
        }

        setUserId(user.id)

        // Verificar cuántas mascotas tiene
        const { data: petsData, count } = await supabase
          .from('pets')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)

        const { data: profileData } = await supabase
          .from('profiles')
          .select('max_pets')
          .eq('user_id', user.id)
          .single()

        const currentPets = count || 0
        const maxAllowed = profileData?.max_pets || 3

        setPetsCount(currentPets)
        setMaxPets(maxAllowed)

        if (currentPets >= maxAllowed) {
          setCanAddPet(false)
          setError(`Has alcanzado el límite de ${maxAllowed} mascotas`)
          setLoading(false)
          setTimeout(() => router.replace('/dashboard'), 3000)
          return
        }

        setCanAddPet(true)
        setIsAuthorized(true)
      } catch (error: any) {
        console.error('Error:', error)
        setError('Error al verificar permisos')
        setTimeout(() => router.replace('/dashboard'), 2000)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        reject('Solo se permiten archivos JPG, PNG o WEBP')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        reject(`El archivo es muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`)
        return
      }

      const img = new window.Image()
      img.src = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(img.src)
        
        if (img.width > 4000 || img.height > 4000) {
          reject('La imagen es muy grande. Máximo 4000x4000 píxeles')
          return
        }

        if (img.width < 200 || img.height < 200) {
          reject('La imagen es muy pequeña. Mínimo 200x200 píxeles')
          return
        }

        resolve(true)
      }

      img.onerror = () => {
        reject('Error al cargar la imagen')
      }
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageError('')

    if (!file) return

    try {
      await validateImage(file)
      setImageFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      setImageError(error)
      setImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (petId: string): Promise<string | null> => {
    if (!imageFile) return null

    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${userId}/${petId}-${Date.now()}.${fileExt}`

      setUploadProgress(30)

      const { data, error } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      setUploadProgress(60)

      const { data: { publicUrl } } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(fileName)

      setUploadProgress(100)

      return publicUrl
    } catch (error: any) {
      console.error('Error uploading image:', error)
      throw new Error('Error al subir la imagen: ' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthorized || !canAddPet) {
      setError('No tienes permiso para agregar mascotas')
      return
    }

    setSaving(true)
    setError('')
    setUploadProgress(0)

    try {
      setUploadProgress(10)
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .insert([{
          ...formData,
          user_id: userId,
          short_id: '',
          is_active: true,
          photo_url: null
        }])
        .select()
        .single()

      if (petError) throw petError

      let photoUrl = null

      if (imageFile && petData) {
        photoUrl = await uploadImage(petData.id)

        if (photoUrl) {
          const { error: updateError } = await supabase
            .from('pets')
            .update({ photo_url: photoUrl })
            .eq('id', petData.id)
            .eq('user_id', userId)

          if (updateError) throw updateError
        }
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Error al agregar mascota')
      setUploadProgress(0)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
          </div>
          <p className="mt-6 text-gray-700 text-lg font-semibold">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized || !canAddPet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
          <div className="mb-6 text-8xl">
            {petsCount >= maxPets ? '⚠️' : '🔒'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {petsCount >= maxPets ? 'Límite Alcanzado' : 'Acceso Denegado'}
          </h2>
          <p className="text-gray-600 mb-4 text-lg">
            {error || 'No tienes permiso para agregar mascotas'}
          </p>
          {petsCount >= maxPets && (
            <div className="bg-blue-50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-blue-700 font-medium">
                Tienes {petsCount} de {maxPets} mascotas registradas
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500">Redirigiendo al dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header Card Mejorado */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-4xl">🐾</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Agregar nueva mascota</h2>
                    <p className="text-gray-600 mt-1">Completa la información de tu compañero</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              </div>
              
              {/* Contador de espacios */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Espacios disponibles</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                      {maxPets - petsCount}/{maxPets}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Upload Card Mejorado */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">📸</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">Foto de la mascota</h3>
                <p className="text-sm text-gray-500">Ayuda a identificar a tu compañero rápidamente</p>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full font-medium">Opcional</span>
            </div>

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-green-50/50 transition-all duration-300"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                  <span className="text-6xl">📷</span>
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">
                  Arrastra una imagen o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  JPG, PNG o WEBP • Máximo 5MB
                </p>
                <div className="inline-flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recomendado 800x800 píxeles
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-all shadow-xl hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {imageFile && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800 truncate flex-1">{imageFile.name}</span>
                        <span className="ml-4 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            {imageError && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-sm text-red-700 font-medium">{imageError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Basic Information Card Mejorado */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Información básica</h3>
                <p className="text-sm text-gray-500">Datos principales de identificación</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                  placeholder="Ej: Max, Luna, Rocky..."
                />
              </div>

              <div>
                <label htmlFor="breed" className="block text-sm font-bold text-gray-700 mb-2">
                  Raza
                </label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Ej: Golden Retriever..."
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-bold text-gray-700 mb-2">
                  Edad
                </label>
                <input
                  type="text"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Ej: 3 años, Cachorro..."
                />
              </div>
            </div>
          </div>

          {/* Medical & Reward Card Mejorado */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">⚕️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Información adicional</h3>
                <p className="text-sm text-gray-500">Detalles importantes para quien encuentre a tu mascota</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="medical_conditions" className="block text-sm font-bold text-gray-700 mb-2">
                  Condiciones médicas importantes
                </label>
                <textarea
                  id="medical_conditions"
                  name="medical_conditions"
                  value={formData.medical_conditions}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900 placeholder:text-gray-400"
                  placeholder="Ej: Alergias, medicamentos, condiciones especiales..."
                />
                <div className="mt-3 flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                  <span className="text-lg">💡</span>
                  <p className="text-xs text-blue-700 font-medium">
                    Esta información será visible en la página pública para ayudar a quien encuentre a tu mascota
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="reward" className="block text-sm font-bold text-gray-700 mb-2">
                  Recompensa
                </label>
                <input
                  type="text"
                  id="reward"
                  name="reward"
                  value={formData.reward}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Ej: $500, Recompensa disponible..."
                />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {saving && uploadProgress > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-3xl shadow-lg border border-blue-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center animate-pulse shadow-lg">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <span className="text-sm font-bold text-blue-900">
                    {uploadProgress < 30 ? 'Creando mascota...' : 
                     uploadProgress < 100 ? 'Subiendo imagen...' : 
                     '¡Completado!'}
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-600 bg-blue-100 px-5 py-2 rounded-xl shadow-sm">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 rounded-3xl shadow-lg border border-red-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-2xl">❌</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-900 mb-1">Error al crear mascota</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                disabled={saving}
                className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={saving || !formData.name.trim()}
                className="w-full sm:w-auto px-12 py-4 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-green-600 rounded-xl hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  'Agregar Mascota'
                )}
              </button>
            </div>
          </div>

          {/* Info Card Mejorado */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-lg border border-green-200 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🎯</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900">¿Qué sucederá después?</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 font-bold shadow-md">
                  1
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">ID único generado</p>
                  <p className="text-xs text-gray-600">Se creará automáticamente un identificador único</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 font-bold shadow-md">
                  2
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Foto guardada</p>
                  <p className="text-xs text-gray-600">La imagen se almacenará de forma segura</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 font-bold shadow-md">
                  3
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Chip NFC preparado</p>
                  <p className="text-xs text-gray-600">Recibirás el chip programado con el ID</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 font-bold shadow-md">
                  4
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Página pública activa</p>
                  <p className="text-xs text-gray-600">Disponible inmediatamente tras el registro</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}