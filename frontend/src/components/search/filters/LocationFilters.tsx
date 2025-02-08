import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { SearchParams, MetadataOptions } from '@/types/search';
import type { SelectChangeEvent } from '@mui/material';

interface LocationFiltersProps {
  filters: SearchParams;
  metadata: MetadataOptions;
  onTextChange: (field: keyof SearchParams) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (field: keyof SearchParams) => (event: SelectChangeEvent<string>) => void;
}

export default function LocationFilters({
  filters,
  metadata,
  onTextChange,
  onSelectChange
}: LocationFiltersProps) {
  return (
    <>
      <FormControl fullWidth size="small">
        <InputLabel>Área de Suprimento</InputLabel>
        <Select
          value={filters.supplyArea || ''}
          onChange={onSelectChange('supplyArea')}
          label="Área de Suprimento"
        >
          <MenuItem value=""><em>Qualquer</em></MenuItem>
          {metadata.supplyAreas.map(area => (
            <MenuItem key={area} value={area}>{area}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Estado"
        value={filters.state || ''}
        onChange={onTextChange('state')}
        size="small"
      />
      <TextField
        fullWidth
        label="Município"
        value={filters.city || ''}
        onChange={onTextChange('city')}
        size="small"
      />
    </>
  );
}