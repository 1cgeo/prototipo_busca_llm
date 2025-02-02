import { useState } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { 
  Paper, 
  Box, 
  Typography, 
  IconButton, 
  Pagination, 
  Chip,
  Button,
  Stack,
  Collapse,
  Fade,
  Tooltip,
  CircularProgress,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { structuredSearch } from '@/services/api';

interface ResultsPanelProps {
  onClose: () => void;
  onNewSearch: () => void;
}

export default function ResultsPanel({ onClose, onNewSearch }: ResultsPanelProps) {
  const { state, setResults, setPagination, setLoading, setError } = useSearch();
  const [expanded, setExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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

  return (
    <Paper 
      elevation={3}
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        backgroundColor: 'background.paper'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: expanded ? 1 : 0,
        borderColor: 'divider'
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
          
          <Tooltip title={expanded ? "Minimizar" : "Expandir"}>
            <IconButton 
              size="small"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>

          <IconButton 
            size="small"
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Conteúdo */}
      <Collapse in={expanded}>
        <Box sx={{ 
          p: 2,
          maxHeight: '60vh',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {isSubmitting ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: 200
            }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
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

              {/* Paginação */}
              {state.pagination.totalPages > 1 && (
                <Box sx={{ 
                  mt: 3, 
                  pt: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  borderTop: 1,
                  borderColor: 'divider'
                }}>
                  <Pagination
                    count={state.pagination.totalPages}
                    page={state.pagination.page}
                    onChange={handlePageChange}
                    disabled={isSubmitting}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                    sx={{ 
                      '.MuiPaginationItem-root': {
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Collapse>

      {/* Indicador de BBox */}
      {state.bbox && (
        <Divider />
      )}
      {state.bbox && (
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
      )}
    </Paper>
  );
}