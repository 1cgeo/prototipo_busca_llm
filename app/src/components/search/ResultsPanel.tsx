import { useState, useEffect } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { 
  Box, 
  Typography, 
  Button,
  Chip,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SearchFilters from './SearchFilters';
import EmptyState from '@/components/common/EmptyState';
import ResultCard from './ResultCard';
import ActiveFilters from './ActiveFilters';
import { getMetadata } from '@/services/api';
import type { MetadataOptions } from '@/types/search';

interface ResultsPanelProps {
  onNewSearch: () => void;
  onZoomTo?: (geometry: GeoJSON.Polygon) => void;
}

export default function ResultsPanel({ 
  onNewSearch,
  onZoomTo
}: ResultsPanelProps) {
  const { state, reset } = useSearch();
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'results' | 'filters') => {
    setActiveTab(newValue);
  };

  const handleNewSearch = () => {
    reset(); // Limpa os resultados e filtros
    onNewSearch(); // Chama a função do AppLayout que controla a visibilidade dos painéis
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
              onClick={handleNewSearch}
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

          <Button
            size="small"
            startIcon={<SearchIcon />}
            onClick={handleNewSearch}
          >
            Nova Busca
          </Button>
        </Box>

        {/* Active Filters Summary */}
        <ActiveFilters />

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
            <Box sx={{ height: '100%' }}>
              <SearchFilters 
                metadata={metadata}
                onSearch={() => setActiveTab('results')}
                variant="drawer"
              />
            </Box>
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