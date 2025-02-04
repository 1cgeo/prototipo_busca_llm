import { useState } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { 
  Box, 
  Typography, 
  IconButton, 
  Button,
  Stack,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Paper,
  Fade,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchFilters from './SearchFilters';
import EmptyState from '@/components/common/EmptyState';
import { structuredSearch, getMetadata } from '@/services/api';
import { useEffect } from 'react';
import type { MetadataOptions } from '@/types/search';

interface ResultsPanelProps {
  onClose: () => void;
  onNewSearch: () => void;
}

export default function ResultsPanel({ onClose, onNewSearch }: ResultsPanelProps) {
  const { state, setResults, setPagination, setLoading, setError } = useSearch();
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('results');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [metadata, setMetadata] = useState<MetadataOptions | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  // Carregar metadados ao montar o componente
  useEffect(() => {
    const loadMetadata = async () => {
      if (!metadata) {
        setLoadingMetadata(true);
        try {
          const data = await getMetadata();
          setMetadata(data);
        } catch (error) {
          console.error('Erro ao carregar metadados:', error);
        } finally {
          setLoadingMetadata(false);
        }
      }
    };

    loadMetadata();
  }, [metadata]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleAccordionChange = (panel: string) => (
    _: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const handlePageChange = async (_: unknown, page: number) => {
    setIsSubmitting(true);
    setLoading(true);
    
    try {
      const response = await structuredSearch(
        state.filters,
        { page },
        state.bbox
      );

      setResults(response.items);
      setPagination({
        total: response.metadata.total,
        page: response.metadata.page,
        limit: response.metadata.limit,
        totalPages: response.metadata.totalPages
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar página');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    const newLimit = Number(event.target.value);
    setItemsPerPage(newLimit);
    
    // Recarregar resultados com novo limite
    if (state.filters) {
      handlePageChange(null, 1); // Reset para primeira página com novo limite
    }
  };

  const handleFilterSearch = () => {
    setExpandedAccordion('results');
  };

  if (!state.results.length) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState 
          type={state.originalQuery ? 'noResults' : 'initial'}
          action={
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={onNewSearch}
            >
              Nova Busca
            </Button>
          }
        />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Resultados da Busca
            </Typography>
            <Chip 
              label={`${state.pagination.total} encontrados`}
              size="small"
              color="primary"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              startIcon={<SearchIcon />}
              onClick={onNewSearch}
            >
              Nova Busca
            </Button>
            
            <IconButton 
              size="small"
              onClick={onClose}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 2
        }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Por página</InputLabel>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              label="Por página"
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>

          <Pagination
            count={state.pagination.totalPages}
            page={state.pagination.page}
            onChange={handlePageChange}
            size="small"
            disabled={isSubmitting}
          />
        </Box>
      </Box>

      {/* Conteúdo com Acordeões */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        px: 2,
        py: 1
      }}>
        {/* Acordeão de Filtros */}
        <Accordion
          expanded={expandedAccordion === 'filters'}
          onChange={handleAccordionChange('filters')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Filtros Avançados</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {metadata && !loadingMetadata ? (
              <SearchFilters 
                metadata={metadata}
                onSearch={handleFilterSearch}
                variant="drawer"
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Acordeão de Resultados */}
        <Accordion
          expanded={expandedAccordion === 'results'}
          onChange={handleAccordionChange('results')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Resultados</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {isSubmitting ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                py: 4
              }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={2}>
                {state.results.map((result, index) => (
                  <Fade 
                    key={`${result.name}-${index}`}
                    in={true}
                    timeout={300 + index * 100}
                  >
                    <Paper 
                      elevation={1}
                      sx={{ 
                        p: 2,
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {result.name}
                      </Typography>
                      
                      <Typography 
                        color="text.secondary" 
                        paragraph
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {result.description}
                      </Typography>

                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={result.scale} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={result.productType}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                          <Chip 
                            label={result.project}
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        </Box>

                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          color: 'text.secondary',
                          fontSize: '0.875rem'
                        }}>
                          <CalendarTodayIcon fontSize="small" />
                          <Typography variant="body2">
                            Publicado em: {formatDate(result.publicationDate)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Fade>
                ))}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Footer com BBox */}
      {state.bbox && (
        <>
          <Divider />
          <Box sx={{ 
            px: 2, 
            py: 1,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            Resultados filtrados pela área selecionada no mapa
          </Box>
        </>
      )}
    </Box>
  );
}