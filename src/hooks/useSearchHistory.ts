import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SearchHistoryItem {
  id: string;
  search_term: string;
  search_type: string;
  results_count: number;
  created_at: string;
}

export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      // Load anonymous history from localStorage
      const localHistory = localStorage.getItem('searchHistory');
      if (localHistory) {
        try {
          setHistory(JSON.parse(localHistory));
        } catch (error) {
          console.error('Error parsing local search history:', error);
        }
      }
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = async (searchTerm: string, resultsCount: number, searchType: string = 'line_search') => {
    try {
      if (user) {
        // Save to database
        const { error } = await supabase
          .from('search_history')
          .insert({
            user_id: user.id,
            search_term: searchTerm,
            search_type: searchType,
            results_count: resultsCount,
          });

        if (error) throw error;
        await loadHistory();
      } else {
        // Save to localStorage for anonymous users
        const newItem = {
          id: Date.now().toString(),
          search_term: searchTerm,
          search_type: searchType,
          results_count: resultsCount,
          created_at: new Date().toISOString(),
        };

        const updatedHistory = [newItem, ...history.slice(0, 19)];
        setHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

        // Also save anonymously to database for analytics
        await supabase
          .from('search_history')
          .insert({
            user_id: null,
            search_term: searchTerm,
            search_type: searchType,
            results_count: resultsCount,
          });
      }
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      if (user) {
        const { error } = await supabase
          .from('search_history')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        localStorage.removeItem('searchHistory');
      }
      setHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  const getPopularSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('search_term, results_count')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('results_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  };

  return {
    history,
    loading,
    addToHistory,
    clearHistory,
    getPopularSearches,
  };
};