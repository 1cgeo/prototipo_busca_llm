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
  variant?: 'central' | 'drawer';
}

export default function SearchForm({ 
  onSearch,
  variant = 'central' 
}: SearchFormProps) {
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
    setBoundingBox,
    clearMapSelection
  } = useSearch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>();

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

  const formStyles = variant === 'central' ? {
    maxWidth: 800,
    mx: 'auto',
    mb: 4
  } : {
    width: '100%'
  };

  return (
    <Box sx={formStyles}>
      {/* Formulário de Busca */}
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={variant === 'central' ? 3 : 0}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          position: 'relative',
          border: theme => validationError 
            ? `1px solid ${theme.palette.error.main}` 
            : variant === 'drawer' 
              ? `1px solid ${theme.palette.divider}`
              : 'none'
        }}
      >
        <InputBase
          sx={{ ml: 2, flex: 1 }}
          placeholder="Descreva o que você está procurando..."
          value={query}
          onChange={handleQueryChange}
          disabled={isSubmitting}
          size="small"
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
          <span>
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
          </span>
        </Tooltip>
      </Paper>

      {/* Mensagens e Alertas */}
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Erro de validação */}
        <Collapse in={Boolean(validationError)}>
          <Alert 
            severity="error" 
            variant="outlined"
          >
            {validationError}
          </Alert>
        </Collapse>

        {/* Query original */}
        <Collapse in={Boolean(state.originalQuery)}>
          <Alert 
            severity="info" 
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
            variant="outlined"
            icon={<PlaceIcon />}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  if (clearMapSelection) {
                    clearMapSelection();
                  }
                  setBoundingBox(undefined);
                }}
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
            variant="outlined"
            sx={{ mt: 1 }}
          >
            <AlertTitle>Exemplos de busca</AlertTitle>
            <Box 
              component="ul" 
              sx={{ 
                m: 0, 
                pl: 2,
                listStyleType: 'none'
              }}
            >
              {SEARCH_EXAMPLES.map((example, index) => (
                <Box
                  component="li"
                  key={index}
                  sx={{
                    my: 0.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': {
                      color: 'primary.main',
                    },
                    '&::before': {
                      content: '"•"',
                      color: 'primary.main',
                      display: 'inline-block',
                      width: '1em',
                      marginLeft: '-1em'
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
    </Box>
  );
}