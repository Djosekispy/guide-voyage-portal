import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CityMapProps {
  city: string;
  className?: string;
}

const CityMap: React.FC<CityMapProps> = ({ city, className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const apiKey = 'AIzaSyAOgcbrjuBmK_FBqSfcqQRTkEbSQpijOJo';

  useEffect(() => {
    if (!city || !mapRef.current || mapLoaded) return;

    const initializeMap = () => {
      if (!window.google || !mapRef.current) return;

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { address: `${city}, Angola`, region: 'AO' },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            
            const map = new google.maps.Map(mapRef.current!, {
              center: location,
              zoom: 12,
              zoomControl: true,
              mapTypeControl: true,
              streetViewControl: false,
              fullscreenControl: true,
              styles: [
                {
                  featureType: 'poi',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            });

            new google.maps.Marker({
              position: location,
              map: map,
              title: city,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="#ffffff" stroke-width="2">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 32)
              }
            });

            setMapLoaded(true);
          }
        }
      );
    };

    if (!window.google) {
      // Verifica se o script já existe
      const existingScript = document.querySelector(
        `script[src^="https://maps.googleapis.com/maps/api/js"]`
      );
      
      if (!existingScript) {
        scriptRef.current = document.createElement('script');
        scriptRef.current.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        scriptRef.current.async = true;
        scriptRef.current.defer = true;
        scriptRef.current.onload = initializeMap;
        document.head.appendChild(scriptRef.current);
      } else {
        // Se o script já existe, apenas inicializa o mapa
        initializeMap();
      }
    } else {
      initializeMap();
    }

    return () => {
      // Remove o script apenas se foi este componente que o adicionou
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
      }
    };
  }, [city, apiKey, mapLoaded]);

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg bg-muted flex items-center justify-center"
        >
          {!mapLoaded && (
            <div className="text-center p-4">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-200 rounded-full mb-4"></div>
                <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-blue-200 rounded w-1/2"></div>
              </div>
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-sm p-4 text-center">
          Localização em {city}, Angola
        </p>
      </CardContent>
    </Card>
  );
};

export default CityMap;