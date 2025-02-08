import { Box, FormControl, Select, MenuItem, Typography, Pagination, SelectChangeEvent } from '@mui/material';
import { PaginationInfo } from '@/types/search';

const DEFAULT_LIMITS = [10, 20, 50];

interface PaginationControlsProps {
  pagination: PaginationInfo;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function PaginationControls({
  pagination,
  disabled = false,
  onPageChange,
  onLimitChange
}: PaginationControlsProps) {
  // Calcular range de itens exibidos
  const startItem = ((pagination.page - 1) * pagination.limit) + 1;
  const endItem = Math.min(startItem + pagination.limit - 1, pagination.total);

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    const newLimit = Number(event.target.value);
    onLimitChange(newLimit);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2,
      pt: 2
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={pagination.limit}
            onChange={handleLimitChange}
            size="small"
            disabled={disabled}
          >
            {(() => {
              const availableLimits = pagination.availableLimits?.length
                ? pagination.availableLimits
                : DEFAULT_LIMITS;

              const limitSet = new Set([...availableLimits, pagination.limit]);

              return Array.from(limitSet)
                .sort((a, b) => a - b)
                .map(limit => (
                  <MenuItem key={limit} value={limit}>
                    {limit} por página
                  </MenuItem>
                ));
            })()}
          </Select>
        </FormControl>
        
        <Typography variant="body2" color="text.secondary">
          {pagination.total > 0 
            ? `${startItem}-${endItem} de ${pagination.total}`
            : 'Nenhum resultado'}
        </Typography>
      </Box>

      {pagination.total > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="medium"
            showFirstButton
            showLastButton
            siblingCount={1}
            disabled={disabled}
          />
        </Box>
      )}
    </Box>
  );
}