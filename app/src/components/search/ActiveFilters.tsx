import { useSearch } from '@/contexts/SearchContext';
import { Box, Chip, Typography } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import TuneIcon from '@mui/icons-material/Tune';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlaceIcon from '@mui/icons-material/Place';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';

export default function ActiveFilters() {
  const { state } = useSearch();
  const { filters } = state;

  // Check if there are any active filters
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Filtros ativos
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {/* Palavra-chave */}
        {filters.keyword && (
          <Chip
            size="small"
            icon={<SearchIcon />}
            label={`Busca: ${filters.keyword}`}
          />
        )}

        {/* Escala */}
        {filters.scale && (
          <Chip
            size="small"
            icon={<MapIcon />}
            label={`Escala: ${filters.scale}`}
          />
        )}

        {/* Tipo de Produto */}
        {filters.productType && (
          <Chip
            size="small"
            icon={<TuneIcon />}
            label={`Tipo: ${filters.productType}`}
          />
        )}

        {/* Estado */}
        {filters.state && (
          <Chip
            size="small"
            icon={<PlaceIcon />}
            label={`Estado: ${filters.state}`}
          />
        )}

        {/* Cidade */}
        {filters.city && (
          <Chip
            size="small"
            icon={<PlaceIcon />}
            label={`Cidade: ${filters.city}`}
          />
        )}

        {/* Projeto */}
        {filters.project && (
          <Chip
            size="small"
            icon={<AccountTreeIcon />}
            label={`Projeto: ${filters.project}`}
          />
        )}

        {/* Área de Suprimento */}
        {filters.supplyArea && (
          <Chip
            size="small"
            icon={<TuneIcon />}
            label={`Área: ${filters.supplyArea}`}
          />
        )}

        {/* Período de Publicação */}
        {filters.publicationPeriod && (
          <Chip
            size="small"
            icon={<CalendarTodayIcon />}
            label={`Publicação: ${new Date(filters.publicationPeriod.start).toLocaleDateString()} - ${new Date(filters.publicationPeriod.end).toLocaleDateString()}`}
          />
        )}

        {/* Período de Criação */}
        {filters.creationPeriod && (
          <Chip
            size="small"
            icon={<CalendarTodayIcon />}
            label={`Criação: ${new Date(filters.creationPeriod.start).toLocaleDateString()} - ${new Date(filters.creationPeriod.end).toLocaleDateString()}`}
          />
        )}

        {/* Ordenação (campo + direção como um único chip) */}
        {filters.sortField && (
          <Chip
            size="small"
            icon={<SortIcon />}
            label={`Ordenar por: ${
              filters.sortField === 'publicationDate' ? 'Data de Publicação' : 'Data de Criação'
            } (${
              filters.sortDirection === 'DESC' ? 'Mais recente' : 'Mais antigo'
            })`}
          />
        )}
      </Box>
    </Box>
  );
}