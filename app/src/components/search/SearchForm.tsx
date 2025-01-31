import React, { useState } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { naturalLanguageSearch } from '@/services/api';
import { 
  Paper,
  InputBase,
  IconButton,
  Box,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchForm() {
  const [query, setQuery] = useState('');
  const { setResults, setFilters, setPagination, setLoading, setError } = useSearch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoading(true);
    setError(undefined);

    try {
      const response = await naturalLanguageSearch(query);
      
      setResults(response.items);
      setFilters(response.metadata.filtrosAplicados.filtros);
      setPagination({
        total: response.metadata.total,
        pagina: response.metadata.pagina,
        limite: response.metadata.limite,
        totalPaginas: response.metadata.totalPaginas
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro na busca');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <InputBase
          sx={{ ml: 2, flex: 1 }}
          placeholder="Descreva o que você está procurando..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSubmitting}
        />
        <IconButton 
          type="submit" 
          sx={{ p: '10px' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={24} />
          ) : (
            <SearchIcon />
          )}
        </IconButton>
      </Paper>
    </Box>
  );
}