'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface User {
  id: string;
  email: string;
  role?: 'admin' | 'user';
  name?: string;
  phone?: string;
  maxPets?: number;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Obtener información adicional del usuario desde la tabla profiles
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('full_name, phone, email, max_pets')
            .eq('user_id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
          }

          // Determinar si es admin basado en email o max_pets mayor a límite normal
          const isAdmin = profile?.max_pets && profile.max_pets > 10;

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: isAdmin ? 'admin' : 'user',
            name: profile?.full_name || '',
            phone: profile?.phone || '',
            maxPets: profile?.max_pets || 3
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // Obtener información del perfil
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, phone, email, max_pets')
              .eq('user_id', session.user.id)
              .single();

            const isAdmin = profile?.max_pets && profile.max_pets > 10;

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: isAdmin ? 'admin' : 'user',
              name: profile?.full_name || '',
              phone: profile?.phone || '',
              maxPets: profile?.max_pets || 3
            });
          }
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, loading };
}