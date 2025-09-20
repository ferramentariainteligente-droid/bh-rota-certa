import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface Rating {
  id: string;
  user_id: string;
  bus_line_number: string;
  bus_line_url: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface BusLineRatingStats {
  average_rating: number;
  total_ratings: number;
  ratings_distribution: { [key: number]: number };
}

export const useRatings = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadRatingsForLine = async (busLineUrl: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('bus_line_url', busLineUrl)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRatings(data || []);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingStats = async (busLineUrl: string): Promise<BusLineRatingStats> => {
    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .select('rating')
        .eq('bus_line_url', busLineUrl);

      if (error) throw error;

      const ratingsData = data || [];
      const totalRatings = ratingsData.length;
      
      if (totalRatings === 0) {
        return {
          average_rating: 0,
          total_ratings: 0,
          ratings_distribution: {},
        };
      }

      const sum = ratingsData.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = sum / totalRatings;

      const distribution: { [key: number]: number } = {};
      for (let i = 1; i <= 5; i++) {
        distribution[i] = ratingsData.filter(r => r.rating === i).length;
      }

      return {
        average_rating: averageRating,
        total_ratings: totalRatings,
        ratings_distribution: distribution,
      };
    } catch (error) {
      console.error('Error getting rating stats:', error);
      return {
        average_rating: 0,
        total_ratings: 0,
        ratings_distribution: {},
      };
    }
  };

  const getUserRating = async (busLineUrl: string): Promise<Rating | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('user_id', user.id)
        .eq('bus_line_url', busLineUrl)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting user rating:', error);
      return null;
    }
  };

  const submitRating = async (
    busLineUrl: string, 
    busLineNumber: string, 
    rating: number, 
    comment?: string
  ) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para avaliar linhas de ônibus.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_ratings')
        .upsert({
          user_id: user.id,
          bus_line_url: busLineUrl,
          bus_line_number: busLineNumber,
          rating,
          comment: comment || null,
        });

      if (error) throw error;

      toast({
        title: "Avaliação enviada",
        description: "Obrigado por avaliar esta linha!",
      });

      // Reload ratings for the line
      await loadRatingsForLine(busLineUrl);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua avaliação.",
        variant: "destructive",
      });
    }
  };

  return {
    ratings,
    loading,
    loadRatingsForLine,
    getRatingStats,
    getUserRating,
    submitRating,
  };
};