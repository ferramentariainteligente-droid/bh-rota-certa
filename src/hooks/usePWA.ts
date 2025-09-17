import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkIfInstalled = () => {
      // Check if app is running in standalone mode (installed PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInWebAppChrome = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      return isStandalone || isInWebAppiOS || isInWebAppChrome;
    };

    setIsInstalled(checkIfInstalled());

    // Listen for beforeinstallprompt event only if not already installed
    const handleBeforeInstallPrompt = (e: Event) => {
      if (checkIfInstalled()) {
        return; // Don't show prompt if already installed
      }
      
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      // Save installation state to localStorage
      localStorage.setItem('pwa-installed', 'true');
    };

    // Check localStorage for previous installation
    const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
    if (wasInstalled || checkIfInstalled()) {
      setIsInstalled(true);
      setIsInstallable(false);
    } else {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    window.addEventListener('appinstalled', handleAppInstalled);

    // Re-check installation status when window gains focus
    const handleFocus = () => {
      const currentlyInstalled = checkIfInstalled();
      if (currentlyInstalled && !isInstalled) {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        localStorage.setItem('pwa-installed', 'true');
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isInstalled]);

  const installApp = async () => {
    if (!deferredPrompt || isInstalled) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        // Installation will be detected by the appinstalled event
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    installApp
  };
};