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
    Pagination,
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { structuredSearch } from '@/services/api';
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

// Limites padrão caso a API não forneça
const DEFAULT_LIMITS = [10, 20, 50];

export default function ResultsPanel({
    onNewSearch,
    onZoomTo
}: ResultsPanelProps) {
    const { state, reset, setPagination, setResults, setError, setLoading } = useSearch();
    const [metadata, setMetadata] = useState<MetadataOptions | null>(null);
    const [loadingMetadata, setLoadingMetadata] = useState(false);
    const [activeTab, setActiveTab] = useState<'results' | 'filters'>('results');

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

    const handleTabChange = (_event: React.SyntheticEvent, newValue: 'results' | 'filters') => {
        setActiveTab(newValue);
    };

    const handleNewSearch = () => {
        reset();
        onNewSearch();
    };

    // Handler para mudança de limite por página
    const handleLimitChange = async (event: SelectChangeEvent<number>) => {
        const newLimit = Number(event.target.value);
        setLoading(true);

        try {
            // Faz nova requisição com o novo limite
            const response = await structuredSearch(
              {...filters, limit: newLimit},
                { page: 1 }, // Volta para primeira página e usa o novo limite
                bbox
            );

            setResults(response.items);
            setPagination({
                ...response.metadata,
                limit: newLimit // Garante que usamos o limite selecionado
            });
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Erro ao atualizar resultados');
        } finally {
            setLoading(false);
        }
    };

    // Contador de filtros ativos
    const activeFiltersCount = Object.entries(state.filters).reduce((count, [key, value]) => {
        // Ignorar campos que não são filtros
        if (key === 'sortDirection' || key === 'limit') {
            return count;
        }

        if (value === undefined || value === null || value === '') {
            return count;
        }

        // Se tem sortField, conta como um único filtro (inclui direction)
        if (key === 'sortField') {
            return count + 1;
        }

        return count + 1;
    }, 0);

    // Calcular range de itens exibidos
    const startItem = ((pagination.page - 1) * pagination.limit) + 1;
    const endItem = Math.min(startItem + pagination.limit - 1, pagination.total);

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

            {/* Footer */}
            <Box sx={{ px: 2, py: 1 }}>
                {/* Paginação */}
                {activeTab === 'results' && pagination.totalPages > 1 && (
                    <>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <Select
                                        value={pagination.limit}
                                        onChange={handleLimitChange}
                                        size="small"
                                    >
                                        {(() => {
                                            // Garantir que temos um array de limites não vazio
                                            const availableLimits = pagination.availableLimits?.length
                                                ? pagination.availableLimits
                                                : DEFAULT_LIMITS;

                                            // Criar um Set com os limites disponíveis + limite atual
                                            const limitSet = new Set([...availableLimits, pagination.limit]);

                                            // Converter para array e ordenar
                                            return Array.from(limitSet)
                                                .sort((a, b) => a - b)
                                                .map(limit => (
                                                    <MenuItem key={limit} value={limit}>
                                                        {limit} por página
                                                    </MenuItem>
                                                ));
                                        })()}
                                    </Select>
                                </FormControl>
                                <Typography variant="body2" color="text.secondary">
                                    {startItem}-{endItem} de {pagination.total}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    count={pagination.totalPages}
                                    page={pagination.page}
                                    onChange={async (_event, newPage) => {
                                        setLoading(true); // Indicar que está carregando

                                        try {
                                            const response = await structuredSearch(
                                                {...filters, limit: pagination.limit},
                                                { page: newPage},
                                                bbox
                                            );

                                            setResults(response.items);
                                            setPagination({
                                                ...response.metadata,
                                                limit: pagination.limit, // Manter o limite atual
                                                page: newPage // Atualizar a página no estado
                                            });
                                        } catch (error) {
                                            setError(error instanceof Error ? error.message : 'Erro ao atualizar resultados');
                                        } finally {
                                            setLoading(false); // Parar de indicar carregamento
                                        }
                                    }}
                                    color="primary"
                                    size="medium"
                                    showFirstButton
                                    showLastButton
                                    siblingCount={1}
                                />
                            </Box>
                        </Box>
                    </>
                )}

                {/* BBox Alert */}
                {bbox && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            fontSize: '0.875rem',
                            textAlign: 'center',
                            py: 1,
                            px: 2,
                            borderRadius: 1
                        }}>
                            Resultados filtrados pela área selecionada no mapa
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}