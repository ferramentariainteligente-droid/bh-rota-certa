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
      toast({
        title: "Notificações não suportadas",
        description: "Seu navegador não suporta notificações.",
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
        description: "Tente habilitar notificações manualmente nas configurações do navegador.",
        variant: "destructive"
      });
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