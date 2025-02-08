import { FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import type { SearchParams, MetadataOptions } from '@/types/search';
import type { SelectChangeEvent } from '@mui/material';

interface SortingFiltersProps {
  filters: SearchParams;
  metadata: MetadataOptions;
  onSelectChange: (field: keyof SearchParams) => (event: SelectChangeEvent<string>) => void;
}

export default function SortingFilters({
  filters,
  metadata,
  onSelectChange
}: SortingFiltersProps) {
  return (
    <Stack spacing={2}>
      <FormControl fullWidth size="small">
        <InputLabel>Ordenar por</InputLabel>
        <Select
          value={filters.sortField || ''}
          onChange={onSelectChange('sortField')}
          label="Ordenar por"
        >
          <MenuItem value=""><em>Relevância</em></MenuItem>
          {metadata.sorting.fields.map(field => (
            <MenuItem key={field} value={field}>
              {field === 'publicationDate' ? 'Data de Publicação' : 'Data de Criação'}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {filters.sortField && (
        <FormControl fullWidth size="small">
          <InputLabel>Direção</InputLabel>
          <Select
            value={filters.sortDirection || 'DESC'}
            onChange={onSelectChange('sortDirection')}
            label="Direção"
          >
            {metadata.sorting.directions.map(direction => (
              <MenuItem key={direction} value={direction}>
                {direction === 'DESC' ? 'Mais recente primeiro' : 'Mais antigo primeiro'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Stack>
  );
}