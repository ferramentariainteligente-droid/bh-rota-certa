// Service for location-based operations using free APIs

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Address {
  display_name: string;
  city?: string;
  state?: string;
  road?: string;
  neighbourhood?: string;
}

interface BusStop {
  name: string;
  lat: number;
  lon: number;
  distance: number;
}

// Calculate distance between two points using Haversine formula
export const calculateDistance = (pos1: Coordinates, pos2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(pos2.latitude - pos1.latitude);
  const dLon = toRadians(pos2.longitude - pos1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(pos1.latitude)) * Math.cos(toRadians(pos2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Get address from coordinates using Nominatim API (free)
export const reverseGeocode = async (coordinates: Coordinates): Promise<Address | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.latitude}&lon=${coordinates.longitude}&format=json&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BH-Onibus/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    
    const data = await response.json();
    
    return {
      display_name: data.display_name || 'Endereço não encontrado',
      city: data.address?.city || data.address?.town || data.address?.village,
      state: data.address?.state,
      road: data.address?.road,
      neighbourhood: data.address?.neighbourhood || data.address?.suburb
    };
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
};

// Get nearby bus stops using Overpass API (OpenStreetMap data)
export const getNearbyBusStops = async (coordinates: Coordinates, radiusKm: number = 2): Promise<BusStop[]> => {
  try {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["highway"="bus_stop"](around:${radiusKm * 1000},${coordinates.latitude},${coordinates.longitude});
        node["public_transport"="stop_position"](around:${radiusKm * 1000},${coordinates.latitude},${coordinates.longitude});
      );
      out body;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch bus stops');
    }
    
    const data = await response.json();
    
    const busStops: BusStop[] = data.elements
      .filter((element: any) => element.tags?.name)
      .map((element: any) => ({
        name: element.tags.name,
        lat: element.lat,
        lon: element.lon,
        distance: calculateDistance(coordinates, { latitude: element.lat, longitude: element.lon })
      }))
      .sort((a: BusStop, b: BusStop) => a.distance - b.distance)
      .slice(0, 10); // Top 10 closest stops
    
    return busStops;
  } catch (error) {
    console.error('Error fetching bus stops:', error);
    return [];
  }
};

// Find bus lines that serve nearby areas based on route names and destinations
export const findNearbyBusLines = (
  userLocation: Coordinates,
  address: Address | null,
  busLines: any[]
): any[] => {
  if (!address || !busLines.length) return [];
  
  const locationKeywords = [
    address.neighbourhood,
    address.road,
    address.city,
    'Belo Horizonte',
    'BH',
    'Centro'
  ].filter(Boolean).map(keyword => keyword?.toLowerCase());
  
  // Score bus lines based on how well they match the user's location
  const scoredLines = busLines.map(line => {
    let score = 0;
    const lineText = `${line.linha} ${line.route_description || ''}`.toLowerCase();
    
    // Check if any location keywords appear in the bus line name/route
    locationKeywords.forEach(keyword => {
      if (keyword && lineText.includes(keyword)) {
        score += keyword === 'centro' ? 3 : 5; // Centro is very common, lower score
      }
    });
    
    // Boost score for lines that mention common destinations
    const commonDestinations = ['terminal', 'centro', 'hospital', 'shopping', 'estação'];
    commonDestinations.forEach(dest => {
      if (lineText.includes(dest)) {
        score += 2;
      }
    });
    
    return { ...line, relevanceScore: score };
  })
  .filter(line => line.relevanceScore > 0)
  .sort((a, b) => b.relevanceScore - a.relevanceScore)
  .slice(0, 8); // Top 8 most relevant lines
  
  return scoredLines;
};