"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import LogoutButton from "@/components/auth/LogoutButton";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [reportsCount, setReportsCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Timeout de seguridad de 5 segundos
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Timeout: redirigiendo al login');
        setLoading(false);
        router.push("/auth/login");
      }
    }, 5000);

    const getUser = async () => {
      try {
        // Usar getSession en lugar de getUser para consistencia con middleware
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || !session.user) {
          console.log("No hay sesión, redirigiendo...");
          router.push("/auth/login");
          return;
        }

        const user = session.user;
        setUser(user);

        // Cargar perfil
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setProfile(profileData);

        // Cargar mascotas
        const { data: petsData } = await supabase
          .from("pets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setPets(petsData || []);

        // Contar reportes
        if (petsData && petsData.length > 0) {
          const { count } = await supabase
            .from("found_reports")
            .select("*", { count: "exact", head: true })
            .in(
              "pet_id",
              petsData.map((p) => p.id)
            );

          setReportsCount(count || 0);
        }
      } catch (error) {
        console.error("Error en dashboard:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/auth/login");
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [supabase, router, loading]);

  const handleEditPet = (petId: string) => {
    router.push(`/dashboard/pets/${petId}`);
  };

  const handleViewPublicPage = (shortId: string) => {
    window.open(`/pet/${shortId}`, "_blank");
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🐕</span>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">
            Cargando tu información...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  const petsCount = pets.length;
  const maxPets = profile?.max_pets || 3;
  const availableSlots = maxPets - petsCount;
  const activePets = pets.filter((pet) => pet.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-64`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl grayscale brightness-0 invert">
                    🐾
                  </span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  PetGuard
                </span>
              </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            <a
              href="#"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
            >
              <span className="text-xl">📊</span>
              <span>Dashboard</span>
            </a>
            <a
              href="#pets"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl">🐕</span>
              <span>Mis Mascotas</span>
            </a>
            <Link
              href="/dashboard/reports"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">📍</span>
                <span>Reportes</span>
              </div>
              {reportsCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {reportsCount}
                </span>
              )}
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl">⚙️</span>
              <span>Configuración</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Mobile Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-gray-700 hover:text-gray-900 p-2 -ml-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div className="flex-1 lg:flex-none">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  Hola, {profile?.full_name?.split(" ")[0] || "Usuario"}!
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                  Gestiona la información de tus mascotas
                </p>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-blue-50 rounded-lg">
                  <span className="text-xs sm:text-sm font-medium text-blue-600">
                    {petsCount}/{maxPets}
                  </span>
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Stats Cards - Mobile Optimized */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-0">
                  <span className="text-xl grayscale brightness-0 invert">
                    🐾
                  </span>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full self-start sm:self-auto">
                  Total
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                Mascotas
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {petsCount}
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-0">
                  <span className="text-xl sm:text-2xl grayscale brightness-0 invert">
                    ✓
                  </span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full self-start sm:self-auto">
                  Activos
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                Chips
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {activePets}
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-0">
                  <span className="text-xl sm:text-2xl grayscale brightness-0 invert">
                    +
                  </span>
                </div>
                <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full self-start sm:self-auto">
                  Libres
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                Espacios
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {availableSlots}
              </p>
            </div>

            <Link
              href="/dashboard/reports"
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-2 sm:mb-0">
                  <span className="text-xl sm:text-2xl">📍</span>
                </div>
                {reportsCount > 0 ? (
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full self-start sm:self-auto">
                    Nuevos
                  </span>
                ) : (
                  <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full self-start sm:self-auto">
                    Sin reportes
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                Reportes
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {reportsCount}
              </p>
            </Link>
          </div>

          {/* Quick Actions - Mobile Optimized */}
          <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-8 text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
              ¿Listo para proteger otra mascota?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 mb-4 sm:mb-6">
              Agrega una nueva mascota y genera su chip NFC
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => router.push("/dashboard/pets/add")}
                className="w-full sm:w-auto bg-white text-blue-600 px-5 sm:px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-md text-sm sm:text-base"
              >
                + Agregar Mascota
              </button>
              <Link
                href="/dashboard/reports"
                className="w-full sm:w-auto bg-white/20 backdrop-blur-sm text-white px-5 sm:px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/20 text-center text-sm sm:text-base"
              >
                Ver Reportes
              </Link>
            </div>
          </div>

          {/* Pets Grid - Mobile Optimized */}
          <div
            id="pets"
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Mis Mascotas
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Gestiona la información de tus compañeros
              </p>
            </div>

            {pets && pets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center ring-2 ring-white shadow-md">
                        {pet.photo_url ? (
                          <img
                            src={pet.photo_url}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl sm:text-3xl">🐕</span>
                        )}
                      </div>
                      <span
                        className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                          pet.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {pet.is_active ? "● Activo" : "○ Inactivo"}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 truncate">
                      {pet.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 truncate">
                      {pet.breed || "Sin raza especificada"}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 mb-3">
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <span className="text-xs text-gray-400">ID:</span>
                        <code className="text-xs font-mono bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-blue-600 font-semibold truncate max-w-[100px]">
                          {pet.short_id}
                        </code>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPet(pet.id)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs sm:text-sm font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleViewPublicPage(pet.short_id)}
                        className="flex-1 bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 sm:px-6 py-12 sm:py-16 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl sm:text-4xl">🐾</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  No tienes mascotas registradas
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-sm mx-auto px-4">
                  Comienza agregando tu primera mascota para protegerla con
                  tecnología NFC
                </p>
                <button
                  onClick={() => router.push("/dashboard/pets/add")}
                  className="bg-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md text-sm sm:text-base"
                >
                  + Agregar Primera Mascota
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
