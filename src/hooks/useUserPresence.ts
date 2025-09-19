import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserPresence {
  user_id: string;
  online_at: string;
  page: string;
  user_agent?: string;
}

export const useUserPresence = (currentPage: string = 'unknown') => {
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [presenceState, setPresenceState] = useState<Record<string, UserPresence[]>>({});

  useEffect(() => {
    // Generate a unique user ID for this session
    const getUserId = () => {
      let userId = sessionStorage.getItem('temp_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('temp_user_id', userId);
      }
      return userId;
    };

    const userId = getUserId();
    
    // Create presence channel
    const channel = supabase.channel('user_presence', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    // Listen to presence changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, UserPresence[]>;
        setPresenceState(state);
        
        // Count total online users
        const totalUsers = Object.keys(state).length;
        setOnlineUsers(totalUsers);
        
        console.log('Online users updated:', totalUsers);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          const userPresence: UserPresence = {
            user_id: userId,
            online_at: new Date().toISOString(),
            page: currentPage,
            user_agent: navigator.userAgent.substring(0, 100), // Truncate for performance
          };

          await channel.track(userPresence);
          console.log('User presence tracked:', userPresence);
        }
      });

    // Cleanup on unmount
    return () => {
      channel.unsubscribe();
    };
  }, [currentPage]);

  // Update presence when page changes
  useEffect(() => {
    const userId = sessionStorage.getItem('temp_user_id');
    if (!userId) return;

    const channel = supabase.channel('user_presence');
    
    // Update presence with new page
    const userPresence: UserPresence = {
      user_id: userId,
      online_at: new Date().toISOString(),
      page: currentPage,
      user_agent: navigator.userAgent.substring(0, 100),
    };

    channel.track(userPresence);
  }, [currentPage]);

  return {
    onlineUsers,
    presenceState,
  };
};