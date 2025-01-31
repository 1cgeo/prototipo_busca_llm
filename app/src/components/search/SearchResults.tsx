import React from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { SearchResult } from '@/types/search';
import { structuredSearch } from '@/services/api';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

function ResultCard({ result }: { result: SearchResult }) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          {result.nome}
        </Typography>
        
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {result.descricao}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2">
                Publicado em: {new Date(result.dataPublicacao).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlaceIcon fontSize="small" color="action" />
              <Typography variant="body2">
                Escala: {result.escala}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1}>
          <Chip
            label={result.tipoProduto}
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            label={result.projeto}
            color="secondary"
            variant="outlined"
            size="small"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function ResultsPagination() {
  const { state, setResults, setPagination, setLoading, setError } = useSearch();
  const { pagination, filters } = state;

  const handlePageChange = async (_event: unknown, newPage: number) => {
    setLoading(true);
    setError(undefined);

    try {
      const response = await structuredSearch(
        filters,
        { campo: 'dataPublicacao', direcao: 'DESC' },
        { pagina: newPage, limite: pagination.limite }
      );

      setResults(response.items);
      setPagination({
        total: response.metadata.total,
        pagina: newPage,
        limite: response.metadata.limite,
        totalPaginas: response.metadata.totalPaginas
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar página');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Pagination
        count={pagination.totalPaginas}
        page={pagination.pagina}
        onChange={handlePageChange}
        color="primary"
        size="large"
        showFirstButton
        showLastButton
      />
    </Box>
  );
}

export default function SearchResults() {
  const { state } = useSearch();
  const { results, loading, error } = state;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!results.length) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        Nenhum resultado encontrado
      </Alert>
    );
  }

  return (
    <Box>
      <Stack spacing={2}>
        {results.map((result) => (
          <ResultCard key={result.nome} result={result} />
        ))}
      </Stack>
      <ResultsPagination />
    </Box>
  );
}