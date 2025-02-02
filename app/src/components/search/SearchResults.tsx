import { useCallback, useMemo } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { SearchResult } from '@/types/search';
import { structuredSearch } from '@/services/api';
import EmptyState from '@/components/common/EmptyState';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Pagination,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MapIcon from '@mui/icons-material/Map';
import DescriptionIcon from '@mui/icons-material/Description';
import SortIcon from '@mui/icons-material/Sort';

function ResultCard({ result }: { result: SearchResult }) {
  const formattedDate = useMemo(() => {
    return new Date(result.publicationDate).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, [result.publicationDate]);

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          {result.name}
        </Typography>
        
        <Typography 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {result.description}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2">
                Publicado em: {formattedDate}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlaceIcon fontSize="small" color="action" />
              <Typography variant="body2">
                Escala: {result.scale}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<DescriptionIcon />}
            label={result.productType}
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<MapIcon />}
            label={result.project}
            color="secondary"
            variant="outlined"
            size="small"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function ResultsHeader() {
  const { state, setFilters } = useSearch();
  const { filters } = state;

  const handleSortFieldChange = (event: SelectChangeEvent<string>) => {
    setFilters({
      ...filters,
      sortField: event.target.value as 'publicationDate' | 'creationDate'
    });
  };

  const handleSortDirectionChange = (event: SelectChangeEvent<string>) => {
    setFilters({
      ...filters,
      sortDirection: event.target.value as 'ASC' | 'DESC'
    });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 2,
      mb: 3 
    }}>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: 'primary.main'
      }}>
        <SortIcon />
        <Typography variant="subtitle2" color="inherit">
          Ordenar por
        </Typography>
      </Box>

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Campo</InputLabel>
        <Select
          value={filters.sortField || 'publicationDate'}
          onChange={handleSortFieldChange}
          label="Campo"
        >
          <MenuItem value="publicationDate">Data de Publicação</MenuItem>
          <MenuItem value="creationDate">Data de Criação</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Direção</InputLabel>
        <Select
          value={filters.sortDirection || 'DESC'}
          onChange={handleSortDirectionChange}
          label="Direção"
        >
          <MenuItem value="DESC">Mais recente</MenuItem>
          <MenuItem value="ASC">Mais antigo</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

function ResultsPagination() {
  const { state, setResults, setPagination, setLoading, setError } = useSearch();
  const { pagination, filters, bbox } = state;

  const handlePageChange = useCallback(async (_: unknown, newPage: number) => {
    setLoading(true);
    setError(undefined);

    try {
      const response = await structuredSearch(
        filters,
        { page: newPage },
        bbox
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
  }, [filters, bbox, setResults, setPagination, setLoading, setError]);

  if (pagination.totalPages <= 1) return null;

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      mt: 4,
      pt: 2,
      borderTop: 1,
      borderColor: 'divider'
    }}>
      <Typography variant="body2" color="text.secondary">
        {pagination.total} resultados encontrados
      </Typography>

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
  );
}

export default function SearchResults() {
  const { state } = useSearch();
  const { results, loading, error, originalQuery } = state;

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
        type={originalQuery ? 'noResults' : 'initial'}
      />
    );
  }

  return (
    <Stack spacing={3}>
      <ResultsHeader />
      
      <Stack spacing={2}>
        {results.map((result, index) => (
          <ResultCard key={`${result.name}-${index}`} result={result} />
        ))}
      </Stack>

      <ResultsPagination />
    </Stack>
  );
}