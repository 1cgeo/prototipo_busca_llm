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
        max-width: 320px;
      ">
        <h4 style="
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 500;
          color: ${isDarkMode ? '#fff' : '#000'};
        ">${feature.properties?.name || 'Sem nome'}</h4>
        <div style="
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 4px 8px;
          font-size: 14px;
          color: ${isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
        ">
          <span style="font-weight: 500;">MI:</span>
          <span>${feature.properties?.mi || '-'}</span>
          
          <span style="font-weight: 500;">INOM:</span>
          <span>${feature.properties?.inom || '-'}</span>
          
          <span style="font-weight: 500;">Escala:</span>
          <span>${feature.properties?.scale || '-'}</span>
          
          <span style="font-weight: 500;">Tipo:</span>
          <span>${feature.properties?.productType || '-'}</span>
          
          <span style="font-weight: 500;">Projeto:</span>
          <span>${feature.properties?.project || '-'}</span>
          
          <span style="font-weight: 500;">Criação:</span>
          <span>${feature.properties?.creationDate ? new Date(feature.properties.creationDate).toLocaleDateString() : '-'}</span>
          
          <span style="font-weight: 500;">Publicação:</span>
          <span>${feature.properties?.publicationDate ? new Date(feature.properties.publicationDate).toLocaleDateString() : '-'}</span>
        </div>
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
        mi: result.mi,
        inom: result.inom,
        scale: result.scale,
        productType: result.productType,
        project: result.project,
        creationDate: result.creationDate,
        publicationDate: result.publicationDate
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