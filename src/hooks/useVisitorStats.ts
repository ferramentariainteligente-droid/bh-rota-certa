import { useState, useEffect } from 'react';

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  averageSessionTime: number;
}

export const useVisitorStats = () => {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    todayVisitors: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    averageSessionTime: 0,
  });

  useEffect(() => {
    trackVisitor();
    loadStats();
    
    // Update stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const trackVisitor = () => {
    const now = new Date();
    const today = now.toDateString();
    const sessionId = sessionStorage.getItem('session_id') || generateSessionId();
    
    // Set session ID if not exists
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', sessionId);
      sessionStorage.setItem('session_start', now.toISOString());
    }

    // Get or initialize visitor data
    const visitorData = JSON.parse(localStorage.getItem('visitor_data') || '{}');
    
    // Track unique visitor (by day)
    if (!visitorData.lastVisit || new Date(visitorData.lastVisit).toDateString() !== today) {
      visitorData.lastVisit = now.toISOString();
      visitorData.visitDays = (visitorData.visitDays || 0) + 1;
    }

    // Track total visitors (sessions)
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    if (!sessions.find((s: any) => s.id === sessionId)) {
      sessions.push({
        id: sessionId,
        start: now.toISOString(),
        pages: 1,
      });
    }

    // Track page views
    const pageViews = JSON.parse(localStorage.getItem('page_views') || '[]');
    pageViews.push({
      timestamp: now.toISOString(),
      page: window.location.pathname,
      sessionId,
    });

    // Keep only last 1000 page views for performance
    if (pageViews.length > 1000) {
      pageViews.splice(0, pageViews.length - 1000);
    }

    // Save to localStorage
    localStorage.setItem('visitor_data', JSON.stringify(visitorData));
    localStorage.setItem('sessions', JSON.stringify(sessions.slice(-100))); // Keep last 100 sessions
    localStorage.setItem('page_views', JSON.stringify(pageViews));
  };

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const loadStats = () => {
    const visitorData = JSON.parse(localStorage.getItem('visitor_data') || '{}');
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    const pageViews = JSON.parse(localStorage.getItem('page_views') || '[]');
    
    const today = new Date().toDateString();
    
    // Calculate today's visitors
    const todayVisitors = sessions.filter((session: any) => 
      new Date(session.start).toDateString() === today
    ).length;

    // Calculate average session time
    const completedSessions = sessions.filter((session: any) => session.end);
    const avgSessionTime = completedSessions.length > 0 
      ? completedSessions.reduce((acc: number, session: any) => {
          const duration = new Date(session.end).getTime() - new Date(session.start).getTime();
          return acc + duration;
        }, 0) / completedSessions.length / 1000 / 60 // Convert to minutes
      : 0;

    setStats({
      totalVisitors: sessions.length,
      todayVisitors,
      uniqueVisitors: visitorData.visitDays || 0,
      pageViews: pageViews.length,
      averageSessionTime: Math.round(avgSessionTime * 100) / 100,
    });
  };

  // Track page view
  const trackPageView = (page: string) => {
    const now = new Date();
    const sessionId = sessionStorage.getItem('session_id');
    
    if (sessionId) {
      const pageViews = JSON.parse(localStorage.getItem('page_views') || '[]');
      pageViews.push({
        timestamp: now.toISOString(),
        page,
        sessionId,
      });
      
      localStorage.setItem('page_views', JSON.stringify(pageViews.slice(-1000)));
      loadStats();
    }
  };

  return {
    stats,
    trackPageView,
    refreshStats: loadStats,
  };
};
