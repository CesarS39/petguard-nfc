import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Verificar si la app está pausada
  const isPaused = process.env.APP_PAUSED === 'true'
  
  if (isPaused) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Sitio en Mantenimiento</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 { font-size: 2.5rem; margin-bottom: 1rem; }
            p { font-size: 1.2rem; opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔧 Sitio en Mantenimiento</h1>
            <p>Volveremos pronto. Gracias por tu paciencia.</p>
          </div>
        </body>
      </html>`,
      {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Retry-After': '3600' // sugiere reintentar en 1 hora
        }
      }
    )
  }

  // Tu autenticación actual
  const basicAuth = request.headers.get('authorization')
  
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')
    
    if (user === 'admin' && pwd === 'supersecreto') {
      return NextResponse.next()
    }
  }
  
  return new NextResponse('Autenticación requerida', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Área Segura"',
    },
  })
}