import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // ⏸️ VERIFICAR SI LA APP ESTÁ PAUSADA (PRIMERO)
  const isPaused = process.env.APP_PAUSED === 'true'
  
  if (isPaused) {
    return new NextResponse(
      'Sitio en mantenimiento. Volveremos pronto.',
      {
        status: 503,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        }
      }
    )
  }

  // 🔐 TU LÓGICA ORIGINAL DE SUPABASE
  let res = NextResponse.next()
  
  // Crear el cliente de Supabase para middleware
  const supabase = createMiddlewareClient({ req, res })

  // CRÍTICO: Refrescar la sesión
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('=== MIDDLEWARE ===')
  console.log('Path:', req.nextUrl.pathname)
  console.log('Session exists:', !!session)
  console.log('User:', session?.user?.email)

  // Si NO hay sesión y está intentando acceder al dashboard
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('❌ No session, redirecting to login')
    const redirectUrl = new URL('/auth/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Si HAY sesión y está en login/signup
  if (session && (req.nextUrl.pathname === '/auth/login' || req.nextUrl.pathname === '/auth/signup')) {
    console.log('✅ Has session, redirecting to dashboard')
    const redirectUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  console.log('✅ Allowing request to:', req.nextUrl.pathname)
  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',
    '/auth/signup',
  ],
}