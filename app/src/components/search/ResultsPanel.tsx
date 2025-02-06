import { useState, useEffect } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { 
  Box, 
  Typography, 
  IconButton, 
  Button,
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  SelectChangeEvent,
  Badge,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SearchFilters from './SearchFilters';
import EmptyState from '@/components/common/EmptyState';
import ResultCard from './ResultCard';
import { getMetadata } from '@/services/api';
import type { MetadataOptions } from '@/types/search';

interface ResultsPanelProps {
  onClose: () => void;
  onNewSearch: () => void;
  onZoomTo?: (geometry: GeoJSON.Polygon) => void;
}

export default function ResultsPanel({ 
  onClose,
  onNewSearch,
  onZoomTo
}: ResultsPanelProps) {
  const { state } = useSearch();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [metadata, setMetadata] = useState<MetadataOptions | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'filters'>('results');

  // Contador de filtros ativos
  const activeFiltersCount = Object.keys(state.filters).filter(key => {
    const value = state.filters[key as keyof typeof state.filters];
    return value !== undefined && value !== null && value !== '';
  }).length;

  // Carregar metadados
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

  const handleTabChange = (_: React.SyntheticEvent, newValue: 'results' | 'filters') => {
    setActiveTab(newValue);
  };

  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    setItemsPerPage(Number(event.target.value));
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

        {/* Tabs */}
        <Tabs 
          value={activeTab}
          onChange={handleTabChange}
          sx={{ mb: 2 }}
        >
          <Tab 
            icon={<FormatListBulletedIcon />}
            iconPosition="start"
            label="Resultados" 
            value="results"
          />
          <Tab
            icon={
              <Badge 
                badgeContent={activeFiltersCount} 
                color="primary"
                invisible={activeFiltersCount === 0}
              >
                <FilterListIcon />
              </Badge>
            }
            iconPosition="start"
            label="Filtros"
            value="filters"
          />
        </Tabs>

        {/* Controles de Paginação (apenas na aba de resultados) */}
        {activeTab === 'results' && state.results.length > 10 && (
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
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        px: 2,
        py: 1
      }}>
        {activeTab === 'results' ? (
          <Stack spacing={2}>
            {state.results.map((result, index) => (
              <ResultCard
                key={`${result.name}-${index}`}
                result={result}
                onZoomTo={onZoomTo ? () => onZoomTo(result.geometry) : undefined}
              />
            ))}
          </Stack>
        ) : (
          metadata && !loadingMetadata ? (
            <SearchFilters 
              metadata={metadata}
              onSearch={() => setActiveTab('results')}
              variant="drawer"
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )
        )}
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