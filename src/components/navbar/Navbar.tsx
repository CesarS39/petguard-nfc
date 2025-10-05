'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Shield, 
  Home, 
  PlusCircle, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Heart,
  User
} from 'lucide-react';
import LogoutButton from '../auth/LogoutButton';

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    role?: 'admin' | 'user';
    name?: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    // Aquí implementarás la lógica de logout con Supabase
    // await supabase.auth.signOut();
    router.push('/');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  // Si no hay usuario, no mostrar navbar
  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  // Navegación para usuarios normales
  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Mis Mascotas', href: '/dashboard/pets', icon: Heart },
    { name: 'Agregar Mascota', href: '/dashboard/pets/add', icon: PlusCircle },
    { name: 'Perfil', href: '/dashboard/profile', icon: User },
  ];

  // Navegación para administradores
  const adminNavigation = [
    { name: 'Dashboard Admin', href: '/dashboard', icon: Home },
    { name: 'Usuarios', href: '/dashboard/users', icon: Users },
    { name: 'Todas las Mascotas', href: '/dashboard/pets', icon: Heart },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
  ];

  const navigation = user.role === 'admin' ? adminNavigation : userNavigation;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation('/dashboard')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LinkPet</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
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
              );
            })}
          </div>

          {/* User Info & Logout */}
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {/* User info on mobile */}
              <div className="px-3 py-2 border-b border-gray-200 mb-2">
                <p className="text-gray-900 font-medium text-sm">
                  {user.name || user.email}
                </p>
                {user.role === 'admin' && (
                  <p className="text-blue-600 text-xs font-semibold">ADMINISTRADOR</p>
                )}
              </div>

              {/* Navigation items */}
              {navigation.map((item) => {
                const Icon = item.icon;
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
                );
              })}

              {/* Logout button on mobile */}
              <LogoutButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
