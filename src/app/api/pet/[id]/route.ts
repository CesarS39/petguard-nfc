// src/app/api/pet/[id]/route.ts
// IMPORTANTE: Este archivo debe estar en src/app/api/pet/[id]/route.ts
// NO en src/app/pet/[id]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // 1. Obtener mascota activa
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('short_id', params.id)
      .eq('is_active', true)
      .single()

    if (petError || !pet) {
      return NextResponse.json(
        { error: 'Mascota no encontrada' },
        { status: 404 }
      )
    }

    // 2. Obtener perfil del dueño
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, email')
      .eq('user_id', pet.user_id)
      .single()

    // 3. Construir respuesta con SOLO datos públicos
    const publicData = {
      // Info de la mascota
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      medical_conditions: pet.medical_conditions,
      photo_url: pet.photo_url,
      reward: pet.reward,
      
      // Info del dueño (SOLO contacto)
      owner: {
        full_name: profile?.full_name || 'Dueño',
        phone: profile?.phone || null,
        email: profile?.email || null
      }
    }

    // 4. Headers de cache para mejor performance
    return NextResponse.json(publicData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })

  } catch (error) {
    console.error('Error en API:', error)
    return NextResponse.json(
      { error: 'Error al cargar información' },
      { status: 500 }
    )
  }
}

// Exportar configuración
export const runtime = 'edge' // Opcional: usar Edge Runtime para mejor performance