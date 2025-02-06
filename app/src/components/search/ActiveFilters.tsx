import { useSearch } from '@/contexts/SearchContext';
import { Box, Chip, Typography } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import TuneIcon from '@mui/icons-material/Tune';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlaceIcon from '@mui/icons-material/Place';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

export default function ActiveFilters() {
  const { state, setFilters } = useSearch();
  const { filters } = state;

  const handleRemoveFilter = (field: keyof typeof filters) => {
    const newFilters = { ...filters };
    delete newFilters[field];
    setFilters(newFilters);
  };

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
        {filters.scale && (
          <Chip
            size="small"
            icon={<MapIcon />}
            label={`Escala: ${filters.scale}`}
            onDelete={() => handleRemoveFilter('scale')}
          />
        )}

        {filters.productType && (
          <Chip
            size="small"
            icon={<TuneIcon />}
            label={`Tipo: ${filters.productType}`}
            onDelete={() => handleRemoveFilter('productType')}
          />
        )}

        {filters.state && (
          <Chip
            size="small"
            icon={<PlaceIcon />}
            label={`Estado: ${filters.state}`}
            onDelete={() => handleRemoveFilter('state')}
          />
        )}

        {filters.city && (
          <Chip
            size="small"
            icon={<PlaceIcon />}
            label={`Cidade: ${filters.city}`}
            onDelete={() => handleRemoveFilter('city')}
          />
        )}

        {filters.project && (
          <Chip
            size="small"
            icon={<AccountTreeIcon />}
            label={`Projeto: ${filters.project}`}
            onDelete={() => handleRemoveFilter('project')}
          />
        )}

        {filters.supplyArea && (
          <Chip
            size="small"
            icon={<TuneIcon />}
            label={`Área: ${filters.supplyArea}`}
            onDelete={() => handleRemoveFilter('supplyArea')}
          />
        )}

        {filters.publicationPeriod && (
          <Chip
            size="small"
            icon={<CalendarTodayIcon />}
            label={`Publicação: ${new Date(filters.publicationPeriod.start).toLocaleDateString()} - ${new Date(filters.publicationPeriod.end).toLocaleDateString()}`}
            onDelete={() => handleRemoveFilter('publicationPeriod')}
          />
        )}

        {filters.creationPeriod && (
          <Chip
            size="small"
            icon={<CalendarTodayIcon />}
            label={`Criação: ${new Date(filters.creationPeriod.start).toLocaleDateString()} - ${new Date(filters.creationPeriod.end).toLocaleDateString()}`}
            onDelete={() => handleRemoveFilter('creationPeriod')}
          />
        )}
      </Box>
    </Box>
  );
}