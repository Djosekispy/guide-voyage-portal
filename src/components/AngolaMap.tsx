import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

// Dados das principais cidades de Angola com coordenadas
const angolaDestinations = [
  { name: "Luanda", coordinates: [13.2343, -8.8383] as [number, number], guides: 25, description: "Capital de Angola" },
  { name: "Benguela", coordinates: [13.4055, -12.5763] as [number, number], guides: 18, description: "Porto histórico" },
  { name: "Huambo", coordinates: [15.7394, -12.7756] as [number, number], guides: 15, description: "Planalto central" },
  { name: "Lubango", coordinates: [13.4925, -14.9177] as [number, number], guides: 14, description: "Serra da Leba" },
  { name: "Namibe", coordinates: [12.1522, -15.1961] as [number, number], guides: 12, description: "Deserto do Namibe" },
  { name: "Soyo", coordinates: [12.3689, -6.1349] as [number, number], guides: 10, description: "Foz do Rio Congo" },
];

const AngolaMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [17.8739, -11.2027], // Centro de Angola
      zoom: 5.5,
      pitch: 0,
    });

    // Adicionar controles de navegação
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Adicionar marcadores para cada destino
    angolaDestinations.forEach((destination) => {
      // Criar um elemento HTML personalizado para o marcador
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.cssText = `
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      `;
      markerElement.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

      // Criar popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 12px; max-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1a1a1a;">${destination.name}</h3>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${destination.description}</p>
          <p style="margin: 0; color: #059669; font-size: 14px; font-weight: 500;">${destination.guides} guias disponíveis</p>
        </div>
      `);

      // Adicionar marcador ao mapa
      new mapboxgl.Marker(markerElement)
        .setLngLat(destination.coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Adicionar evento de carregamento do estilo
    map.current.on('style.load', () => {
      // Opcional: adicionar efeitos visuais adicionais
    });

    setShowTokenInput(false);
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (showTokenInput) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Configure o Mapa</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Para visualizar o mapa interativo de Angola, insira seu token público do Mapbox.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Obtenha seu token gratuito em: 
                <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> mapbox.com</a>
              </p>
            </div>
            
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Insira seu token público do Mapbox"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <button
                onClick={initializeMap}
                disabled={!mapboxToken.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Carregar Mapa
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
        <h4 className="font-semibold text-sm mb-1">Destinos em Angola</h4>
        <p className="text-xs text-muted-foreground">Clique nos marcadores para mais informações</p>
      </div>
    </div>
  );
};

export default AngolaMap;