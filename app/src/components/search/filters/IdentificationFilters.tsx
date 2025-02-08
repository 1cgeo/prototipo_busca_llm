import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { SearchParams, MetadataOptions } from '@/types/search';
import type { SelectChangeEvent } from '@mui/material';

interface IdentificationFiltersProps {
  filters: SearchParams;
  metadata: MetadataOptions;
  onTextChange: (field: keyof SearchParams) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (field: keyof SearchParams) => (event: SelectChangeEvent<string>) => void;
}

export default function IdentificationFilters({
  filters,
  metadata,
  onTextChange,
  onSelectChange
}: IdentificationFiltersProps) {
  return (
    <>
      <TextField
        fullWidth
        label="Palavra-chave"
        value={filters.keyword || ''}
        onChange={onTextChange('keyword')}
        placeholder="Busque por palavras-chave..."
        size="small"
      />
      <FormControl fullWidth size="small">
        <InputLabel>Escala</InputLabel>
        <Select
          value={filters.scale || ''}
          onChange={onSelectChange('scale')}
          label="Escala"
        >
          <MenuItem value=""><em>Qualquer</em></MenuItem>
          {metadata.scales.map(scale => (
            <MenuItem key={scale} value={scale}>{scale}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel>Tipo de Produto</InputLabel>
        <Select
          value={filters.productType || ''}
          onChange={onSelectChange('productType')}
          label="Tipo de Produto"
        >
          <MenuItem value=""><em>Qualquer</em></MenuItem>
          {metadata.productTypes.map(type => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}