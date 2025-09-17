import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Notificações não suportadas",
        description: "Seu navegador não suporta notificações push.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Notificações habilitadas!",
          description: "Você receberá atualizações sobre horários de ônibus."
        });
        
        // Register for push notifications
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          
          // Subscribe to push notifications
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: null // You would need to add your VAPID key here
          });
          
          console.log('Push subscription:', subscription);
        }
        
        return true;
      } else {
        toast({
          title: "Notificações negadas",
          description: "Você pode habilitar notificações nas configurações do navegador.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Erro ao solicitar permissão",
        description: "Não foi possível solicitar permissão para notificações.",
        variant: "destructive"
      });
      return false;
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('BH Ônibus', {
        body: 'Notificações habilitadas com sucesso!',
        icon: '/favicon.png',
        badge: '/favicon.png'
      });
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    sendTestNotification
  };
};