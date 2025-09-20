import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface BusLine {
  url: string;
  linha: string;
  horarios: string[];
}

interface Favorite {
  id: string;
  bus_line_number: string;
  bus_line_name: string;
  bus_line_url: string;
  created_at: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (busLine: BusLine) => {
    return favorites.some(fav => fav.bus_line_url === busLine.url);
  };

  const toggleFavorite = async (busLine: BusLine) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar linhas favoritas.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorite(busLine)) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('bus_line_url', busLine.url);

        if (error) throw error;

        setFavorites(prev => prev.filter(fav => fav.bus_line_url !== busLine.url));
        toast({
          title: "Removido dos favoritos",
          description: `Linha ${busLine.linha} removida dos favoritos.`,
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            bus_line_number: busLine.linha.split(' ')[0],
            bus_line_name: busLine.linha,
            bus_line_url: busLine.url,
          });

        if (error) throw error;

        await loadFavorites();
        toast({
          title: "Adicionado aos favoritos",
          description: `Linha ${busLine.linha} salva nos favoritos.`,
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar favorito.",
        variant: "destructive",
      });
    }
  };

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    loadFavorites,
  };
};