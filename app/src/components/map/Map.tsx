import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSearch } from '@/contexts/SearchContext';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper } from '@mui/material';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { state } = useSearch();
  const { results } = state;
  const theme = useTheme();

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: theme.palette.mode === 'dark' 
          ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
          : 'https://demotiles.maplibre.org/style.json',
        center: [-50, -15], // Centro aproximado do Brasil
        zoom: 4
      });

      map.current.addControl(new maplibregl.NavigationControl());
    }

    return () => {
      map.current?.remove();
    };
  }, [theme.palette.mode]);

  useEffect(() => {
    if (!map.current || !results.length) return;

    // Remover layers e sources existentes
    if (map.current.getLayer('results-fill')) {
      map.current.removeLayer('results-fill');
    }
    if (map.current.getLayer('results-outline')) {
      map.current.removeLayer('results-outline');
    }
    if (map.current.getSource('results')) {
      map.current.removeSource('results');
    }

    // Criar GeoJSON feature collection
    const geojson = {
      type: 'FeatureCollection',
      features: results.map(result => ({
        type: 'Feature',
        properties: {
          nome: result.nome,
          escala: result.escala,
          tipoProduto: result.tipoProduto
        },
        geometry: result.geometry
      }))
    };

    // Adicionar source e layers
    map.current.addSource('results', {
      type: 'geojson',
      data: geojson
    });

    map.current.addLayer({
      id: 'results-fill',
      type: 'fill',
      source: 'results',
      paint: {
        'fill-color': theme.palette.primary.main,
        'fill-opacity': 0.2
      }
    });

    map.current.addLayer({
      id: 'results-outline',
      type: 'line',
      source: 'results',
      paint: {
        'line-color': theme.palette.primary.main,
        'line-width': 2
      }
    });

    // Adicionar popups
    map.current.on('click', 'results-fill', (e) => {
      if (!e.features?.length) return;

      const coordinates = e.lngLat;
      const properties = e.features[0].properties;

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
            font-size: ${theme.typography.h6.fontSize};
          ">${properties.nome}</h4>
          <p style="margin: 0;">Escala: ${properties.escala}</p>
          <p style="margin: ${theme.spacing(1)} 0 0;">Tipo: ${properties.tipoProduto}</p>
        </div>
      `;

      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setDOMContent(popupContent)
        .addTo(map.current!);
    });

    // Ajustar o zoom para mostrar todos os resultados
    const bounds = new maplibregl.LngLatBounds();
    geojson.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates[0].forEach((coord: any) => {
          bounds.extend(coord as [number, number]);
        });
      }
    });

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 12
    });
  }, [results, theme]);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={mapContainer} 
        style={{ width: '100%', height: '100%' }}
      />
      {!results.length && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: 2,
            textAlign: 'center',
            maxWidth: '80%'
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Faça uma busca para ver os resultados no mapa
          </Typography>
        </Paper>
      )}
    </Box>
  );
}