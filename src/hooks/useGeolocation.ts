import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Position {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  position: Position | null;
  loading: boolean;
  error: string | null;
  supported: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    loading: false,
    error: null,
    supported: 'geolocation' in navigator
  });
  const { toast } = useToast();

  const getCurrentPosition = () => {
    if (!state.supported) {
      setState(prev => ({ ...prev, error: 'Geolocalização não suportada pelo navegador' }));
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização.",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState(prev => ({
          ...prev,
          position: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          },
          loading: false,
          error: null
        }));
        
        toast({
          title: "Localização encontrada!",
          description: "Buscando linhas de ônibus próximas..."
        });
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada. Habilite nas configurações do navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível no momento.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo limite para obter localização excedido.';
            break;
        }
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
        
        toast({
          title: "Erro de localização",
          description: errorMessage,
          variant: "destructive"
        });
      },
      options
    );
  };

  return {
    ...state,
    getCurrentPosition
  };
};