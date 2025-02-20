import { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  Stack,
  Divider
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MapIcon from '@mui/icons-material/Map';
import ZoomIn from '@mui/icons-material/ZoomIn';
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
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header with Title and Zoom Button */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1.5
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle1"
              component="h3"
              sx={{ 
                fontWeight: 500,
                lineHeight: 1.3,
                mb: 0.5
              }}
            >
              {result.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PlaceIcon sx={{ fontSize: 16, color: 'action.active' }} />
                <Typography variant="caption" color="text.secondary">
                  {result.scale}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 16, color: 'action.active' }} />
                <Typography variant="caption" color="text.secondary">
                  {formattedDate}
                </Typography>
              </Box>
            </Box>
          </Box>

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
                <ZoomIn fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 1 }} />

        {/* Description and Tags */}
        <Stack spacing={1.5}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4
            }}
          >
            {result.description}
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            flexWrap: 'wrap'
          }}>
            <Chip
              icon={<MapIcon sx={{ fontSize: 16 }} />}
              label={result.productType}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ height: 24 }}
            />
            <Chip
              label={result.project}
              color="secondary"
              variant="outlined"
              size="small"
              sx={{ height: 24 }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}