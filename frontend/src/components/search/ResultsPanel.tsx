import { useState, useEffect, useRef } from 'react';
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
import ClearIcon from '@mui/icons-material/Clear';
import { structuredSearch } from '@/services/api';
import SearchFilters from './SearchFilters';
import EmptyState from '@/components/common/EmptyState';
import ResultCard from './ResultCard';
import ActiveFilters from './ActiveFilters';
import PaginationControls from './PaginationControls';
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
    const { state, reset, setPagination, setResults, setError, setLoading, setBoundingBox, clearMapSelection } = useSearch();
    const [metadata, setMetadata] = useState<MetadataOptions | null>(null);
    const [loadingMetadata, setLoadingMetadata] = useState(false);
    const [activeTab, setActiveTab] = useState<'results' | 'filters'>('results');
    const prevBboxRef = useRef(state.bbox);

    const { pagination, bbox, filters } = state;

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

    // Efeito para atualizar resultados quando mudar o bbox
    useEffect(() => {
        const isBboxDifferent = JSON.stringify(prevBboxRef.current) !== JSON.stringify(state.bbox);
        
        const executeSearch = async () => {
          setLoading(true);
          try {
            const response = await structuredSearch(
              state.filters,
              { page: 1 }, // Volta para primeira página quando muda o bbox
              state.bbox
            );
    
            setResults(response.items);
            setPagination({
              ...response.metadata,
              limit: pagination.limit
            });
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Erro ao atualizar resultados');
          } finally {
            setLoading(false);
          }
        };
    
        if (state.results.length > 0 && isBboxDifferent) {
          executeSearch();
          prevBboxRef.current = state.bbox;
        }
    }, [
        state.bbox,
        state.filters,
        pagination.limit,
        state.results.length,
        setResults,
        setPagination,
        setLoading,
        setError
    ]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: 'results' | 'filters') => {
        setActiveTab(newValue);
    };

    const handleNewSearch = () => {
        if (clearMapSelection) {
            clearMapSelection();
        }
        setBoundingBox(undefined);
        reset();
        onNewSearch();
    };

    const handlePageChange = async (newPage: number) => {
        setLoading(true);
        try {
            const response = await structuredSearch(
                {...filters, limit: pagination.limit},
                { page: newPage },
                bbox
            );

            setResults(response.items);
            setPagination({
                ...response.metadata,
                limit: pagination.limit,
                page: newPage
            });
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Erro ao atualizar resultados');
        } finally {
            setLoading(false);
        }
    };

    const handleLimitChange = async (newLimit: number) => {
        setLoading(true);
        try {
            const response = await structuredSearch(
                {...filters, limit: newLimit},
                { page: 1 },
                bbox
            );

            setResults(response.items);
            setPagination({
                ...response.metadata,
                limit: newLimit
            });
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Erro ao atualizar resultados');
        } finally {
            setLoading(false);
        }
    };

    // Contador de filtros ativos
    const activeFiltersCount = Object.entries(state.filters).reduce((count, [key, value]) => {
        if (key === 'sortDirection' || key === 'limit') return count;
        if (!value) return count;
        if (key === 'sortField') return count + 1;
        return count + 1;
    }, 0);

    const handleClearBbox = async () => {
        if (clearMapSelection) {
            clearMapSelection();
        }
        setBoundingBox(undefined);
        setLoading(true);
      
        try {
            const response = await structuredSearch(
                filters,
                { page: 1 },
                undefined
            );
      
            setResults(response.items);
            setPagination({
                ...response.metadata,
                limit: pagination.limit
            });
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Erro ao atualizar resultados');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderLeft: 1,
            borderColor: 'divider',
            boxShadow: 2
        }}>
            {/* Header - Fixo */}
            <Box sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: theme => theme.palette.mode === 'dark' 
                    ? 'background.default'
                    : 'grey.50'
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
                            label={`${pagination.total} encontrados`}
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

                <ActiveFilters />

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

            {/* Content - Scrollável */}
            <Box sx={{
                flex: 1,
                minHeight: 0, // Importante para permitir scroll
                overflowY: 'auto',
                px: 2,
                py: 1
            }}>
                {activeTab === 'results' ? (
                    state.results.length > 0 ? (
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
                        <EmptyState
                            type="noResults"
                            sx={{ bgcolor: 'transparent' }}
                        />
                    )
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

            {/* Footer - Fixo */}
            {activeTab === 'results' && (
                <Box sx={{ 
                    borderTop: 1, 
                    borderColor: 'divider',
                    bgcolor: theme => theme.palette.mode === 'dark' 
                        ? 'background.default'
                        : 'grey.50'
                }}>
                    {/* Paginação */}
                    <Box sx={{ px: 2 }}>
                        <PaginationControls
                            pagination={pagination}
                            disabled={state.loading}
                            onPageChange={handlePageChange}
                            onLimitChange={handleLimitChange}
                        />
                    </Box>

                    {/* BBox Alert */}
                    {bbox && (
                        <>
                            <Divider />
                            <Box sx={{ p: 2 }}>
                                <Box sx={{
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    fontSize: '0.875rem',
                                    py: 1,
                                    px: 2,
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>Resultados filtrados pela área selecionada no mapa</span>
                                    <Button
                                        size="small"
                                        color="inherit"
                                        onClick={handleClearBbox}
                                        startIcon={<ClearIcon />}
                                        sx={{ ml: 2 }}
                                    >
                                        Limpar
                                    </Button>
                                </Box>
                            </Box>
                        </>
                    )}
                </Box>
            )}
        </Box>
    );
}