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

  // Don't show prompt if:
  // 1. App is already installed
  // 2. Not installable and user has no interest in notifications
  // 3. User manually dismissed the prompt
  if (isInstalled || !isVisible || (!isInstallable && permission !== 'default' && !hasInteracted)) {
    return null;
  }

  // If app is installed, only show notification test option
  if (isInstalled && permission === 'granted') {
    return (
      <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-green-800">App Instalado!</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={sendTestNotification} 
            variant="outline" 
            className="w-full" 
            size="sm"
          >
            <Bell className="h-4 w-4 mr-2" />
            Testar Notificação
          </Button>
        </CardContent>
      </Card>
    );
  }

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