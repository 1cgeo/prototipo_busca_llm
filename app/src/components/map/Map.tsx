import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSearch } from '@/contexts/SearchContext';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  IconButton,
  Tooltip,
  Fade,
  Portal
} from '@mui/material';
import CropFreeIcon from '@mui/icons-material/CropFree';
import ClearIcon from '@mui/icons-material/Clear';
import { SearchResult, BoundingBox } from '@/types/search';

// Coordenadas aproximadas do Brasil
const BRAZIL_BOUNDS = {
  north: 5.27438,
  south: -33.75117,
  east: -34.79299,
  west: -73.98554
};

interface MapProps {
  enableBboxSelection?: boolean;
}

interface MapFeature extends GeoJSON.Feature {
  properties: {
    id: string;
    name: string;
    scale: string;
    productType: string;
  };
}

interface MapGeojson extends GeoJSON.FeatureCollection {
  features: MapFeature[];
}

interface MapControlsProps {
  isDrawing: boolean;
  onStartDrawing: () => void;
  onCancelDrawing: () => void;
  onClearBbox: () => void;
  hasBbox: boolean;
}

function MapControls({ 
  isDrawing, 
  onStartDrawing, 
  onCancelDrawing, 
  onClearBbox, 
  hasBbox 
}: MapControlsProps) {
  return (
    <Box sx={{ 
      position: 'absolute', 
      top: 100,
      right: 10, 
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      zIndex: 1
    }}>
      <Tooltip 
        title={isDrawing ? "Cancelar seleção" : "Selecionar área"} 
        placement="left"
      >
        <IconButton 
          onClick={isDrawing ? onCancelDrawing : onStartDrawing}
          color={isDrawing ? "error" : "primary"}
          sx={{ 
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.paper',
              opacity: 0.9
            }
          }}
        >
          <CropFreeIcon />
        </IconButton>
      </Tooltip>
      
      {hasBbox && (
        <Tooltip title="Limpar área selecionada" placement="left">
          <IconButton 
            onClick={onClearBbox}
            color="primary"
            sx={{ 
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                opacity: 0.9
              }
            }}
          >
            <ClearIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

export default function Map({ enableBboxSelection = false }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);
  const { state, setBoundingBox } = useSearch();
  const { results, bbox } = state;
  const theme = useTheme();
  const [isDrawing, setIsDrawing] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);

  // Inicialização do mapa
  useEffect(() => {
    let mapInstance: maplibregl.Map | null = null;

    // Criar nova instância do mapa
    if (mapContainer.current && !map.current) {
      try {
        mapInstance = new maplibregl.Map({
          container: mapContainer.current,
          style: theme.palette.mode === 'dark' 
            ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
            : 'https://demotiles.maplibre.org/style.json',
          bounds: [BRAZIL_BOUNDS.west, BRAZIL_BOUNDS.south, BRAZIL_BOUNDS.east, BRAZIL_BOUNDS.north],
          fitBoundsOptions: { 
            padding: 50,
            maxZoom: 8
          },
          maxBounds: [
            [BRAZIL_BOUNDS.west - 10, BRAZIL_BOUNDS.south - 10],
            [BRAZIL_BOUNDS.east + 10, BRAZIL_BOUNDS.north + 10]
          ],
          minZoom: 3
        });

        mapInstance.addControl(
          new maplibregl.NavigationControl({ 
            showCompass: false,
            visualizePitch: false
          })
        );

        mapInstance.addControl(
          new maplibregl.ScaleControl({
            maxWidth: 100,
            unit: 'metric'
          }),
          'bottom-left'
        );

        mapInstance.on('load', () => {
          setMapLoaded(true);
        });

        mapInstance.doubleClickZoom.disable();
        map.current = mapInstance;
      } catch (error) {
        console.error('Erro ao inicializar o mapa:', error);
      }
    }

    return () => {
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (error) {
          console.error('Erro ao remover o mapa:', error);
        }
      }
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (map.current && mapLoaded) {
      const newStyle = theme.palette.mode === 'dark' 
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://demotiles.maplibre.org/style.json';
      
      try {
        map.current.setStyle(newStyle);
      } catch (error) {
        console.error('Erro ao atualizar estilo do mapa:', error);
      }
    }
  }, [theme.palette.mode, mapLoaded]);

  // Atualizar camada de resultados
  const updateResultsLayer = useCallback((mapInstance: maplibregl.Map, mapResults: SearchResult[]) => {
    ['results-fill', 'results-outline', 'results-hover'].forEach(layerId => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
    });

    if (mapInstance.getSource('results')) {
      mapInstance.removeSource('results');
    }

    // Criar GeoJSON feature collection
    const geojson: MapGeojson = {
      type: 'FeatureCollection',
      features: mapResults.map((result, index) => ({
        type: 'Feature',
        properties: {
          id: `result-${index}`,
          name: result.name,
          scale: result.scale,
          productType: result.productType
        },
        geometry: result.geometry
      }))
    };

    // Adicionar source e layers
    mapInstance.addSource('results', {
      type: 'geojson',
      data: geojson
    });

    // Layer de preenchimento base
    mapInstance.addLayer({
      id: 'results-fill',
      type: 'fill',
      source: 'results',
      paint: {
        'fill-color': theme.palette.primary.main,
        'fill-opacity': [
          'case',
          ['boolean', ['==', ['get', 'id'], hoveredFeatureId], false],
          0.4,
          0.2
        ]
      }
    });

    // Layer de contorno
    mapInstance.addLayer({
      id: 'results-outline',
      type: 'line',
      source: 'results',
      paint: {
        'line-color': theme.palette.primary.main,
        'line-width': [
          'case',
          ['boolean', ['==', ['get', 'id'], hoveredFeatureId], false],
          3,
          1.5
        ]
      }
    });

    // Interatividade
    mapInstance.on('mousemove', 'results-fill', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0] as unknown as MapFeature;
        setHoveredFeatureId(feature.properties.id);
        mapInstance.getCanvas().style.cursor = 'pointer';
        
        // Atualizar popup
        if (!popup.current) {
          popup.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            maxWidth: '300px',
            className: theme.palette.mode === 'dark' ? 'dark-popup' : ''
          });
        }

        const coordinates = e.lngLat;
        const properties = feature.properties;

        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
          <div style="
            font-family: ${theme.typography.fontFamily};
            padding: ${theme.spacing(1)};
            color: ${theme.palette.text.primary};
            background: ${theme.palette.background.paper};
          ">
            <h4 style="
              margin: 0 0 ${theme.spacing(1)};
              font-size: ${theme.typography.subtitle1.fontSize};
              font-weight: 500;
            ">${properties.name}</h4>
            <p style="margin: 0;">Escala: ${properties.scale}</p>
            <p style="margin: ${theme.spacing(1)} 0 0;">Tipo: ${properties.productType}</p>
          </div>
        `;

        popup.current
          .setLngLat(coordinates)
          .setDOMContent(popupContent)
          .addTo(mapInstance);
      }
    });

    mapInstance.on('mouseleave', 'results-fill', () => {
      setHoveredFeatureId(null);
      mapInstance.getCanvas().style.cursor = '';
      popup.current?.remove();
    });

    // Ajustar viewport para mostrar todos os resultados
    if (geojson.features.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      geojson.features.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
          (feature.geometry.coordinates[0] as [number, number][]).forEach(coord => {
            bounds.extend(coord as maplibregl.LngLatLike);
          });
        }
      });

      mapInstance.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
        duration: 1000
      });
    }
  }, [theme, hoveredFeatureId]);

  // Atualizar resultados quando mudam
  useEffect(() => {
    if (!map.current || !mapLoaded || !results.length) return;
    updateResultsLayer(map.current, results);
  }, [results, mapLoaded, updateResultsLayer]);

  // Gerenciamento do modo de desenho de bbox
  const startDrawing = useCallback(() => {
    if (!map.current) return;
    
    setIsDrawing(true);
    map.current.getCanvas().style.cursor = 'crosshair';

    let startPoint: maplibregl.Point | null = null;
    let currentPoint: maplibregl.Point | null = null;
    let box: GeoJSON.Polygon | null = null;

    const onMouseDown = (e: MouseEvent) => {
      if (!map.current) return;
      
      startPoint = new maplibregl.Point(e.offsetX, e.offsetY);
      currentPoint = startPoint;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!startPoint || !map.current) return;
      
      currentPoint = new maplibregl.Point(e.offsetX, e.offsetY);
      
      if (map.current.getLayer('bbox')) {
        map.current.removeLayer('bbox');
      }
      if (map.current.getSource('bbox')) {
        map.current.removeSource('bbox');
      }

      const minX = Math.min(startPoint.x, currentPoint.x);
      const maxX = Math.max(startPoint.x, currentPoint.x);
      const minY = Math.min(startPoint.y, currentPoint.y);
      const maxY = Math.max(startPoint.y, currentPoint.y);

      const sw = map.current.unproject([minX, maxY]);
      const se = map.current.unproject([maxX, maxY]);
      const ne = map.current.unproject([maxX, minY]);
      const nw = map.current.unproject([minX, minY]);

      box = {
        type: 'Polygon',
        coordinates: [[
          [sw.lng, sw.lat],
          [se.lng, se.lat],
          [ne.lng, ne.lat],
          [nw.lng, nw.lat],
          [sw.lng, sw.lat]
        ]]
      };

      map.current.addSource('bbox', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: box
        }
      });

      map.current.addLayer({
        id: 'bbox',
        type: 'fill',
        source: 'bbox',
        paint: {
          'fill-color': theme.palette.primary.main,
          'fill-opacity': 0.2,
          'fill-outline-color': theme.palette.primary.main
        }
      });
    };

    const onMouseUp = () => {
      if (!startPoint || !currentPoint || !map.current) return;

      const sw = map.current.unproject([
        Math.min(startPoint.x, currentPoint.x),
        Math.max(startPoint.y, currentPoint.y)
      ]);
      const ne = map.current.unproject([
        Math.max(startPoint.x, currentPoint.x),
        Math.min(startPoint.y, currentPoint.y)
      ]);

      const newBbox: BoundingBox = {
        west: sw.lng,
        south: sw.lat,
        east: ne.lng,
        north: ne.lat
      };

      setBoundingBox(newBbox);
      setIsDrawing(false);
      map.current.getCanvas().style.cursor = '';
      
      // Remover event listeners
      const canvas = map.current.getCanvas();
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
    };

    const canvas = map.current.getCanvas();
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
  }, [setBoundingBox, theme.palette.primary.main]);

  const clearBoundingBox = useCallback(() => {
    if (!map.current) return;
    
    // Remover camadas do bbox
    if (map.current.getLayer('bbox')) {
      map.current.removeLayer('bbox');
    }
    if (map.current.getSource('bbox')) {
      map.current.removeSource('bbox');
    }
    
    setBoundingBox(undefined);
  }, [setBoundingBox]);

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    if (map.current) {
      map.current.getCanvas().style.cursor = '';
    }
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100%',
          background: theme.palette.background.default 
        }}
      />
      
      {/* Controles do Mapa */}
      {enableBboxSelection && (
        <Fade in={mapLoaded}>
          <Portal>
            <MapControls 
              isDrawing={isDrawing}
              onStartDrawing={startDrawing}
              onCancelDrawing={cancelDrawing}
              onClearBbox={clearBoundingBox}
              hasBbox={Boolean(bbox)}
            />
          </Portal>
        </Fade>
      )}

      {/* Estilo global para o popup do mapa */}
      <style>
        {`
          .maplibregl-popup {
            z-index: 1;
          }

          .maplibregl-popup-content {
            padding: 0 !important;
            border-radius: ${theme.shape.borderRadius}px !important;
            overflow: hidden;
            box-shadow: ${theme.shadows[4]};
          }

          .maplibregl-popup.dark-popup .maplibregl-popup-content {
            background: ${theme.palette.background.paper};
          }

          .maplibregl-popup-close-button {
            padding: 4px 8px !important;
            font-size: 16px !important;
            color: ${theme.palette.text.primary} !important;
          }

          .maplibregl-ctrl-bottom-left,
          .maplibregl-ctrl-top-left {
            margin-left: 12px !important;
          }

          .maplibregl-ctrl-group {
            background: ${theme.palette.background.paper} !important;
            border: none !important;
            box-shadow: ${theme.shadows[2]} !important;
          }

          .maplibregl-ctrl-group button {
            background-color: transparent !important;
            border: none !important;
          }

          .maplibregl-ctrl-group button:hover {
            background-color: ${theme.palette.action.hover} !important;
          }

          .maplibregl-ctrl-group button.active {
            background-color: ${theme.palette.action.selected} !important;
          }

          .maplibregl-ctrl-scale {
            background-color: ${theme.palette.background.paper} !important;
            border: 1px solid ${theme.palette.divider} !important;
            border-radius: ${theme.shape.borderRadius}px !important;
            color: ${theme.palette.text.primary} !important;
            font-family: ${theme.typography.fontFamily} !important;
            padding: 2px 6px !important;
          }
        `}
      </style>
    </Box>
  );
}