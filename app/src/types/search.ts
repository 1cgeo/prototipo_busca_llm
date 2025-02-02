// Enums for constrained types
export type Scale = '1:25.000' | '1:50.000' | '1:100.000' | '1:250.000';
export type ProductType = 'Carta Topográfica' | 'Carta Ortoimagem' | 'Carta Temática';
export type SupplyArea = 
  | '1° Centro de Geoinformação'
  | '2° Centro de Geoinformação'
  | '3° Centro de Geoinformação'
  | '4° Centro de Geoinformação'
  | '5° Centro de Geoinformação';

export type Project = 
  | 'Rondônia'
  | 'Amapá'
  | 'Bahia'
  | 'BECA'
  | 'Rio Grande do Sul'
  | 'Mapeamento Sistemático'
  | 'Copa do Mundo 2014'
  | 'Olimpíadas'
  | 'Copa das Confederações 2013';

export type SortField = 'publicationDate' | 'creationDate';
export type SortDirection = 'ASC' | 'DESC';

// API Error types
export type ErrorCode = 
  | 'INVALID_JSON'
  | 'VALIDATION_ERROR'
  | 'LLM_ERROR'
  | 'SEARCH_ERROR'
  | 'DATABASE_ERROR';

export interface ErrorDetails {
  field?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ApiError {
  error: string;
  code: ErrorCode;
  details?: ErrorDetails;
  originalQuery?: string;
}

// Filter value types
export type FilterValue = string | number | boolean | DateRange | BoundingBox | null;

export interface DateRange {
  start: string;
  end: string;
}

// Bounding Box interface
export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Search parameters interface
export interface SearchParams {
  keyword?: string;
  scale?: Scale;
  productType?: ProductType;
  state?: string;
  city?: string;
  supplyArea?: SupplyArea;
  project?: Project;
  publicationPeriod?: DateRange;
  creationPeriod?: DateRange;
  sortField?: SortField;
  sortDirection?: SortDirection;
  limit?: number;
}

// Search result interface
export interface SearchResult {
  name: string;
  description: string;
  scale: Scale;
  productType: ProductType;
  project: Project;
  publicationDate: string;
  creationDate: string;
  geometry: GeoJSON.Polygon;
}

// API response metadata
export interface SearchMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  originalQuery: string;
  processedQuery: SearchParams;
}

// Complete search response
export interface SearchResponse {
  items: SearchResult[];
  metadata: SearchMetadata;
}

// Available metadata options
export interface MetadataOptions {
  scales: Scale[];
  productTypes: ProductType[];
  supplyAreas: SupplyArea[];
  projects: Project[];
  sorting: {
    fields: SortField[];
    directions: SortDirection[];
  };
}

// Application state interfaces
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchState {
  results: SearchResult[];
  filters: SearchParams;
  pagination: PaginationInfo;
  loading: boolean;
  error?: string;
  originalQuery?: string;
  bbox?: BoundingBox;
}