'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>(null)
  
  const supabase = createClientComponentClient()

  // Verificar sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Sesión actual:', session)
      setDebugInfo(prev => ({ ...prev, sessionOnLoad: session }))
      
      if (session) {
        console.log('Ya hay sesión, redirigiendo...')
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    console.log('=== INICIANDO LOGIN ===')
    console.log('URL actual:', window.location.href)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Respuesta de signIn:', { data, error: signInError })
      setDebugInfo({ signInData: data, signInError })

      if (signInError) throw signInError
      
      if (data.session) {
        console.log('✅ Sesión creada:', data.session)
        setSuccess('Inicio de sesión exitoso!')
        
        // Verificar que la sesión se guardó
        const { data: { session: verifySession } } = await supabase.auth.getSession()
        console.log('Sesión verificada después de login:', verifySession)
        
        // Intentar redirección
        console.log('Intentando redirigir a /dashboard')
        
        // Opción 1: Usar window.location (más confiable en producción)
        window.location.href = '/dashboard'
        
        // Opción 2: Si la anterior no funciona, descomentar estas:
        // router.refresh()
        // await new Promise(resolve => setTimeout(resolve, 500))
        // router.push('/dashboard')
      } else {
        console.log('❌ No hay sesión en la respuesta')
        setError('No se pudo crear la sesión')
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error)
      setDebugInfo(prev => ({ ...prev, error }))
      
      if (error.message?.includes('Invalid login credentials')) {
        setError('Credenciales inválidas. Verifica tu email y contraseña.')
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Debes confirmar tu email antes de iniciar sesión.')
      } else {
        setError(error.message || 'Ha ocurrido un error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="mt-2 text-gray-600">PetGuard</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center">
          <Link href="/auth/signup" className="text-sm text-blue-600 hover:text-blue-500">
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>

        {/* DEBUG INFO */}
        {debugInfo && (
          <details className="mt-4 p-4 bg-gray-100 rounded text-xs">
            <summary className="cursor-pointer font-medium">Debug Info (click para expandir)</summary>
            <pre className="mt-2 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          </details>
        )}
      </div>
    </div>
  )
}