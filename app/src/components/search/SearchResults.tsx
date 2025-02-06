import { useCallback } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { structuredSearch } from '@/services/api';
import EmptyState from '@/components/common/EmptyState';
import ResultCard from './ResultCard';
import {
  Box,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Pagination,
  Typography,
} from '@mui/material';

interface SearchResultsProps {
  onZoomTo: (geometry: GeoJSON.Polygon) => void;
}

export default function SearchResults({ onZoomTo }: SearchResultsProps) {
  const { state, setResults, setPagination, setLoading, setError } = useSearch();
  const { results, loading, error, pagination } = state;

  const handlePageChange = useCallback(async (_: unknown, newPage: number) => {
    setLoading(true);
    setError(undefined);

    try {
      const response = await structuredSearch(
        state.filters,
        { page: newPage },
        state.bbox
      );

      setResults(response.items);
      setPagination({
        total: response.metadata.total,
        page: newPage,
        limit: response.metadata.limit,
        totalPages: response.metadata.totalPages
      });

      // Scroll para o topo dos resultados
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar página');
    } finally {
      setLoading(false);
    }
  }, [state.filters, state.bbox, setResults, setPagination, setLoading, setError]);

  const handleItemsPerPageChange = async (event: SelectChangeEvent<number>) => {
    const newLimit = Number(event.target.value);
    setLoading(true);
    
    try {
      // Primeiro atualiza a paginação local
      const newPagination = {
        ...pagination,
        limit: newLimit,
        page: 1,
        totalPages: Math.ceil(pagination.total / newLimit)
      };
      setPagination(newPagination);

      // Então busca os novos resultados
      const response = await structuredSearch(
        state.filters,
        { page: 1 }, // A API irá usar o limite padrão ou o configurado no backend
        state.bbox
      );

      setResults(response.items);
      // Atualiza a paginação com os dados reais da resposta
      setPagination({
        total: response.metadata.total,
        page: response.metadata.page,
        limit: response.metadata.limit,
        totalPages: response.metadata.totalPages
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao alterar limite por página');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 200 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <EmptyState 
        type="error"
        description={error}
      />
    );
  }

  if (!results.length) {
    return (
      <EmptyState 
        type={state.originalQuery ? 'noResults' : 'initial'}
      />
    );
  }

  return (
    <Stack spacing={3}>
      {/* Controles de Paginação */}
      {results.length > 10 && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 2,
          mb: 2
        }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Por página</InputLabel>
            <Select
              value={pagination.limit}
              onChange={handleItemsPerPageChange}
              label="Por página"
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            {pagination.total} resultados
          </Typography>
        </Box>
      )}
      
      {/* Lista de Resultados */}
      <Stack spacing={2}>
        {results.map((result, index) => (
          <ResultCard
            key={`${result.name}-${index}`}
            result={result}
            onZoomTo={onZoomTo}
          />
        ))}
      </Stack>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          mt: 2,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="medium"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Stack>
  );
}