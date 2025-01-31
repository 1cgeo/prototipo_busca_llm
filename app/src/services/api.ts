import { SearchFilters, SearchMetadata, SearchResult } from '../types/search';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function naturalLanguageSearch(query: string) {
  const response = await fetch(`${API_URL}/natural-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro na busca');
  }

  return response.json();
}

export async function structuredSearch(
  filters: SearchFilters,
  ordenacao: { campo: string; direcao: string },
  paginacao: { pagina: number; limite: number }
) {
  const response = await fetch(`${API_URL}/structured-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filtros: filters,
      ordenacao,
      paginacao,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro na busca');
  }

  return response.json();
}

export async function getMetadata(): Promise<SearchMetadata> {
  const response = await fetch(`${API_URL}/metadata`);

  if (!response.ok) {
    throw new Error('Erro ao carregar metadados');
  }

  return response.json();
}