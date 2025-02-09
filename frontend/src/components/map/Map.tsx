import { useEffect, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import { useSearch } from '@/contexts/SearchContext';
import { useTheme } from '@mui/material/styles';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { LatLngBounds } from 'leaflet';
import L from 'leaflet';
import DrawBoundingBox from './components/DrawBoundingBox';
import ResultsLayer from './components/ResultsLayer';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  enableBboxSelection?: boolean;
  onZoomTo?: (zoomFn: (geometry: GeoJSON.Polygon) => void) => void;
}

// Componente para gerenciar o zoom
function ZoomController({ onZoomTo }: { onZoomTo?: (zoomFn: (geometry: GeoJSON.Polygon) => void) => void }) {
  const map = useMap();

  useEffect(() => {
    if (onZoomTo) {
      onZoomTo((geometry: GeoJSON.Polygon) => {
        const bounds = L.geoJSON(geometry).getBounds();
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 12,
          animate: true,
          duration: 0.5
        });
      });
    }
  }, [map, onZoomTo]);

  return null;
}

// Componente principal do mapa
export default function Map({ 
  enableBboxSelection = false,
  onZoomTo 
}: MapProps) {
  const { state, setBoundingBox, setMapClearFunction } = useSearch();
  const { results } = state;
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Estilo base para features
  const featureStyle = useMemo((): L.PathOptions => ({
    color: theme.palette.primary.main,
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.2,
    fillColor: theme.palette.primary.main
  }), [theme.palette.primary.main]);

  // Função para lidar com seleção de bounding box
  const handleBoundingBoxSelect = useCallback((bounds: LatLngBounds) => {
    setBoundingBox({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    });
  }, [setBoundingBox]);

  // Função de limpeza memorizada
  const clearBoundingBox = useCallback(() => {
    setBoundingBox(undefined);
  }, [setBoundingBox]);

  // Registrar função de limpeza
  useEffect(() => {
    setMapClearFunction(clearBoundingBox);
    return () => setMapClearFunction(() => {});
  }, [setMapClearFunction, clearBoundingBox]);

  return (
    <Box sx={{ 
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
    }}>
      <MapContainer
        center={[-14.2350, -50.9090]}
        zoom={4}
        minZoom={0}
        maxZoom={18}
        zoomControl={false}
        doubleClickZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url={isDarkMode
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'}
          attribution='©OpenStreetMap, ©CartoDB'
          maxZoom={18}
        />
        
        <ResultsLayer 
          results={results}
          featureStyle={featureStyle}
        />

        {enableBboxSelection && (
          <DrawBoundingBox 
            onBoundingBoxSelect={handleBoundingBoxSelect}
            onClear={clearBoundingBox}
            bbox={state.bbox}
          />
        )}

        <ZoomController onZoomTo={onZoomTo} />
      </MapContainer>
    </Box>
  );
}