import { createContext, useContext, useReducer, ReactNode, useState } from 'react';
import { 
  SearchState,
  SearchParams,
  SearchResult,
  PaginationInfo,
  BoundingBox
} from '@/types/search';

interface SearchContextType {
  state: SearchState;
  setResults: (results: SearchResult[]) => void;
  setFilters: (filters: SearchParams) => void;
  setPagination: (pagination: PaginationInfo) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  setOriginalQuery: (query: string) => void;
  setBoundingBox: (bbox?: BoundingBox) => void;
  clearMapSelection: (() => void) | null;
  setMapClearFunction: (fn: () => void) => void;
  reset: () => void;
}

const initialState: SearchState = {
  results: [],
  filters: {},
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  loading: false
};

type SearchAction =
  | { type: 'SET_RESULTS'; payload: SearchResult[] }
  | { type: 'SET_FILTERS'; payload: SearchParams }
  | { type: 'SET_PAGINATION'; payload: PaginationInfo }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload?: string }
  | { type: 'SET_ORIGINAL_QUERY'; payload: string }
  | { type: 'SET_BBOX'; payload?: BoundingBox }
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
      case 'SET_ORIGINAL_QUERY':
        return { ...state, originalQuery: action.payload };
      case 'SET_BBOX':
        return { ...state, bbox: action.payload };
      case 'RESET':
        return initialState;
      default:
        return state;
    }
  }

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const [clearMapSelection, setClearMapSelection] = useState<(() => void) | null>(null);

  const value = {
    state,
    setResults: (results: SearchResult[]) => 
      dispatch({ type: 'SET_RESULTS', payload: results }),
    setFilters: (filters: SearchParams) => 
      dispatch({ type: 'SET_FILTERS', payload: filters }),
    setPagination: (pagination: PaginationInfo) => 
      dispatch({ type: 'SET_PAGINATION', payload: pagination }),
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error?: string) => 
      dispatch({ type: 'SET_ERROR', payload: error }),
    setOriginalQuery: (query: string) =>
      dispatch({ type: 'SET_ORIGINAL_QUERY', payload: query }),
    setBoundingBox: (bbox?: BoundingBox) => {
      dispatch({ type: 'SET_BBOX', payload: bbox });
    },
    clearMapSelection,
    setMapClearFunction: (fn: () => void) => {
      setClearMapSelection(() => fn);
    },
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