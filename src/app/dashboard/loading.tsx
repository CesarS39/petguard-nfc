// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🐕</span>
          </div>
        </div>
        <p className="mt-6 text-slate-700 font-medium">Verificando acceso...</p>
      </div>
    </div>
  )
}