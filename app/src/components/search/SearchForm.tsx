import { useState, useCallback } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { naturalLanguageSearch } from '@/services/api';
import debounce from 'lodash/debounce';
import { 
  Paper,
  InputBase,
  IconButton,
  Box,
  CircularProgress,
  Typography,
  Collapse,
  Tooltip,
  Alert,
  AlertTitle,
  Button,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ClearIcon from '@mui/icons-material/Clear';
import PlaceIcon from '@mui/icons-material/Place';

const SEARCH_EXAMPLES = [
  'Cartas topográficas do Rio de Janeiro em escala 1:25.000',
  'Mapas da região metropolitana de São Paulo publicados em 2023',
  'Dados cartográficos do projeto Copa do Mundo 2014',
  'Cartas do estado da Bahia em escala 1:50.000 criadas após 2020',
] as const;

const validateQuery = (text: string): string | undefined => {
  if (text.length < 5) {
    return 'A busca deve ter pelo menos 5 caracteres';
  }
  if (text.length > 500) {
    return 'A busca deve ter no máximo 500 caracteres';
  }
  return undefined;
};

interface SearchFormProps {
  onSearch: () => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const { 
    setResults, 
    setFilters, 
    setPagination, 
    setLoading, 
    setError,
    setOriginalQuery,
    state,
    setBoundingBox 
  } = useSearch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>();

  // Validação com debounce
  const debouncedValidation = useCallback(
    (text: string) => {
      setValidationError(validateQuery(text));
    },
    []
  );

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debounce(debouncedValidation, 300)(newQuery);
  }, [debouncedValidation]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setValidationError(undefined);
    setShowExamples(false);
  }, []);

  const handleExampleClick = useCallback((example: string) => {
    setQuery(example);
    setValidationError(undefined);
    setShowExamples(false);
  }, []);

  const clearBoundingBox = useCallback(() => {
    setBoundingBox(undefined);
  }, [setBoundingBox]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const error = validateQuery(query);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setError(undefined);
    setValidationError(undefined);
    setOriginalQuery(query);
    setShowExamples(false);

    try {
      const response = await naturalLanguageSearch(query, state.bbox);
      
      setResults(response.items);
      setFilters(response.metadata.processedQuery);
      setPagination({
        total: response.metadata.total,
        page: response.metadata.page,
        limit: response.metadata.limit,
        totalPages: response.metadata.totalPages
      });

      onSearch();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro na busca');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
      {/* Formulário de Busca */}
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={3}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          position: 'relative',
          border: theme => validationError 
            ? `1px solid ${theme.palette.error.main}` 
            : 'none'
        }}
      >
        <InputBase
          sx={{ ml: 2, flex: 1 }}
          placeholder="Descreva o que você está procurando..."
          value={query}
          onChange={handleQueryChange}
          disabled={isSubmitting}
          inputProps={{
            'aria-label': 'busca em linguagem natural',
            maxLength: 500,
            minLength: 5
          }}
        />

        {query && (
          <Tooltip title="Limpar busca">
            <IconButton 
              size="small"
              onClick={clearSearch}
              sx={{ mr: 0.5 }}
            >
              <ClearIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Ver exemplos de busca">
          <IconButton 
            size="small" 
            onClick={() => setShowExamples(!showExamples)}
            sx={{ mr: 0.5 }}
          >
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title="Buscar">
          <IconButton 
            type="submit" 
            sx={{ p: '10px' }}
            disabled={isSubmitting || Boolean(validationError)}
            aria-label="buscar"
            color="primary"
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : (
              <SearchIcon />
            )}
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Mensagem de erro de validação */}
      <Collapse in={Boolean(validationError)}>
        <Alert 
          severity="error" 
          sx={{ mt: 1 }}
          variant="outlined"
        >
          {validationError}
        </Alert>
      </Collapse>

      {/* Query original */}
      <Collapse in={Boolean(state.originalQuery)}>
        <Alert 
          severity="info" 
          sx={{ mt: 1 }}
          variant="outlined"
        >
          <AlertTitle>Última busca realizada</AlertTitle>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {state.originalQuery}
          </Typography>
        </Alert>
      </Collapse>

      {/* Alerta de BBox */}
      <Collapse in={Boolean(state.bbox)}>
        <Alert 
          severity="info" 
          sx={{ mt: 1 }}
          variant="outlined"
          icon={<PlaceIcon />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={clearBoundingBox}
              startIcon={<ClearIcon />}
            >
              Limpar
            </Button>
          }
        >
          Busca será limitada à área selecionada no mapa
        </Alert>
      </Collapse>

      {/* Exemplos de busca */}
      <Collapse in={showExamples}>
        <Alert 
          severity="info" 
          sx={{ mt: 2 }}
          variant="outlined"
        >
          <AlertTitle>Exemplos de busca</AlertTitle>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {SEARCH_EXAMPLES.map((example, index) => (
              <Box
                component="li"
                key={index}
                sx={{
                  my: 0.5,
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </Box>
            ))}
          </Box>
        </Alert>
      </Collapse>
    </Box>
  );
}