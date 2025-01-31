// src/types/api.ts
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
  
  // Requisição inicial com linguagem natural
  export interface NaturalLanguageRequest {
    query: string;
  }
  
  // Requisição para navegação/paginação
  export interface StructuredSearchRequest {
    filtros: {
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
    };
    ordenacao: {
      campo: 'dataPublicacao' | 'dataCriacao';
      direcao: 'ASC' | 'DESC';
    };
    paginacao: {
      pagina: number;
      limite: number;
    };
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    metadata: {
      total: number;
      pagina: number;
      limite: number;
      totalPaginas: number;
      filtrosAplicados: StructuredSearchRequest;
    };
  }