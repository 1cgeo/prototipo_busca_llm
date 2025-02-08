import { useState } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { structuredSearch } from '@/services/api';
import { MetadataOptions, SearchParams } from '@/types/search';
import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SortIcon from '@mui/icons-material/Sort';

// Componentes de filtro
import FilterSection from './filters/FilterSection';
import IdentificationFilters from './filters/IdentificationFilters';
import LocationFilters from './filters/LocationFilters';
import ProjectFilters from './filters/ProjectFilters';
import DateFilters from './filters/DateFilters';
import SortingFilters from './filters/SortingFilters';

interface SearchFiltersProps {
  metadata: MetadataOptions;
  onSearch: () => void;
  variant?: 'central' | 'drawer';
}

const SECTIONS = [
  {
    id: 'identification',
    title: 'Identificação',
    icon: <FilterAltIcon fontSize="small" />,
    fields: ['keyword', 'scale', 'productType'] as const
  },
  {
    id: 'location',
    title: 'Localização',
    icon: <LocationOnIcon fontSize="small" />,
    fields: ['supplyArea', 'state', 'city'] as const
  },
  {
    id: 'project',
    title: 'Projeto',
    icon: <AccountTreeIcon fontSize="small" />,
    fields: ['project'] as const
  },
  {
    id: 'dates',
    title: 'Períodos',
    icon: <CalendarTodayIcon fontSize="small" />,
    fields: ['publicationPeriod', 'creationPeriod'] as const
  },
  {
    id: 'sorting',
    title: 'Ordenação',
    icon: <SortIcon fontSize="small" />,
    fields: ['sortField', 'sortDirection'] as const
  }
] as const;

export default function SearchFilters({ 
  metadata, 
  onSearch,
  variant = 'central'
}: SearchFiltersProps) {
  const { state, setResults, setFilters, setPagination, setLoading, setError } = useSearch();
  const [localFilters, setLocalFilters] = useState<SearchParams>(state.filters);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>('identification');

  const getActiveFiltersCount = (fields: readonly (keyof SearchParams)[]) => {
    return fields.reduce((count, field) => {
      const value = localFilters[field];
      
      if (field === 'sortDirection') return count;
      if (!value) return count;

      if (field === 'publicationPeriod' || field === 'creationPeriod') return count + 1;
      if (field === 'sortField') return count + 1;
      
      return count + 1;
    }, 0);
  };

  const handleSectionChange = (section: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? section : '');
  };

  const handleTextChange = (field: keyof SearchParams) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSelectChange = (field: keyof SearchParams) => (
    event: SelectChangeEvent<string>
  ) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: event.target.value || undefined
    }));
  };

  const handleDateChange = (field: 'start' | 'end', periodField: 'publicationPeriod' | 'creationPeriod') => (
    value: dayjs.Dayjs | null
  ) => {
    if (!value) {
      setLocalFilters(prev => {
        const newFilters = { ...prev };
        if (newFilters[periodField]) {
          delete newFilters[periodField];
        }
        return newFilters;
      });
      return;
    }

    setLocalFilters(prev => ({
      ...prev,
      [periodField]: {
        ...prev[periodField],
        [field]: value.format('YYYY-MM-DD')
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoading(true);
    setError(undefined);

    try {
      const response = await structuredSearch(
        localFilters,
        { page: 1 },
        state.bbox
      );
      
      setResults(response.items);
      setFilters(localFilters);
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

  const clearFilters = () => {
    setLocalFilters({});
  };

  const renderFilterSection = (section: typeof SECTIONS[number]) => {
    const components = {
      identification: IdentificationFilters,
      location: LocationFilters,
      project: ProjectFilters,
      dates: DateFilters,
      sorting: SortingFilters
    };

    const Component = components[section.id as keyof typeof components];
    
    return (
      <Component
        filters={localFilters}
        metadata={metadata}
        onTextChange={handleTextChange}
        onSelectChange={handleSelectChange}
        onDateChange={handleDateChange}
      />
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: variant === 'drawer' ? '100%' : 'auto'
        }}
      >
        <Box sx={{ 
          flex: variant === 'drawer' ? '1 1 auto' : 'none',
          overflowY: variant === 'drawer' ? 'auto' : 'visible'
        }}>
          {SECTIONS.map((section) => (
            <FilterSection
              key={section.id}
              id={section.id}
              title={section.title}
              icon={section.icon}
              activeFilters={getActiveFiltersCount(section.fields)}
              expanded={expandedSection === section.id}
              onChange={handleSectionChange}
            >
              <Stack spacing={2}>
                {renderFilterSection(section)}
              </Stack>
            </FilterSection>
          ))}
        </Box>

        <Box sx={{ 
          mt: 2,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1
        }}>
          <Button
            variant="outlined"
            onClick={clearFilters}
            startIcon={<ClearIcon />}
            disabled={isSubmitting}
            size="small"
          >
            Limpar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <SearchIcon />}
            disabled={isSubmitting}
            size="small"
          >
            Buscar
          </Button>
        </Box>

        {state.bbox && (
          <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
            A busca será limitada à área selecionada no mapa
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
}