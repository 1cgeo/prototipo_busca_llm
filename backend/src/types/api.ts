import type { Polygon } from 'geojson';

export const SCALES = [
  '1:25.000',
  '1:50.000',
  '1:100.000',
  '1:250.000',
] as const;

export const PRODUCT_TYPES = [
  'Carta Topográfica',
  'Carta Ortoimagem',
  'Carta Temática',
] as const;

export const SUPPLY_AREAS = [
  '1° Centro de Geoinformação',
  '2° Centro de Geoinformação',
  '3° Centro de Geoinformação',
  '4° Centro de Geoinformação',
  '5° Centro de Geoinformação',
] as const;

export const PROJECTS = [
  'Rondônia',
  'Amapá',
  'Bahia',
  'BECA',
  'Rio Grande do Sul',
  'Mapeamento Sistemático',
  'Copa do Mundo 2014',
  'Olimpíadas',
  'Copa das Confederações 2013',
] as const;

export const SORT_FIELDS = ['publicationDate', 'creationDate'] as const;
export const SORT_DIRECTIONS = ['ASC', 'DESC'] as const;

export type Scale = (typeof SCALES)[number];
export type ProductType = (typeof PRODUCT_TYPES)[number];
export type SupplyArea = (typeof SUPPLY_AREAS)[number];
export type Project = (typeof PROJECTS)[number];
export type SortField = (typeof SORT_FIELDS)[number];
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export interface NaturalLanguageQuery {
  query: string;
  bbox?: BoundingBox;
}

export interface SearchParams {
  keyword?: string;
  scale?: Scale;
  productType?: ProductType;
  state?: string;
  city?: string;
  supplyArea?: SupplyArea;
  project?: Project;
  publicationPeriod?: {
    start: string;
    end: string;
  };
  creationPeriod?: {
    start: string;
    end: string;
  };
  sortField?: SortField;
  sortDirection?: SortDirection;
  limit?: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchResult {
  name: string;
  description: string;
  scale: Scale;
  productType: ProductType;
  project: Project;
  publicationDate: string;
  creationDate: string;
  geometry: Polygon;
}

export interface SearchMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  processedQuery?: SearchParams;
  preprocessedText?: string; // Texto após pré-processamento
}

export interface QueryResult {
  items: SearchResult[];
  metadata: SearchMetadata;
}

export interface OllamaApiResponse {
  response: string;
}

export interface FullSearchRequest {
  searchParams: SearchParams;
  bbox?: BoundingBox;
  pagination: {
    page: number;
  };
}
