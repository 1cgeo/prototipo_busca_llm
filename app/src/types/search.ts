export interface SearchResult {
    nome: string;
    descricao: string;
    escala: '1:25.000' | '1:50.000' | '1:100.000' | '1:250.000';
    tipoProduto: 'Carta Topografica' | 'Carta Ortoimagem' | 'Carta Tematica';
    projeto: string;
    dataPublicacao: string;
    dataCriacao: string;
    geometry: any; // GeoJSON Polygon
  }
  
  export interface SearchFilters {
    palavraChave?: string;
    escala?: '1:25.000' | '1:50.000' | '1:100.000' | '1:250.000';
    tipoProduto?: 'Carta Topografica' | 'Carta Ortoimagem' | 'Carta Tematica';
    estado?: string;
    municipio?: string;
    areaSuprimento?: string;
    projeto?: string;
    periodoPublicacao?: {
      inicio: string;
      fim: string;
    };
    periodoCriacao?: {
      inicio: string;
      fim: string;
    };
    bbox?: {
      norte: number;
      sul: number;
      leste: number;
      oeste: number;
    };
  }
  
  export interface SearchMetadata {
    escalas: string[];
    tiposProduto: string[];
    areasSuprimento: string[];
    projetos: string[];
    ordenacao: {
      campos: string[];
      direcoes: string[];
    };
  }
  
  export interface PaginationInfo {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }
  
  export interface SearchState {
    results: SearchResult[];
    filters: SearchFilters;
    pagination: PaginationInfo;
    loading: boolean;
    error?: string;
  }