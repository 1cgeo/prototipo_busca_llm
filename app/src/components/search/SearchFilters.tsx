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
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FilterListIcon from '@mui/icons-material/FilterList';

dayjs.locale('pt-br');

interface SearchFiltersProps {
  metadata: MetadataOptions;
  onSearch: () => void;
}

export default function SearchFilters({ metadata, onSearch }: SearchFiltersProps) {
  const { state, setResults, setFilters, setPagination, setLoading, setError } = useSearch();
  const [localFilters, setLocalFilters] = useState<SearchParams>(state.filters);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Seção de Identificação */}
          <Box>
            <Typography 
              variant="subtitle2" 
              color="primary" 
              sx={{ 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <FilterListIcon fontSize="small" />
              Identificação
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Palavra-chave"
                  value={localFilters.keyword || ''}
                  onChange={handleTextChange('keyword')}
                  placeholder="Busque por palavras-chave..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
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
              </Grid>
            </Grid>
          </Box>

          {/* Seção de Localização */}
          <Box>
            <Typography 
              variant="subtitle2" 
              color="primary"
              sx={{ 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <FilterListIcon fontSize="small" />
              Localização
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estado"
                  value={localFilters.state || ''}
                  onChange={handleTextChange('state')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Município"
                  value={localFilters.city || ''}
                  onChange={handleTextChange('city')}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Seção de Projeto */}
          <Box>
            <Typography 
              variant="subtitle2" 
              color="primary"
              sx={{ 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <FilterListIcon fontSize="small" />
              Projeto
            </Typography>
            <FormControl fullWidth>
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
          </Box>

          {/* Seção de Datas */}
          <Box>
            <Typography 
              variant="subtitle2" 
              color="primary"
              sx={{ 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CalendarTodayIcon fontSize="small" />
              Períodos
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Período de Publicação
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Data Inicial"
                      value={localFilters.publicationPeriod?.start ? dayjs(localFilters.publicationPeriod.start) : null}
                      onChange={handleDateChange('start', 'publicationPeriod')}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                      format="DD/MM/YYYY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Data Final"
                      value={localFilters.publicationPeriod?.end ? dayjs(localFilters.publicationPeriod.end) : null}
                      onChange={handleDateChange('end', 'publicationPeriod')}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                      format="DD/MM/YYYY"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Período de Criação
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Data Inicial"
                      value={localFilters.creationPeriod?.start ? dayjs(localFilters.creationPeriod.start) : null}
                      onChange={handleDateChange('start', 'creationPeriod')}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                      format="DD/MM/YYYY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Data Final"
                      value={localFilters.creationPeriod?.end ? dayjs(localFilters.creationPeriod.end) : null}
                      onChange={handleDateChange('end', 'creationPeriod')}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                      format="DD/MM/YYYY"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>

          {/* Botões de Ação */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
              disabled={isSubmitting}
            >
              Limpar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SearchIcon />}
              disabled={isSubmitting}
            >
              Buscar
            </Button>
          </Box>

          {/* Alerta de BBox */}
          {state.bbox && (
            <Alert severity="info" variant="outlined">
              A busca será limitada à área selecionada no mapa
            </Alert>
          )}
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}