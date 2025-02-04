import { useState } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { structuredSearch } from '@/services/api';
import { MetadataOptions, SearchParams } from '@/types/search';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Typography,
  SelectChangeEvent,
  Alert,
  Stack,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

dayjs.locale('pt-br');

interface FilterSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const FILTER_SECTIONS: FilterSection[] = [
  { 
    id: 'identification', 
    title: 'Identificação',
    icon: <FilterAltIcon fontSize="small" />
  },
  { 
    id: 'location', 
    title: 'Localização',
    icon: <LocationOnIcon fontSize="small" />
  },
  { 
    id: 'project', 
    title: 'Projeto',
    icon: <AccountTreeIcon fontSize="small" />
  },
  { 
    id: 'dates', 
    title: 'Períodos',
    icon: <CalendarTodayIcon fontSize="small" />
  }
];

interface FilterSectionProps {
  section: FilterSection;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSectionComponent({ 
  section, 
  isExpanded, 
  onToggle, 
  children 
}: FilterSectionProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1,
          px: 2,
          borderRadius: 1,
          bgcolor: theme => theme.palette.action.hover,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: theme => theme.palette.action.selected,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {section.icon}
          <Typography variant="subtitle2" color="primary">
            {section.title}
          </Typography>
        </Box>
        <IconButton size="small" sx={{ p: 0 }}>
          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>
      
      <Box sx={{ 
        display: isExpanded ? 'block' : 'none',
        mt: 2,
        px: 2
      }}>
        {children}
      </Box>
    </Box>
  );
}

interface SearchFiltersProps {
  metadata: MetadataOptions;
  onSearch: () => void;
  variant?: 'central' | 'drawer';
}

export default function SearchFilters({ 
  metadata, 
  onSearch,
  variant = 'central'
}: SearchFiltersProps) {
  const { state, setResults, setFilters, setPagination, setLoading, setError } = useSearch();
  const [localFilters, setLocalFilters] = useState<SearchParams>(state.filters);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>('identification');

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? '' : sectionId);
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{
          height: variant === 'drawer' ? 'calc(100vh - 200px)' : 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Área Scrollável */}
        <Box sx={{ 
          flex: 1,
          overflowY: 'auto',
          pr: 2,
          mr: -2,
          pb: 2
        }}>
          {/* Identificação */}
          <FilterSectionComponent
            section={FILTER_SECTIONS[0]}
            isExpanded={expandedSection === 'identification'}
            onToggle={() => handleSectionToggle('identification')}
          >
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Palavra-chave"
                value={localFilters.keyword || ''}
                onChange={handleTextChange('keyword')}
                placeholder="Busque por palavras-chave..."
                size="small"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Escala</InputLabel>
                <Select
                  value={localFilters.scale || ''}
                  onChange={handleSelectChange('scale')}
                  label="Escala"
                >
                  <MenuItem value="">
                    <em>Qualquer</em>
                  </MenuItem>
                  {metadata.scales.map(scale => (
                    <MenuItem key={scale} value={scale}>
                      {scale}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Produto</InputLabel>
                <Select
                  value={localFilters.productType || ''}
                  onChange={handleSelectChange('productType')}
                  label="Tipo de Produto"
                >
                  <MenuItem value="">
                    <em>Qualquer</em>
                  </MenuItem>
                  {metadata.productTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </FilterSectionComponent>

          {/* Localização */}
          <FilterSectionComponent
            section={FILTER_SECTIONS[1]}
            isExpanded={expandedSection === 'location'}
            onToggle={() => handleSectionToggle('location')}
          >
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Área de Suprimento</InputLabel>
                <Select
                  value={localFilters.supplyArea || ''}
                  onChange={handleSelectChange('supplyArea')}
                  label="Área de Suprimento"
                >
                  <MenuItem value="">
                    <em>Qualquer</em>
                  </MenuItem>
                  {metadata.supplyAreas.map(area => (
                    <MenuItem key={area} value={area}>
                      {area}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Estado"
                value={localFilters.state || ''}
                onChange={handleTextChange('state')}
                size="small"
              />
              <TextField
                fullWidth
                label="Município"
                value={localFilters.city || ''}
                onChange={handleTextChange('city')}
                size="small"
              />
            </Stack>
          </FilterSectionComponent>

          {/* Projeto */}
          <FilterSectionComponent
            section={FILTER_SECTIONS[2]}
            isExpanded={expandedSection === 'project'}
            onToggle={() => handleSectionToggle('project')}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Projeto</InputLabel>
              <Select
                value={localFilters.project || ''}
                onChange={handleSelectChange('project')}
                label="Projeto"
              >
                <MenuItem value="">
                  <em>Qualquer</em>
                </MenuItem>
                {metadata.projects.map(project => (
                  <MenuItem key={project} value={project}>
                    {project}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FilterSectionComponent>

          {/* Períodos */}
          <FilterSectionComponent
            section={FILTER_SECTIONS[3]}
            isExpanded={expandedSection === 'dates'}
            onToggle={() => handleSectionToggle('dates')}
          >
            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Período de Publicação
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Data Inicial"
                      value={localFilters.publicationPeriod?.start ? dayjs(localFilters.publicationPeriod.start) : null}
                      onChange={handleDateChange('start', 'publicationPeriod')}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      format="DD/MM/YYYY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Data Final"
                      value={localFilters.publicationPeriod?.end ? dayjs(localFilters.publicationPeriod.end) : null}
                      onChange={handleDateChange('end', 'publicationPeriod')}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      format="DD/MM/YYYY"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Período de Criação
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Data Inicial"
                      value={localFilters.creationPeriod?.start ? dayjs(localFilters.creationPeriod.start) : null}
                      onChange={handleDateChange('start', 'creationPeriod')}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      format="DD/MM/YYYY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Data Final"
                      value={localFilters.creationPeriod?.end ? dayjs(localFilters.creationPeriod.end) : null}
                      onChange={handleDateChange('end', 'creationPeriod')}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      format="DD/MM/YYYY"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </FilterSectionComponent>
        </Box>

        {/* Footer com Botões */}
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

        {/* Alerta de BBox */}
        {state.bbox && (
          <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
            A busca será limitada à área selecionada no mapa
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
}