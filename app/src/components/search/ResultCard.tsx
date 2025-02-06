import { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  IconButton,
  Tooltip,
  alpha
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MapIcon from '@mui/icons-material/Map';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import type { SearchResult } from '@/types/search';

interface ResultCardProps {
  result: SearchResult;
  onZoomTo?: (geometry: GeoJSON.Polygon) => void;
}

export default function ResultCard({ result, onZoomTo }: ResultCardProps) {
  const formattedDate = useMemo(() => {
    return new Date(result.publicationDate).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, [result.publicationDate]);

  return (
    <Card
      elevation={1}
      sx={{
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          bgcolor: 'action.hover',
          transform: 'translateY(-2px)',
          boxShadow: theme => `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`
        }
      }}
    >
      <CardContent>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1
        }}>
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              fontSize: '1rem',
              fontWeight: 500,
              lineHeight: 1.4
            }}
          >
            {result.name}
          </Typography>

          {onZoomTo && (
            <Tooltip title="Zoom para área">
              <IconButton
                size="small"
                onClick={() => onZoomTo(result.geometry)}
                sx={{
                  color: 'primary.main',
                  bgcolor: t => alpha(t.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: t => alpha(t.palette.primary.main, 0.2)
                  }
                }}
              >
                <CenterFocusStrongIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.5em'
          }}
        >
          {result.description}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon 
                fontSize="small" 
                sx={{ color: 'action.active' }} 
              />
              <Typography variant="body2" color="text.secondary">
                {formattedDate}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlaceIcon 
                fontSize="small" 
                sx={{ color: 'action.active' }} 
              />
              <Typography variant="body2" color="text.secondary">
                {result.scale}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          flexWrap: 'wrap' 
        }}>
          <Chip
            icon={<MapIcon />}
            label={result.productType}
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            label={result.project}
            color="secondary"
            variant="outlined"
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
}