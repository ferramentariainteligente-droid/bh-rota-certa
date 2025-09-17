import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, 
  Navigation, 
  Bus, 
  Clock, 
  Star,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useIntegratedBusData } from '@/hooks/useIntegratedBusData';
import { 
  reverseGeocode, 
  findNearbyBusLines,
  getNearbyBusStops,
  calculateDistance 
} from '@/services/LocationService';

interface Address {
  display_name: string;
  city?: string;
  state?: string;
  road?: string;
  neighbourhood?: string;
}

export const LocationSuggestions = () => {
  const { position, loading: geoLoading, error: geoError, getCurrentPosition, supported } = useGeolocation();
  const { busLines } = useIntegratedBusData();
  
  const [address, setAddress] = useState<Address | null>(null);
  const [nearbyLines, setNearbyLines] = useState<any[]>([]);
  const [busStops, setBusStops] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  // Process location data when position changes
  useEffect(() => {
    if (position && busLines.length > 0) {
      processLocationData();
    }
  }, [position, busLines]);

  const processLocationData = async () => {
    if (!position) return;
    
    setProcessing(true);
    try {
      // Get address information
      const addressData = await reverseGeocode(position);
      setAddress(addressData);
      
      // Find nearby bus lines based on location
      const relevantLines = findNearbyBusLines(position, addressData, busLines);
      setNearbyLines(relevantLines);
      
      // Get nearby bus stops
      const stops = await getNearbyBusStops(position, 1.5); // 1.5km radius
      setBusStops(stops.slice(0, 5)); // Top 5 closest stops
      
    } catch (error) {
      console.error('Error processing location data:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (!supported) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="font-medium text-red-700">Geolocalização não suportada</p>
            <p className="text-sm text-red-600">Seu navegador não suporta geolocalização.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Linhas Próximas à Você
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Encontre as melhores opções de transporte na sua região
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Location Detection Button */}
        {!position && (
          <Button 
            onClick={getCurrentPosition} 
            disabled={geoLoading}
            className="w-full"
          >
            {geoLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Detectando localização...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Detectar Minha Localização
              </>
            )}
          </Button>
        )}

        {/* Error Message */}
        {geoError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{geoError}</p>
            </div>
          </div>
        )}

        {/* Current Location */}
        {position && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Localização Atual</p>
                {processing ? (
                  <Skeleton className="h-4 w-full mt-1" />
                ) : address ? (
                  <p className="text-xs text-green-700 mt-1">
                    {address.road && `${address.road}, `}
                    {address.neighbourhood && `${address.neighbourhood}, `}
                    {address.city || 'Belo Horizonte'}
                  </p>
                ) : (
                  <p className="text-xs text-green-700 mt-1">
                    Lat: {position.latitude.toFixed(6)}, Lng: {position.longitude.toFixed(6)}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={getCurrentPosition}
                disabled={geoLoading}
              >
                <RefreshCw className={`h-3 w-3 ${geoLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        )}

        {/* Nearby Bus Lines */}
        {nearbyLines.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bus className="h-4 w-4 text-primary" />
              <h4 className="font-medium">Linhas Recomendadas</h4>
            </div>
            
            <div className="space-y-2">
              {nearbyLines.map((line, index) => (
                <div 
                  key={line.url || index}
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {line.linha?.split(' ')[0] || `Linha ${index + 1}`}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground">
                            Relevância: {line.relevanceScore || 0}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium line-clamp-2">
                        {line.linha || line.route_description || 'Linha de ônibus'}
                      </p>
                      
                      {line.schedule_categories?.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <div className="flex gap-1">
                            {line.schedule_categories.slice(0, 3).map((category: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {category.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Bus Stops */}
        {busStops.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <h4 className="font-medium">Paradas Próximas</h4>
            </div>
            
            <div className="space-y-2">
              {busStops.map((stop, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{stop.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {stop.distance < 1 
                        ? `${Math.round(stop.distance * 1000)}m` 
                        : `${stop.distance.toFixed(1)}km`}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {stop.distance < 0.5 ? 'Muito perto' : 
                     stop.distance < 1 ? 'Perto' : 'Caminhada'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {processing && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Analisando sua localização...</p>
          </div>
        )}

        {/* No Results */}
        {position && !processing && nearbyLines.length === 0 && busStops.length === 0 && (
          <div className="text-center py-6">
            <Bus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Nenhuma linha encontrada</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tente uma localização diferente ou verifique se há linhas cadastradas na região
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};