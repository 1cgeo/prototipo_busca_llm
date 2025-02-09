import { useCallback, useMemo, useEffect } from 'react';
import { GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import { useTheme } from '@mui/material/styles';
import type { MapFeature } from '@/types/map';
import type { SearchResult } from '@/types/search';
import type { Feature, Geometry, FeatureCollection } from 'geojson';
import L from 'leaflet';

interface ResultsLayerProps {
  results: SearchResult[];
  featureStyle: L.PathOptions;
}

export default function ResultsLayer({ 
  results, 
  featureStyle 
}: ResultsLayerProps) {
  const map = useMap();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Limpar layers antigas quando os resultados mudarem
  useEffect(() => {
    return () => {
      map.eachLayer((layer) => {
        if (layer instanceof L.GeoJSON) {
          map.removeLayer(layer);
        }
      });
    };
  }, [map, results]);

  // Fechar popups ao clicar no mapa
  useMapEvents({
    click(e) {
      // Verificar se o clique foi em uma feature
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

      // Se o clique não foi em uma feature, fechar popups
      if (!clickedFeature) {
        map.closePopup();
      }
    }
  });

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

  const geojsonData = useMemo((): FeatureCollection => ({
    type: 'FeatureCollection',
    features: results.map(result => ({
      type: 'Feature',
      properties: {
        id: result.name,
        name: result.name,
        scale: result.scale,
        productType: result.productType
      },
      geometry: result.geometry
    }))
  }), [results]);

  // Gerar uma key única baseada nos resultados
  const layerKey = useMemo(() => {
    return results.map(r => r.name).join('-');
  }, [results]);

  if (!results.length) return null;

  return (
    <GeoJSON
      key={layerKey}
      data={geojsonData}
      style={featureStyle}
      onEachFeature={(feature, layer) => {
        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({
              weight: 2,
              opacity: 1,
              fillOpacity: 0.3
            });
            l.bringToFront();
          },
          mouseout: (e) => {
            const l = e.target;
            l.setStyle(featureStyle);
          },
          click: (e) => {
            // Fechar popups existentes
            map.closePopup();
            
            // Abrir novo popup
            L.popup({
              closeButton: true,
              closeOnClick: false,
              className: isDarkMode ? 'dark-theme' : ''
            })
              .setLatLng(e.latlng)
              .setContent(createPopupContent(feature))
              .openOn(map);
          }
        });
      }}
    />
  );
}