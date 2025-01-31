import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SearchState, SearchFilters, SearchResult, PaginationInfo } from '../types/search';

interface SearchContextType {
  state: SearchState;
  setResults: (results: SearchResult[]) => void;
  setFilters: (filters: SearchFilters) => void;
  setPagination: (pagination: PaginationInfo) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  reset: () => void;
}

const initialState: SearchState = {
  results: [],
  filters: {},
  pagination: {
    total: 0,
    pagina: 1,
    limite: 10,
    totalPaginas: 0
  },
  loading: false
};

type SearchAction =
  | { type: 'SET_RESULTS'; payload: SearchResult[] }
  | { type: 'SET_FILTERS'; payload: SearchFilters }
  | { type: 'SET_PAGINATION'; payload: PaginationInfo }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload?: string }
  | { type: 'RESET' };

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_PAGINATION':
      return { ...state, pagination: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const value = {
    state,
    setResults: (results: SearchResult[]) => 
      dispatch({ type: 'SET_RESULTS', payload: results }),
    setFilters: (filters: SearchFilters) => 
      dispatch({ type: 'SET_FILTERS', payload: filters }),
    setPagination: (pagination: PaginationInfo) => 
      dispatch({ type: 'SET_PAGINATION', payload: pagination }),
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error?: string) => 
      dispatch({ type: 'SET_ERROR', payload: error }),
    reset: () => dispatch({ type: 'RESET' })
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}