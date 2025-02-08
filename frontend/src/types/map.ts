import type { Feature, FeatureCollection, Polygon } from 'geojson';
import type { LatLngBounds, LatLng } from 'leaflet';

export interface MapFeatureProperties {
  id: string;
  name: string;
  scale: string;
  productType: string;
}

export interface MapFeature extends Feature<Polygon, MapFeatureProperties> {}

export interface MapGeojson extends FeatureCollection<Polygon, MapFeatureProperties> {
  features: MapFeature[];
}

export interface MapBounds {
  bounds: LatLngBounds;
  center: LatLng;
}

export interface MapClickEvent {
  latlng: LatLng;
  containerPoint: L.Point;
  layerPoint: L.Point;
}

export interface MapLayer {
  id: string;
  layer: L.Layer;
}