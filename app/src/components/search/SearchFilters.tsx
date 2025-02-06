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
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

dayjs.locale('pt-br');

export interface SearchFiltersProps {
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
          {/* Identificação */}
          <Accordion 
            expanded={expandedSection === 'identification'} 
            onChange={handleSectionChange('identification')}
            elevation={0}
            disableGutters
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterAltIcon fontSize="small" />
                <Typography>Identificação</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
          </Accordion>

          {/* Localização */}
          <Accordion 
            expanded={expandedSection === 'location'} 
            onChange={handleSectionChange('location')}
            elevation={0}
            disableGutters
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon fontSize="small" />
                <Typography>Localização</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
          </Accordion>

          {/* Projeto */}
          <Accordion 
            expanded={expandedSection === 'project'} 
            onChange={handleSectionChange('project')}
            elevation={0}
            disableGutters
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountTreeIcon fontSize="small" />
                <Typography>Projeto</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
          </Accordion>

          {/* Períodos */}
          <Accordion 
            expanded={expandedSection === 'dates'} 
            onChange={handleSectionChange('dates')}
            elevation={0}
            disableGutters
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon fontSize="small" />
                <Typography>Períodos</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
          </Accordion>
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