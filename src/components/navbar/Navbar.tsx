'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  Shield, 
  Home, 
  PlusCircle, 
  Users, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Heart,
  User
} from 'lucide-react';
import LogoutButton from '../auth/LogoutButton';

interface NavbarUser {
  id: string;
  email: string;
  role?: 'admin' | 'user';
  name?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<NavbarUser | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true

    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, max_pets')
            .eq('user_id', session.user.id)
            .single()

          const isAdmin = profile?.max_pets && profile.max_pets > 10

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: isAdmin ? 'admin' : 'user',
            name: profile?.full_name || ''
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error getting user:', error)
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    getUser()

    // Listener de auth - SOLO actualizar, NO redirigir
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Navbar auth event:', event)

        // Solo actualizar estado, sin redireccionamientos
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, max_pets')
            .eq('user_id', session.user.id)
            .single()

          const isAdmin = profile?.max_pets && profile.max_pets > 10

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: isAdmin ? 'admin' : 'user',
            name: profile?.full_name || ''
          })
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMenuOpen(false)
  }

  // Si está cargando o no hay usuario, no mostrar
  if (loading || !user) return null

  const isActive = (path: string) => pathname === path

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Mis Mascotas', href: '/dashboard/pets', icon: Heart },
    { name: 'Agregar Mascota', href: '/dashboard/pets/add', icon: PlusCircle },
    { name: 'Perfil', href: '/dashboard/profile', icon: User },
  ]

  const adminNavigation = [
    { name: 'Dashboard Admin', href: '/dashboard', icon: Home },
    { name: 'Usuarios', href: '/dashboard/users', icon: Users },
    { name: 'Todas las Mascotas', href: '/dashboard/pets', icon: Heart },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
  ]

  const navigation = user.role === 'admin' ? adminNavigation : userNavigation

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation('/dashboard')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">PetGuard</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              )
            })}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm">
              <p className="text-gray-900 font-medium">
                {user.name || user.email}
              </p>
              {user.role === 'admin' && (
                <p className="text-blue-600 text-xs font-semibold">ADMIN</p>
              )}
            </div>
            <LogoutButton />
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <div className="px-3 py-2 border-b border-gray-200 mb-2">
                <p className="text-gray-900 font-medium text-sm">
                  {user.name || user.email}
                </p>
                {user.role === 'admin' && (
                  <p className="text-blue-600 text-xs font-semibold">ADMINISTRADOR</p>
                )}
              </div>

              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                )
              })}

              <div className="pt-2">
                <LogoutButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}