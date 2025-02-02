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
}

export default function Map({ 
  enableBboxSelection = false
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resultsLayerRef = useRef<L.GeoJSON | null>(null);
  const { state, setBoundingBox, setMapClearFunction } = useSearch();
  const { results } = state;
  const theme = useTheme();

  // Inicialização do mapa
  const { isDarkMode } = useMapInitialization({ 
    mapRef, 
    containerRef 
  });

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

  // Estilo para hover
  const getHoverStyle = useCallback((): L.PathOptions => ({
    weight: 2,
    opacity: 1,
    fillOpacity: 0.4
  }), []);

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
        style: () => getFeatureStyle(),
        onEachFeature: (feature, layer) => {
          // Eventos de hover
          layer.on({
            mouseover: (e) => {
              const l = e.target;
              l.setStyle(getHoverStyle());
              l.bringToFront();
            },
            mouseout: (e) => {
              const l = e.target;
              l.setStyle(getFeatureStyle());
            },
            click: (e) => {
              const l = e.target;
              const popup = L.popup({
                closeButton: true,
                closeOnClick: false,
                className: isDarkMode ? 'dark-theme' : ''
              })
                .setLatLng(e.latlng)
                .setContent(createPopupContent(feature));

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
  }, [results, isDarkMode, getFeatureStyle, getHoverStyle, createPopupContent]);

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