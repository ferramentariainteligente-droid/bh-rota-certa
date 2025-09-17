import { useState, useEffect } from 'react';

interface AdSenseConfig {
  isEnabled: boolean;
  publisherId: string;
  adClientId: string;
}

export const useAdSense = () => {
  const [config, setConfig] = useState<AdSenseConfig>({
    isEnabled: false,
    publisherId: 'ca-pub-5627268083247418',
    adClientId: 'ca-pub-5627268083247418'
  });

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('adsense-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error parsing AdSense config:', error);
      }
    }
  }, []);

  const updateConfig = (newConfig: Partial<AdSenseConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('adsense-config', JSON.stringify(updatedConfig));
  };

  const enableAdSense = () => {
    updateConfig({ isEnabled: true });
  };

  const disableAdSense = () => {
    updateConfig({ isEnabled: false });
  };

  const updatePublisherId = (publisherId: string) => {
    updateConfig({ publisherId, adClientId: publisherId });
  };

  // Initialize AdSense ads
  const initializeAds = () => {
    if (typeof window !== 'undefined' && window.adsbygoogle && config.isEnabled) {
      try {
        (window.adsbygoogle as any[]).push({});
      } catch (error) {
        console.error('Error initializing AdSense:', error);
      }
    }
  };

  return {
    config,
    isEnabled: config.isEnabled,
    publisherId: config.publisherId,
    enableAdSense,
    disableAdSense,
    updatePublisherId,
    initializeAds
  };
};