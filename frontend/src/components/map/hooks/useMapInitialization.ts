import { useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import { useTheme } from '@mui/material/styles';

interface UseMapInitializationProps {
  mapRef: React.MutableRefObject<L.Map | null>;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  onMapLoad?: () => void;
}

export function useMapInitialization({
  mapRef,
  containerRef,
  onMapLoad
}: UseMapInitializationProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const initialized = useRef(false);

  // Callback para adicionar controles básicos
  const setupMapControls = useCallback((map: L.Map) => {
    // Controle de zoom
    L.control.zoom({
      position: 'topright',
      zoomInTitle: 'Aumentar zoom',
      zoomOutTitle: 'Diminuir zoom'
    }).addTo(map);

    // Escala
    L.control.scale({
      maxWidth: 100,
      metric: true,
      imperial: false,
      position: 'bottomleft'
    }).addTo(map);

    // Desabilitar double click zoom
    map.doubleClickZoom.disable();

    // Notificar que o mapa está pronto
    onMapLoad?.();
  }, [onMapLoad]);

  // Inicialização do mapa
  useEffect(() => {
    if (!containerRef.current || initialized.current || mapRef.current) return;

    try {
      // Criar instância do mapa
      const map = L.map(containerRef.current, {
        center: [-14.2350, -50.9090],
        zoom: 4,
        minZoom: 0,
        maxZoom: 18,
        zoomControl: false, // Desabilitar controle padrão de zoom
        attributionControl: true
      });

      // Adicionar tile layer
      const tileLayer = L.tileLayer(
        isDarkMode
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '©OpenStreetMap, ©CartoDB',
          subdomains: 'abcd',
          maxZoom: 18
        }
      );

      tileLayer.addTo(map);
      setupMapControls(map);
      mapRef.current = map;
      initialized.current = true;

      // Adicionar classe de tema
      containerRef.current.classList.toggle('dark-theme', isDarkMode);

    } catch (error) {
      console.error('Erro ao inicializar o mapa:', error);
      initialized.current = false;
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        initialized.current = false;
      }
    };
  }, [containerRef, mapRef, isDarkMode, setupMapControls]);

  // Atualizar tema
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !initialized.current) return;

    // Atualizar classe de tema
    if (containerRef.current) {
      containerRef.current.classList.toggle('dark-theme', isDarkMode);
    }

    // Atualizar tile layer
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer(
      isDarkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '©OpenStreetMap, ©CartoDB',
        subdomains: 'abcd',
        maxZoom: 18
      }
    ).addTo(map);

  }, [isDarkMode, mapRef, containerRef]);

  return {
    isDarkMode
  };
}