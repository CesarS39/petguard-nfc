import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Cliente para componentes del frontend con persistencia de sesión
export const supabase = createClientComponentClient<Database>({
  options: {
    auth: {
      persistSession: true,
      storageKey: 'petguard-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
})

// Tipos para TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          phone: string | null
          email: string
          max_pets: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          phone?: string | null
          email: string
          max_pets?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          phone?: string | null
          email?: string
          max_pets?: number
          created_at?: string
          updated_at?: string
        }
      }
      pets: {
        Row: {
          id: string
          short_id: string
          user_id: string
          name: string
          breed: string | null
          age: string | null
          medical_conditions: string | null
          photo_url: string | null
          reward: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          short_id: string
          user_id: string
          name: string
          breed?: string | null
          age?: string | null
          medical_conditions?: string | null
          photo_url?: string | null
          reward?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          short_id?: string
          user_id?: string
          name?: string
          breed?: string | null
          age?: string | null
          medical_conditions?: string | null
          photo_url?: string | null
          reward?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      found_reports: {
        Row: {
          id: string
          pet_id: string
          finder_name: string
          finder_phone: string | null
          finder_email: string | null
          location: string | null
          latitude: number | null
          longitude: number | null
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          finder_name: string
          finder_phone?: string | null
          finder_email?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          finder_name?: string
          finder_phone?: string | null
          finder_email?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          message?: string | null
          created_at?: string
        }
      }
    }
  }
}