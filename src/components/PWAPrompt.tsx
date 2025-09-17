import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, Bell, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useNotifications } from '@/hooks/useNotifications';

export const PWAPrompt = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { isInstallable, isInstalled, installApp } = usePWA();
  const { permission, isSupported, requestPermission, sendTestNotification } = useNotifications();

  // Don't show if app is already installed, or if user dismissed notifications
  if (isInstalled || (!isInstallable && permission !== 'default') || !isVisible) {
    return null;
  }

  // Only show notification options after user shows interest in PWA
  const handleInstallClick = async () => {
    setHasInteracted(true);
    await installApp();
  };

  const handleNotificationClick = async () => {
    setHasInteracted(true);
    await requestPermission();
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Instalar App
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Tenha acesso rápido aos horários de ônibus direto na tela inicial
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            📱 Acesso offline
          </Badge>
          <Badge variant="secondary" className="text-xs">
            🔔 Notificações
          </Badge>
          <Badge variant="secondary" className="text-xs">
            ⚡ Carregamento rápido
          </Badge>
        </div>

        <div className="space-y-2">
          {isInstallable && (
            <Button onClick={handleInstallClick} className="w-full" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Instalar App
            </Button>
          )}
          
          {hasInteracted && isSupported && permission === 'default' && (
            <Button 
              onClick={handleNotificationClick} 
              variant="outline" 
              className="w-full" 
              size="sm"
            >
              <Bell className="h-4 w-4 mr-2" />
              Ativar Notificações (Opcional)
            </Button>
          )}

          {permission === 'granted' && (
            <Button 
              onClick={sendTestNotification} 
              variant="outline" 
              className="w-full" 
              size="sm"
            >
              <Bell className="h-4 w-4 mr-2" />
              Testar Notificação
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};