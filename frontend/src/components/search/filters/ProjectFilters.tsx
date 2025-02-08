import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { SearchParams, MetadataOptions } from '@/types/search';
import type { SelectChangeEvent } from '@mui/material';

interface ProjectFiltersProps {
  filters: SearchParams;
  metadata: MetadataOptions;
  onSelectChange: (field: keyof SearchParams) => (event: SelectChangeEvent<string>) => void;
}

export default function ProjectFilters({
  filters,
  metadata,
  onSelectChange
}: ProjectFiltersProps) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>Projeto</InputLabel>
      <Select
        value={filters.project || ''}
        onChange={onSelectChange('project')}
        label="Projeto"
      >
        <MenuItem value=""><em>Qualquer</em></MenuItem>
        {metadata.projects.map(project => (
          <MenuItem key={project} value={project}>{project}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}