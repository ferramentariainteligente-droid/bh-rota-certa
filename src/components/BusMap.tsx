import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, divIcon, LatLngBounds } from 'leaflet';
import { Bus, MapPin, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface BusLine {
  linha: string;
  url?: string;
  horarios?: string[];
  schedulesDetailed?: any[];
  lastUpdated?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface BusMapProps {
  busLines: BusLine[];
  selectedLine?: string | null;
  userLocation?: UserLocation | null;
  className?: string;
}

// Coordenadas aproximadas de Belo Horizonte
const BH_CENTER: [number, number] = [-19.9191, -43.9386];

// Simulated bus stops for demonstration (in a real app, this would come from an API)
const simulatedBusStops = [
  { id: 1, name: 'Terminal Rodoviário', lat: -19.9320, lng: -43.9362, lines: ['101', '201', '301'] },
  { id: 2, name: 'Praça da Savassi', lat: -19.9375, lng: -43.9319, lines: ['102', '201', '303'] },
  { id: 3, name: 'Centro - Praça Sete', lat: -19.9167, lng: -43.9345, lines: ['101', '102', '201'] },
  { id: 4, name: 'Pampulha - UFMG', lat: -19.8681, lng: -43.9611, lines: ['301', '303', '401'] },
  { id: 5, name: 'Barreiro', lat: -19.9833, lng: -44.0361, lines: ['401', '501', '601'] },
  { id: 6, name: 'Venda Nova', lat: -19.8111, lng: -43.9642, lines: ['501', '601', '701'] },
];

// Create custom icons
const createBusStopIcon = (isSelected: boolean) => divIcon({
  html: `
    <div style="
      background: ${isSelected ? '#ef4444' : '#3b82f6'};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `,
  className: 'bus-stop-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const createUserLocationIcon = () => divIcon({
  html: `
    <div style="
      background: #10b981;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #10b981, 0 2px 4px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 0 2px #10b981, 0 0 0 4px rgba(16, 185, 129, 0.3); }
        70% { box-shadow: 0 0 0 2px #10b981, 0 0 0 12px rgba(16, 185, 129, 0); }
        100% { box-shadow: 0 0 0 2px #10b981, 0 0 0 4px rgba(16, 185, 129, 0); }
      }
    </style>
  `,
  className: 'user-location-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Component to handle map updates
function MapController({ selectedLine, userLocation }: { selectedLine?: string | null, userLocation?: UserLocation | null }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 15);
    } else if (selectedLine) {
      // Find stops for the selected line and fit bounds
      const lineStops = simulatedBusStops.filter(stop => 
        stop.lines.includes(selectedLine)
      );
      
      if (lineStops.length > 0) {
        const bounds = new LatLngBounds(
          lineStops.map(stop => [stop.lat, stop.lng])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, selectedLine, userLocation]);

  return null;
}

export const BusMap: React.FC<BusMapProps> = ({
  busLines,
  selectedLine,
  userLocation,
  className
}) => {
  const mapRef = useRef<any>(null);

  // Filter bus stops based on selected line
  const visibleStops = selectedLine 
    ? simulatedBusStops.filter(stop => stop.lines.includes(selectedLine))
    : simulatedBusStops;

  return (
    <div className={className}>
      <MapContainer
        center={BH_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController selectedLine={selectedLine} userLocation={userLocation} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createUserLocationIcon()}
          >
            <Popup>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Navigation className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Sua Localização</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Precisão: ~{userLocation.accuracy || 0}m
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Bus stop markers */}
        {visibleStops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={createBusStopIcon(selectedLine ? stop.lines.includes(selectedLine) : false)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <Bus className="h-4 w-4 text-primary" />
                  <span className="font-medium">{stop.name}</span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Linhas que passam aqui:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {stop.lines.map((line) => (
                        <span
                          key={line}
                          className={`px-2 py-1 text-xs rounded ${
                            selectedLine === line
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {userLocation && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        📍 Distância aproximada: {
                          Math.round(
                            Math.sqrt(
                              Math.pow((stop.lat - userLocation.latitude) * 111000, 2) +
                              Math.pow((stop.lng - userLocation.longitude) * 111000, 2)
                            )
                          )
                        }m
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};