import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para usar en componentes del frontend
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript (los definiremos cuando creemos las tablas)
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