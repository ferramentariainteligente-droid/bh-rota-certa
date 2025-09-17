import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Notificações ativadas!",
          description: "Você receberá atualizações sobre horários de ônibus."
        });
        return true;
      } else {
        // Don't show error toast for denied permissions - user choice
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      try {
        new Notification('BH Ônibus', {
          body: 'Notificações habilitadas com sucesso! 🚌',
          icon: '/favicon.png',
          badge: '/favicon.png',
          tag: 'test-notification',
          requireInteraction: false
        });
      } catch (error) {
        console.error('Error sending test notification:', error);
        toast({
          title: "Erro ao enviar notificação",
          description: "Não foi possível enviar a notificação de teste.",
          variant: "destructive"
        });
      }
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    sendTestNotification
  };
};