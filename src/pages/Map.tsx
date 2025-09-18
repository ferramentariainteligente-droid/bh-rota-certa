import { useState, useEffect } from 'react';
import { MapPin, Navigation, Bus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BusMap } from '@/components/BusMap';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useIntegratedBusData } from '@/hooks/useIntegratedBusData';
import { useAnalytics } from '@/hooks/useAnalytics';

const Map = () => {
  const { busLines, loading } = useIntegratedBusData();
  const { position, error: geoError, getCurrentPosition } = useGeolocation();
  const analytics = useAnalytics();
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    analytics.trackPageView('Interactive Map');
  }, [analytics]);

  const handleLocationRequest = () => {
    getCurrentPosition();
    analytics.trackEvent('location_request', { source: 'Map Page' });
  };

  const filteredBusLines = busLines.filter(line =>
    line.linha.toLowerCase().includes(searchQuery.toLowerCase()) ||
    line.linha.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLineSelect = (lineNumber: string) => {
    setSelectedLine(lineNumber === selectedLine ? null : lineNumber);
    analytics.trackEvent('bus_line_selection', { line: lineNumber, source: 'Map' });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-gradient-primary shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Mapa Interativo</h1>
                <p className="text-white/90 text-sm">Visualize rotas e pontos de parada</p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={handleLocationRequest}
              className="text-white hover:bg-white/20 flex items-center gap-2"
              disabled={!navigator.geolocation}
            >
              <Navigation className="h-4 w-4" />
              Minha Localização
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Bus Lines */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Buscar Linhas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Digite o número ou nome da linha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Carregando linhas...</p>
                  ) : (
                    filteredBusLines.slice(0, 20).map((line) => (
                      <Button
                        key={line.linha}
                        variant={selectedLine === line.linha ? "default" : "outline"}
                        className="w-full justify-start text-left p-3 h-auto"
                        onClick={() => handleLineSelect(line.linha)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-primary/10 rounded">
                            <Bus className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{line.linha}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {line.linha.includes(' ') ? line.linha.split(' ').slice(1).join(' ') : 'Sem descrição'}
                            </p>
                          </div>
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Sua Localização:</span>
                </div>
                {position ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Lat: {position.latitude.toFixed(4)}, 
                    Lng: {position.longitude.toFixed(4)}
                  </p>
                ) : geoError ? (
                  <p className="text-xs text-destructive mt-1">
                    Erro ao obter localização
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Clique em "Minha Localização" para ver sua posição
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                <BusMap
                  busLines={filteredBusLines}
                  selectedLine={selectedLine}
                  userLocation={position}
                  className="w-full h-full rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Clique nas linhas para ver no mapa</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                <span>Use "Minha Localização" para se localizar</span>
              </div>
              <div className="flex items-center gap-2">
                <Bus className="h-4 w-4 text-primary" />
                <span>Zoom no mapa para ver detalhes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Map;