import { Box, Typography, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import type { SearchParams } from '@/types/search';

interface DateFiltersProps {
  filters: SearchParams;
  onDateChange: (field: 'start' | 'end', periodField: 'publicationPeriod' | 'creationPeriod') => (value: dayjs.Dayjs | null) => void;
}

export default function DateFilters({
  filters,
  onDateChange
}: DateFiltersProps) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Período de Publicação
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
          <DatePicker
            label="Data Inicial"
            value={filters.publicationPeriod?.start ? dayjs(filters.publicationPeriod.start) : null}
            onChange={onDateChange('start', 'publicationPeriod')}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            format="DD/MM/YYYY"
          />
          <DatePicker
            label="Data Final"
            value={filters.publicationPeriod?.end ? dayjs(filters.publicationPeriod.end) : null}
            onChange={onDateChange('end', 'publicationPeriod')}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            format="DD/MM/YYYY"
          />
        </Stack>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Período de Criação
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
          <DatePicker
            label="Data Inicial"
            value={filters.creationPeriod?.start ? dayjs(filters.creationPeriod.start) : null}
            onChange={onDateChange('start', 'creationPeriod')}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            format="DD/MM/YYYY"
          />
          <DatePicker
            label="Data Final"
            value={filters.creationPeriod?.end ? dayjs(filters.creationPeriod.end) : null}
            onChange={onDateChange('end', 'creationPeriod')}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            format="DD/MM/YYYY"
          />
        </Stack>
      </Box>
    </Stack>
  );
}