import { 
  SearchParams, 
  SearchResponse, 
  MetadataOptions, 
  BoundingBox,
  ApiError
} from '@/types/search';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json() as ApiError;
    throw new Error(error.error || 'An error occurred');
  }
  return response.json() as Promise<T>;
}

export async function naturalLanguageSearch(
  query: string, 
  bbox?: BoundingBox
): Promise<SearchResponse> {
  const response = await fetch(`${API_URL}/natural-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, bbox }),
  });

  return handleResponse<SearchResponse>(response);
}

export async function structuredSearch(
  searchParams: SearchParams,
  pagination: { page: number },
  bbox?: BoundingBox
): Promise<SearchResponse> {
  const response = await fetch(`${API_URL}/structured-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      searchParams,
      bbox,
      pagination
    }),
  });

  return handleResponse<SearchResponse>(response);
}

export async function getMetadata(): Promise<MetadataOptions> {
  const response = await fetch(`${API_URL}/metadata`);
  return handleResponse<MetadataOptions>(response);
}