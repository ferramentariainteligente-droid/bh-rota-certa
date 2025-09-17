import { useEffect, useRef } from 'react';
import { useAdSense } from '@/hooks/useAdSense';

interface AdSpaceProps {
  position: "top" | "between" | "bottom";
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdSpace = ({ position }: AdSpaceProps) => {
  const { isEnabled, publisherId } = useAdSense();
  const adRef = useRef<HTMLModElement>(null);
  const getAdConfig = () => {
    switch (position) {
      case "top":
        return {
          height: "h-24",
          text: "Publicidade - Banner Superior"
        };
      case "between":
        return {
          height: "h-32",
          text: "Publicidade - Banner Interstitial"
        };
      case "bottom":
        return {
          height: "h-28",
          text: "Publicidade - Banner Inferior"
        };
      default:
        return {
          height: "h-24",
          text: "Publicidade"
        };
    }
  };

  const config = getAdConfig();

  // Initialize Google AdSense ad
  useEffect(() => {
    if (isEnabled && adRef.current && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [isEnabled]);

  const getAdSlot = () => {
    switch (position) {
      case "top": return "1234567890";
      case "between": return "1234567891";
      case "bottom": return "1234567892";
      default: return "1234567890";
    }
  };

  return (
    <div className={`${config.height} my-6`}>
      {isEnabled ? (
        <ins 
          ref={adRef}
          className="adsbygoogle block"
          style={{ display: 'block' }}
          data-ad-client={publisherId}
          data-ad-slot={getAdSlot()}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="bg-gradient-secondary border border-border rounded-lg flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">PUBLICIDADE</div>
            <div className="text-sm font-medium text-muted-foreground">
              Google AdSense
            </div>
            <div className="text-xs text-muted-foreground opacity-50">
              {config.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};