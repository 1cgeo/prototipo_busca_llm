import type { Polygon } from 'geojson';

export const SCALES = [
  '1:1.000',
  '1:2.000',
  '1:5.000',
  '1:10.000',
  '1:25.000',
  '1:50.000',
  '1:100.000',
  '1:250.000',
] as const;

export const PRODUCT_TYPES = [
  'Altura da vegetação',
  'CDGV EDGV Defesa F Ter Não SCN',
  'CTM Venezuela',
  'Carta Ortoimagem Especial',
  'Cartas CENSIPAM',
  'Cartas Temáticas Não SCN',
  'MDS - RAM',
  'MDT - RAM',
  'Modelo Tridimensional MDS',
  'Modelo Tridimensional MDT',
  'Nao SCN Carta Topografica Especial Matricial',
  'Ortoimagem',
  'Ortoimagem Radar Colorida',
  'Ortoimagem SCN',
  'Ortoimagem banda P',
  'Ortoimagem banda P pol HH',
  'Ortoimagem banda P pol HV',
  'Ortoimagem banda X pol HH',
  'SCN Carta Especial Matricial',
  'SCN Carta Ortoimagem',
  'SCN Carta Topografica Matricial',
  'SCN Carta Topografica Vetorial',
  'SCN Carta Topografica Vetorial EDGV 3.0',
  'Tematico CIRC',
  'Tematico CIRP',
  'Tematico CISC',
  'Tematico CISP',
  'Tematico CMIL',
  'Tematico CTBL',
  'Tematico CTP',
] as const;

export const SUPPLY_AREAS = [
  '1° Centro de Geoinformação',
  '2° Centro de Geoinformação',
  '3° Centro de Geoinformação',
  '4° Centro de Geoinformação',
  '5° Centro de Geoinformação',
] as const;

export const PROJECTS = [
  'AMAN',
  'Base Cartográfica Digital da Bahia',
  'Base Cartográfica Digital de Rondônia',
  'Base Cartográfica Digital do Amapá',
  'COTer Não EDGV',
  'Cobertura Aerofotogramétrica do Estado de São Paulo',
  'Conversão do Mapeamento Sistematico do SCN para Vetorial',
  'Copa das Confederações',
  'Copa do Mundo 2014',
  'Mapeamento Sistemático',
  'Mapeamento de Áreas de Interesse da Força',
  'NGA-BECA',
  'Olimpíadas Rio 2016',
  'Produtos Temáticos Diversos',
  'Radiografia da Amazônia',
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
  mi?: string;
  inom?: string;
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
  preprocessedText?: string;
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
