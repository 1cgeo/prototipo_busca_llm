import { useState, useCallback, useEffect } from 'react';
import { useMap, Rectangle, useMapEvents } from 'react-leaflet';
import { Button, styled } from '@mui/material';
import CropFreeIcon from '@mui/icons-material/CropFree';
import ClearIcon from '@mui/icons-material/Clear';
import L from 'leaflet';
import type { LatLng, LeafletKeyboardEvent, LeafletMouseEvent } from 'leaflet';
import type { BoundingBox } from '@/types/search';

interface DrawBoundingBoxProps {
  onBoundingBoxSelect: (bounds: L.LatLngBounds) => void;
  onClear: () => void;
  bbox?: BoundingBox;
}

const MapButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: '10px',
  right: '10px',
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  minWidth: 'unset',
  padding: '6px',
  borderRadius: '4px',
  boxShadow: theme.shadows[2],
}));

export default function DrawBoundingBox({ 
  onBoundingBoxSelect, 
  onClear,
  bbox 
}: DrawBoundingBoxProps) {
  const map = useMap();
  const [isDrawing, setIsDrawing] = useState(false);
  const [firstPoint, setFirstPoint] = useState<LatLng | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const [preview, setPreview] = useState<L.LatLngBounds | null>(null);

  const clearAll = useCallback(() => {
    setIsDrawing(false);
    setFirstPoint(null);
    setBounds(null);
    setPreview(null);
    map.getContainer().style.cursor = '';
    onClear();
  }, [map, onClear]);

  const handleStartDrawing = useCallback(() => {
    setIsDrawing(true);
    setFirstPoint(null);
    setBounds(null);
    setPreview(null);
    map.getContainer().style.cursor = 'crosshair';
  }, [map]);

  const handleStopDrawing = useCallback(() => {
    clearAll();
  }, [clearAll]);

  // Observar mudanças no bbox
  useEffect(() => {
    if (!bbox) {
      clearAll();
    }
  }, [bbox, clearAll]);

  // Map events
  useMapEvents({
    click(e: LeafletMouseEvent) {
      if (!isDrawing) return;

      if (!firstPoint) {
        setFirstPoint(e.latlng);
      } else {
        const newBounds = L.latLngBounds(firstPoint, e.latlng);
        if (newBounds.isValid()) {
          setBounds(newBounds);
          setPreview(null);
          onBoundingBoxSelect(newBounds);
          setIsDrawing(false);
          map.getContainer().style.cursor = '';
        }
      }
    },
    mousemove(e: LeafletMouseEvent) {
      if (isDrawing && firstPoint) {
        const newBounds = L.latLngBounds(firstPoint, e.latlng);
        setPreview(newBounds);
      }
    },
    keydown(e: LeafletKeyboardEvent) {
      if (e.originalEvent.key === 'Escape') {
        handleStopDrawing();
      }
    },
  });

  const rectangleOptions = {
    color: '#dc3545', // Vermelho
    weight: preview ? 1 : 2,
    opacity: 0.8,
    fillOpacity: preview ? 0.05 : 0.1,
    dashArray: '5, 10',
    fillColor: '#dc3545',
    interactive: false, // Desabilita interatividade
  };

  return (
    <>
      <MapButton
        variant="contained"
        onClick={isDrawing ? handleStopDrawing : handleStartDrawing}
        title={isDrawing ? 'Cancelar seleção' : 'Selecionar área no mapa'}
      >
        {isDrawing ? <ClearIcon /> : <CropFreeIcon />}
      </MapButton>

      {preview && <Rectangle bounds={preview} {...rectangleOptions} />}
      {bounds && <Rectangle bounds={bounds} {...rectangleOptions} />}
    </>
  );
}