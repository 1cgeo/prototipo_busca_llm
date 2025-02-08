import { useRef, useEffect, useCallback } from 'react';
import L from 'leaflet';
import { Box } from '@mui/material';
import { useSearch } from '@/contexts/SearchContext';
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapEvents } from './hooks/useMapEvents';
import { useTheme } from '@mui/material/styles';
import type { MapFeature } from '@/types/map';
import type { Feature, Geometry } from 'geojson';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  enableBboxSelection?: boolean;
  onZoomTo?: (zoomFn: (geometry: GeoJSON.Polygon) => void) => void;
}

export default function Map({ 
  enableBboxSelection = false,
  onZoomTo 
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resultsLayerRef = useRef<L.GeoJSON | null>(null);
  const activePopupRef = useRef<L.Popup | null>(null);
  const { state, setBoundingBox, setMapClearFunction } = useSearch();
  const { results } = state;
  const theme = useTheme();

  // Inicialização do mapa
  const { isDarkMode } = useMapInitialization({ mapRef, containerRef });

  // Eventos do mapa
  const { clearSelection } = useMapEvents({
    mapRef,
    enableBboxSelection,
    onBoundingBoxChange: setBoundingBox
  });

  // Estilo base para features
  const getFeatureStyle = useCallback((): L.PathOptions => ({
    color: theme.palette.primary.main,
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.2,
    fillColor: theme.palette.primary.main
  }), [theme.palette.primary.main]);

  // Zoom para feature
  const zoomToFeature = useCallback((geometry: GeoJSON.Polygon) => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = L.geoJSON(geometry).getBounds();
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 12,
      animate: true,
      duration: 0.5
    });
  }, []);

  // Registrar função de zoom
  useEffect(() => {
    if (onZoomTo) {
      onZoomTo(zoomToFeature);
    }
  }, [onZoomTo, zoomToFeature]);

  // Fechar popup ao clicar fora
  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    const map = mapRef.current;
    if (!map) return;

    let clickedFeature = false;
    map.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON) {
        layer.eachLayer((subLayer) => {
          if (subLayer instanceof L.Path) {
            const polygon = subLayer as L.Polygon;
            if (polygon.getBounds().contains(e.latlng)) {
              clickedFeature = true;
            }
          }
        });
      }
    });

    if (!clickedFeature && activePopupRef.current) {
      map.closePopup(activePopupRef.current);
      activePopupRef.current = null;
    }
  }, []);

  // Criar popup para feature
  const createPopupContent = useCallback((feature: Feature<Geometry, MapFeature['properties']>) => {
    const container = document.createElement('div');
    container.className = 'map-popup';
    container.innerHTML = `
      <div style="
        padding: 16px;
        min-width: 200px;
        max-width: 300px;
      ">
        <h4 style="
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 500;
          color: ${isDarkMode ? '#fff' : '#000'};
        ">${feature.properties?.name || ''}</h4>
        <p style="
          margin: 4px 0;
          font-size: 14px;
          color: ${isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
        ">
          Escala: ${feature.properties?.scale || ''}
        </p>
        <p style="
          margin: 4px 0;
          font-size: 14px;
          color: ${isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
        ">
          Tipo: ${feature.properties?.productType || ''}
        </p>
      </div>
    `;
    return container;
  }, [isDarkMode]);

  // Adicionar evento de click no mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [handleMapClick]);

  // Registrar função de limpeza no contexto
  useEffect(() => {
    setMapClearFunction(clearSelection);
  }, [clearSelection, setMapClearFunction]);

  // Atualizar camada de resultados
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !results.length) return;

    // Remover camada existente
    if (resultsLayerRef.current) {
      map.removeLayer(resultsLayerRef.current);
    }

    // Criar nova camada com os resultados
    const geojsonLayer = L.geoJSON(
      results.map(result => ({
        type: 'Feature',
        properties: {
          id: result.name,
          name: result.name,
          scale: result.scale,
          productType: result.productType
        },
        geometry: result.geometry
      })),
      {
        style: getFeatureStyle,
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: (e) => {
              const l = e.target;
              l.bringToFront();
            },
            click: (e) => {
              const l = e.target;
              
              // Fechar popup anterior se existir
              if (activePopupRef.current) {
                map.closePopup(activePopupRef.current);
              }

              // Criar e abrir novo popup
              const popup = L.popup({
                closeButton: true,
                closeOnClick: false,
                className: isDarkMode ? 'dark-theme' : ''
              })
                .setLatLng(e.latlng)
                .setContent(createPopupContent(feature));

              activePopupRef.current = popup;
              l.bindPopup(popup).openPopup();
            }
          });
        }
      }
    ).addTo(map);

    resultsLayerRef.current = geojsonLayer;

    // Ajustar viewport para mostrar todos os resultados
    const bounds = geojsonLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
        animate: true,
        duration: 0.5
      });
    }

    return () => {
      if (map && resultsLayerRef.current) {
        map.removeLayer(resultsLayerRef.current);
      }
    };
  }, [
    results, 
    isDarkMode, 
    getFeatureStyle, 
    createPopupContent
  ]);

  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        '& .leaflet-container': {
          width: '100%',
          height: '100%',
          background: theme.palette.background.default,
          fontSize: 'inherit',
          fontFamily: 'inherit'
        }
      }} 
    />
  );
}