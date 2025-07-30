import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Navigation, Layers, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getGuidesByCity } from '@/lib/firestore';

/// <reference types="google.maps" />

// Dados das principais cidades de Angola com coordenadas


interface GoogleMapsAngolaProps {
  height?: string;
  showSearch?: boolean;
  showControls?: boolean;
}

const GoogleMapsAngola: React.FC<GoogleMapsAngolaProps> = ({ 
  height = "500px", 
  showSearch = true, 
  showControls = true 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [apiKey, setApiKey] = useState('AIzaSyAOgcbrjuBmK_FBqSfcqQRTkEbSQpijOJo');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [selectedDestination, setSelectedDestination] = useState<typeof angolaDestinations[0] | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
const [angolaDestinations, setAngolaDestinations] = useState<any[]>([]);

  useEffect(() => {
    const fetchDestinations = async () => {
      const data = await getGuidesByCity();
      setAngolaDestinations(data);
    };
    fetchDestinations();
  }, []);

  const initializeMap = useCallback(async () => {
    if (!mapRef.current || !apiKey) return;

    try {
      // Carregar Google Maps API
      const { Loader } = await import('@googlemaps/js-api-loader');
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry', 'drawing']
      });

      await loader.load();

      // Criar mapa
      const googleMap = new google.maps.Map(mapRef.current, {
        center: { lat: -11.2027, lng: 17.8739 }, // Centro de Angola
        zoom: 6,
        mapTypeId: mapType,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      setMap(googleMap);

      // Configurar autocomplete para busca
      if (searchInputRef.current) {
        const autocompleteService = new google.maps.places.Autocomplete(
          searchInputRef.current,
          {
            bounds: new google.maps.LatLngBounds(
              new google.maps.LatLng(-18.0, 11.0), 
              new google.maps.LatLng(-5.0, 24.0)   
            ),
            strictBounds: true,
            componentRestrictions: { country: 'ao' }
          }
        );

        autocompleteService.addListener('place_changed', () => {
          const place = autocompleteService.getPlace();
          if (place.geometry && place.geometry.location) {
            googleMap.setCenter(place.geometry.location);
            googleMap.setZoom(12);
          }
        });

        setAutocomplete(autocompleteService);
      }

      // Adicionar marcadores para destinos
      const newMarkers: google.maps.Marker[] = [];
      
      angolaDestinations.forEach((destination, index) => {
        const marker = new google.maps.Marker({
          position: destination.coordinates,
          map: googleMap,
          title: destination.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="3"/>
                <circle cx="20" cy="20" r="8" fill="white"/>
                <text x="20" y="25" text-anchor="middle" fill="#3b82f6" font-size="12" font-weight="bold">${destination.guides}</text>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          },
          animation: google.maps.Animation.DROP,
        });

        // InfoWindow para cada marcador
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 250px; font-family: system-ui;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${destination.name}</h3>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; line-height: 1.4;">${destination.description}</p>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="color: #059669; font-size: 14px; font-weight: 500;">${destination.guides} guias disponíveis</span>
                <span style="background: #ddd6fe; color: #7c3aed; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${destination.category}</span>
              </div>
              <button onclick="window.viewGuides?.('${destination.name}')" style="margin-top: 8px; width: 100%; background: #3b82f6; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                Ver Guias
              </button>
            </div>
          `
        });

        marker.addListener('click', () => {
          // Fechar outras InfoWindows
          markers.forEach(m => {
            const existingInfoWindow = (m as any).infoWindow;
            if (existingInfoWindow) existingInfoWindow.close();
          });
          
          infoWindow.open(googleMap, marker);
          setSelectedDestination(destination);
          googleMap.setCenter(destination.coordinates);
          googleMap.setZoom(10);
        });

        (marker as any).infoWindow = infoWindow;
        newMarkers.push(marker);
      });

      setMarkers(newMarkers);
      setIsLoaded(true);

      // Função global para ver guias (chamada pelos InfoWindows)
      (window as any).viewGuides = (destinationName: string) => {
        console.log(`Visualizar guias para: ${destinationName}`);
        // Aqui você implementaria a navegação para a página de guias
      };

    } catch (error) {
      console.error('Erro ao carregar Google Maps:', error);
    }
  }, [apiKey, mapType]);

  const handleMapTypeChange = (type: 'roadmap' | 'satellite' | 'hybrid' | 'terrain') => {
    setMapType(type);
    if (map) {
      map.setMapTypeId(type);
    }
  };

  const handleSearch = () => {
    if (!map || !searchQuery) return;
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 
      address: searchQuery + ', Angola',
      region: 'AO'
    }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(12);
        
        // Adicionar marcador temporário
        new google.maps.Marker({
          position: results[0].geometry.location,
          map: map,
          title: searchQuery,
          animation: google.maps.Animation.BOUNCE,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
                <circle cx="15" cy="15" r="4" fill="white"/>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(30, 30)
          }
        });
      }
    });
  };

  const zoomToDestination = (destination: typeof angolaDestinations[0]) => {
    if (map) {
      map.setCenter(destination.coordinates);
      map.setZoom(12);
      setSelectedDestination(destination);
      
      // Destacar marcador
      const marker = markers.find(m => m.getTitle() === destination.name);
      if (marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 2000);
      }
    }
  };

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);


  return (
    <div className="relative w-full">
      {/* Controles superiores */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10 space-y-2">
          {/* Busca */}
          {showSearch && (
            <Card className="w-80">
              <CardContent className="p-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Buscar local em Angola..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} size="sm">
                    <Navigation className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tipos de mapa */}
          <Card>
            <CardContent className="p-2">
              <div className="flex gap-1">
                {[
                  { type: 'roadmap' as const, icon: '🗺️', label: 'Mapa' },
                  { type: 'satellite' as const, icon: '🛰️', label: 'Satélite' },
                  { type: 'hybrid' as const, icon: '🔗', label: 'Híbrido' },
                  { type: 'terrain' as const, icon: '⛰️', label: 'Terreno' }
                ].map(({ type, icon, label }) => (
                  <Button
                    key={type}
                    variant={mapType === type ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleMapTypeChange(type)}
                    className="text-xs"
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de destinos */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10">
          <Card className="w-64 max-h-80 overflow-y-auto">
            <CardContent className="p-3">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Destinos Principais
              </h4>
              <div className="space-y-2">
                {angolaDestinations.map((destination) => (
                  <div
                    key={destination.name}
                    onClick={() => zoomToDestination(destination)}
                    className={`p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                      selectedDestination?.name === destination.name ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{destination.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {destination.guides} guias
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {destination.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Informações sobre o destino selecionado */}
      {selectedDestination && (
        <div className="absolute bottom-4 left-4 z-10">
          <Card className="w-80">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg">{selectedDestination.name}</h3>
                <Badge>{selectedDestination.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedDestination.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">
                  {selectedDestination.guides} guias disponíveis
                </span>
                <Button size="sm" variant="outline">
                  Ver Guias
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status de carregamento */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-20">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce" />
            <p className="text-lg font-semibold">Carregando mapa de Angola...</p>
            <p className="text-sm text-muted-foreground">Preparando a experiência interativa</p>
          </div>
        </div>
      )}

      {/* Container do mapa */}
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-lg shadow-lg"
      />

      {/* Legenda */}
      {showControls && isLoaded && (
        <div className="absolute bottom-4 right-4 z-10">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-xs">
                <Info className="w-3 h-3" />
                <span>Clique nos marcadores para mais informações</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsAngola;