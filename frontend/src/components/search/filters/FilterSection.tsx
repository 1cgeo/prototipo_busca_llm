import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FilterSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  activeFilters: number;
  expanded: boolean;
  onChange: (id: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  children: React.ReactNode;
}

export default function FilterSection({
  id,
  title,
  icon,
  activeFilters,
  expanded,
  onChange,
  children
}: FilterSectionProps) {
  return (
    <Accordion 
      expanded={expanded} 
      onChange={onChange(id)}
      elevation={0}
      disableGutters
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          width: '100%'
        }}>
          {icon}
          <Typography>{title}</Typography>
          {activeFilters > 0 && (
            <Box 
              sx={{ 
                ml: 1,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: '10px',
                minWidth: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'medium',
                px: 0.75
              }}
            >
              {activeFilters}
            </Box>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}