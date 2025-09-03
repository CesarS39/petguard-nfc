'use client';

import React from 'react';
import { Shield, MapPin, Smartphone, Heart, CheckCircle, ArrowRight, Wifi, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import { useUser } from '@/hooks/useUser';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useUser();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleRegister = () => {
    router.push('/auth/signup');
  };

  const handleDemo = () => {
    // Aquí puedes agregar lógica para mostrar demo
    console.log('Demo clicked');
  };

  const handleHowItWorks = () => {
    // Scroll a la sección de cómo funciona
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-sans">
      {/* Navbar - solo se muestra si hay usuario autenticado */}
      <Navbar user={user} />
      
      {/* Header - solo se muestra si NO hay usuario autenticado */}
      {!user && (
        <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">PetGuard NFC</span>
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={handleHowItWorks}
                  className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                >
                  ¿Cómo funciona?
                </button>
                <button 
                  onClick={handleLogin}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Nunca pierdas a tu 
                <span className="text-blue-600 block">mejor amigo</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Tecnología NFC de vanguardia que conecta instantáneamente a quien encuentre a tu mascota contigo. 
                Sin apps, sin complicaciones, solo un simple toque.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleRegister}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Proteger mi mascota</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleDemo}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all font-semibold text-lg"
                >
                  Ver demo
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-400 to-green-400 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Max</h3>
                      <p className="text-gray-600">Golden Retriever • 3 años</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-800"><strong>Contacto:</strong> Ana García</p>
                    <p className="text-gray-800"><strong>Teléfono:</strong> +52 777 123 4567</p>
                    <p className="text-gray-600 text-sm">Medicamento diario para el corazón</p>
                  </div>
                  <div className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 cursor-pointer">
                    <MapPin className="h-5 w-5" />
                    <span>¡Encontré a Max!</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-full animate-bounce">
                <Wifi className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Cómo funciona PetGuard NFC?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tres simples pasos para proteger a tu mascota con la tecnología más avanzada
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-blue-50 transition-colors">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">1. Registra tu mascota</h3>
              <p className="text-gray-600">
                Crea el perfil de tu mascota con foto, datos médicos y tu información de contacto
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-green-50 transition-colors">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">2. Recibe tu chip NFC</h3>
              <p className="text-gray-600">
                Te enviamos el chip NFC programado listo para colocar en el collar de tu mascota
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-purple-50 transition-colors">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">3. Conexión instantánea</h3>
              <p className="text-gray-600">
                Cualquiera puede tocar el chip con su celular y contactarte inmediatamente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-8">
                Protección 24/7 para tu mascota
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">Sin necesidad de apps</h3>
                    <p className="text-blue-100">Funciona con cualquier smartphone moderno, solo acercando el teléfono</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">Localización automática</h3>
                    <p className="text-blue-100">Recibe la ubicación exacta donde fue encontrada tu mascota</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">Información médica</h3>
                    <p className="text-blue-100">Comparte datos médicos importantes con veterinarios</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">Notificaciones instantáneas</h3>
                    <p className="text-blue-100">Te avisamos por email en el momento que alguien encuentre a tu mascota</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
              <div className="text-center space-y-6">
                <Bell className="h-16 w-16 text-yellow-300 mx-auto" />
                <h3 className="text-2xl font-bold text-white">¡Máxima tranquilidad!</h3>
                <p className="text-blue-100 text-lg">
                  Más del 85% de mascotas con chips NFC son reunidas con sus familias en menos de 2 horas
                </p>
                <div className="bg-white/20 rounded-xl p-4">
                  <p className="text-yellow-200 font-semibold">
                    "Gracias a PetGuard encontraron a Luna en 30 minutos. ¡Increíble!"
                  </p>
                  <p className="text-blue-200 text-sm mt-2">- María José, Pachuca</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Protección accesible para todos</h2>
          <p className="text-xl text-gray-600 mb-12">Un solo pago, protección de por vida</p>
          
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
            <div className="mb-8">
              <div className="text-5xl font-bold text-blue-600 mb-2">$299</div>
              <div className="text-gray-600">MXN • Pago único</div>
            </div>
            
            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Chip NFC programado</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Página web personalizada</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Hasta 3 mascotas</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Notificaciones por email</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Soporte 24/7</span>
              </li>
            </ul>
            
            <button 
              onClick={handleRegister}
              className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
            >
              Comenzar ahora
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">PetGuard NFC</span>
              </div>
              <p className="text-gray-400">
                Tecnología NFC para proteger a las mascotas más queridas de México.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={handleHowItWorks} className="hover:text-white text-left">¿Cómo funciona?</button></li>
                <li><span className="hover:text-white cursor-pointer">Precios</span></li>
                <li><span className="hover:text-white cursor-pointer">FAQ</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><span className="hover:text-white cursor-pointer">Contacto</span></li>
                <li><span className="hover:text-white cursor-pointer">Ayuda</span></li>
                <li><span className="hover:text-white cursor-pointer">Garantía</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><span className="hover:text-white cursor-pointer">Privacidad</span></li>
                <li><span className="hover:text-white cursor-pointer">Términos</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PetGuard NFC. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}