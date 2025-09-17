// Google Analytics tracking hook
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const useAnalytics = () => {
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      console.log('Tracking event:', eventName, parameters);
      window.gtag('event', eventName, {
        event_category: 'Admin Panel',
        ...parameters,
      });
    } else {
      console.warn('Google Analytics not available');
    }
  };

  const trackPageView = (pageName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      console.log('Tracking page view:', pageName);
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
      });
    } else {
      console.warn('Google Analytics not available for page view');
    }
  };

  return {
    trackEvent,
    trackPageView,
    // Admin Panel specific tracking methods
    trackLogin: () => trackEvent('admin_login'),
    trackLogout: () => trackEvent('admin_logout'),
    trackDataExport: (lineCount: number) => trackEvent('data_export', { line_count: lineCount }),
    trackDataImport: (lineCount: number) => trackEvent('data_import', { line_count: lineCount }),
    trackScrapingStart: () => trackEvent('scraping_start'),
    trackScrapingComplete: (lineCount: number) => trackEvent('scraping_complete', { line_count: lineCount }),
    trackScrapingError: (error: string) => trackEvent('scraping_error', { error_message: error }),
  };
};