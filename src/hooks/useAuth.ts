import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          // Create or update user profile
          const { error } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: session.user.id,
              email: session.user.email,
              display_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              avatar_url: session.user.user_metadata?.avatar_url,
            });

          if (error) {
            console.error('Error creating user profile:', error);
          }

          toast({
            title: "✅ Login realizado com sucesso",
            description: "Bem-vindo ao BH Ônibus!",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast({
        title: "Erro no login",
        description: "Não foi possível fazer login com Google. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };
};