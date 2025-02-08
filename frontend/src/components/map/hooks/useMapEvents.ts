import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { BoundingBox } from '@/types/search';
import { useTheme } from '@mui/material/styles';
import { SelectionControl } from '../components/SelectionControl';

interface UseMapEventsProps {
  mapRef: React.MutableRefObject<L.Map | null>;
  enableBboxSelection: boolean;
  onBoundingBoxChange: (bbox: BoundingBox | undefined) => void;
}

export function useMapEvents({
  mapRef,
  enableBboxSelection,
  onBoundingBoxChange
}: UseMapEventsProps) {
  const theme = useTheme();
  const rectangleRef = useRef<L.Rectangle | null>(null);
  const previewRectRef = useRef<L.Rectangle | null>(null);
  const isSelectingRef = useRef(false);
  const firstPointRef = useRef<L.LatLng | null>(null);
  const selectionControlRef = useRef<SelectionControl | null>(null);
  const currentBoundsRef = useRef<L.LatLngBounds | null>(null);
  const onBoundingBoxChangeRef = useRef(onBoundingBoxChange);

  // Manter referência atualizada da callback
  useEffect(() => {
    onBoundingBoxChangeRef.current = onBoundingBoxChange;
  }, [onBoundingBoxChange]);

  // Função para criar retângulo com estilo atual
  const createRectangle = useCallback((bounds: L.LatLngBounds) => {
    const map = mapRef.current;
    if (!map) return null;

    return L.rectangle(bounds, {
      color: '#dc3545',
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.1,
      dashArray: '5, 10',
      fillColor: '#dc3545'
    });
  }, [mapRef]);

  // Atualizar retângulo quando o tema mudar
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !currentBoundsRef.current) return;

    // Recriar o retângulo com o novo estilo
    if (rectangleRef.current) {
      map.removeLayer(rectangleRef.current);
    }

    rectangleRef.current = createRectangle(currentBoundsRef.current);
    if (rectangleRef.current) {
      rectangleRef.current.addTo(map);
    }
  }, [theme.palette.primary.main, createRectangle, mapRef]);

  // Limpar seleção
  const clearSelection = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remover layers visuais
    if (rectangleRef.current) {
      map.removeLayer(rectangleRef.current);
      rectangleRef.current = null;
    }

    if (previewRectRef.current) {
      map.removeLayer(previewRectRef.current);
      previewRectRef.current = null;
    }

    // Resetar estados
    isSelectingRef.current = false;
    firstPointRef.current = null;
    currentBoundsRef.current = null;
    map.getContainer().style.cursor = '';

    // Limpar bounding box
    onBoundingBoxChangeRef.current(undefined);

    // Desativar controle
    if (selectionControlRef.current?.getState()) {
      selectionControlRef.current.setActive(false);
    }
  }, [mapRef]);

  // Finalizar seleção
  const finishSelection = useCallback((bounds: L.LatLngBounds) => {
    const map = mapRef.current;
    if (!map) return;

    // Remover preview
    if (previewRectRef.current) {
      map.removeLayer(previewRectRef.current);
      previewRectRef.current = null;
    }

    // Remover retângulo anterior
    if (rectangleRef.current) {
      map.removeLayer(rectangleRef.current);
      rectangleRef.current = null;
    }

    // Criar novo retângulo
    rectangleRef.current = createRectangle(bounds);
    if (rectangleRef.current) {
      rectangleRef.current.addTo(map);
    }

    // Salvar bounds atual
    currentBoundsRef.current = bounds;

    // Atualizar bbox
    const newBbox: BoundingBox = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };

    onBoundingBoxChangeRef.current(newBbox);
  }, [createRectangle, mapRef]);

  // Gerenciar eventos de seleção
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !enableBboxSelection) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (!isSelectingRef.current) return;

      if (!firstPointRef.current) {
        firstPointRef.current = e.latlng;
        map.getContainer().style.cursor = 'crosshair';
        return;
      }

      const bounds = L.latLngBounds(firstPointRef.current, e.latlng);
      if (bounds.isValid()) {
        finishSelection(bounds);
      }

      isSelectingRef.current = false;
      firstPointRef.current = null;
      map.getContainer().style.cursor = '';

      if (selectionControlRef.current) {
        selectionControlRef.current.setActive(false);
      }
    };

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      if (!isSelectingRef.current || !firstPointRef.current) return;

      if (previewRectRef.current) {
        map.removeLayer(previewRectRef.current);
      }

      const bounds = L.latLngBounds(firstPointRef.current, e.latlng);
      previewRectRef.current = createRectangle(bounds);
      if (previewRectRef.current) {
        previewRectRef.current.setStyle({
          opacity: 0.6,
          fillOpacity: 0.05,
          dashArray: '5, 10'
        });
        previewRectRef.current.addTo(map);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSelectingRef.current) {
        clearSelection();
      }
    };

    map.on('click', handleClick);
    map.on('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      map.off('click', handleClick);
      map.off('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mapRef, enableBboxSelection, clearSelection, createRectangle, finishSelection]);

  // Adicionar controle de seleção
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !enableBboxSelection) return;

    if (selectionControlRef.current) {
      map.removeControl(selectionControlRef.current);
    }

    selectionControlRef.current = new SelectionControl({
      isDarkMode: theme.palette.mode === 'dark',
      onSelectionStart: () => {
        // Limpar seleção anterior
        if (rectangleRef.current) {
          map.removeLayer(rectangleRef.current);
          rectangleRef.current = null;
        }
        if (previewRectRef.current) {
          map.removeLayer(previewRectRef.current);
          previewRectRef.current = null;
        }
        currentBoundsRef.current = null;
        onBoundingBoxChangeRef.current(undefined);
        
        isSelectingRef.current = true;
        firstPointRef.current = null;
        map.getContainer().style.cursor = 'crosshair';
      },
      onSelectionCancel: clearSelection
    });

    selectionControlRef.current.addTo(map);

    return () => {
      if (selectionControlRef.current && map) {
        map.removeControl(selectionControlRef.current);
        selectionControlRef.current = null;
      }
    };
  }, [mapRef, enableBboxSelection, theme.palette.mode, clearSelection]);

  return {
    clearSelection
  };
}