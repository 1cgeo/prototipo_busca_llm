import { useState, useCallback } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography,
  IconButton,
  Drawer,
  useTheme,
  Fade,
  Tooltip,
  keyframes
} from '@mui/material';
import { useTheme as useAppTheme } from '@/contexts/ThemeContext';
import { useSearch } from '@/contexts/SearchContext';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Map from '@/components/map/Map';
import SearchPanel from '@/components/search/SearchPanel';
import ResultsPanel from '@/components/search/ResultsPanel';

const TOOLBAR_HEIGHT = 64;
const DRAWER_WIDTH = '40%';
const DRAWER_MIN_WIDTH = 400;
const DRAWER_MAX_WIDTH = 600;

export interface AppLayoutProps {}

export default function AppLayout(_props: AppLayoutProps) {
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { reset } = useSearch();
  const [showResults, setShowResults] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [zoomToFeature, setZoomToFeature] = useState<(geometry: GeoJSON.Polygon) => void>();
  const theme = useTheme();

  const pulseAnimation = keyframes`
    0% {
      transform: scale(1) translateX(-50%);
      background-color: ${theme.palette.background.paper};
      box-shadow: 0 4px 20px ${theme.palette.primary.main}20;
    }
    50% {
      transform: scale(1.15) translateX(-50%);
      background-color: ${theme.palette.primary.light};
      box-shadow: 0 4px 30px ${theme.palette.primary.main}66;
    }
    100% {
      transform: scale(1) translateX(-50%);
      background-color: ${theme.palette.background.paper};
      box-shadow: 0 4px 20px ${theme.palette.primary.main}40;
    }
  `;

  const handleSearch = () => {
    setShowResults(true);
    setShowSearchPanel(false);
  };

  const handleNewSearch = () => {
    setShowResults(false);
    setShowSearchPanel(true);
    reset();
  };

  const handleZoomTo = useCallback((zoomFn: (geometry: GeoJSON.Polygon) => void) => {
    setZoomToFeature(() => zoomFn);
  }, []);

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: theme.palette.background.default
    }}>
      <AppBar 
        position="relative"
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          color: isDarkMode ? theme.palette.text.primary : theme.palette.grey[800]
        }}
        elevation={3}
      >
        <Toolbar>
          <MapIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 500 }}>
            Protótipo busca por LLM
          </Typography>
          <IconButton 
            onClick={toggleTheme}
            sx={{ color: isDarkMode ? theme.palette.text.primary : theme.palette.grey[700] }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        position: 'relative',
        flex: 1,
        height: `calc(100vh - ${TOOLBAR_HEIGHT}px)`,
      }}>
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}>
          <Map 
            enableBboxSelection 
            onZoomTo={handleZoomTo}
          />
        </Box>

        {!showSearchPanel && !showResults && (
          <Box
            sx={{
              position: 'absolute',
              top: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: theme.zIndex.fab
            }}
          >
            <Tooltip title="Abrir busca">
              <IconButton
                onClick={() => setShowSearchPanel(true)}
                size="large"
                sx={{
                  width: 32,
                  height: 32,
                  transition: 'all 0.2s ease-in-out',
                  animation: `${pulseAnimation} 2s infinite ease-in-out`,
                  '&:hover': {
                    bgcolor: theme.palette.primary.main,
                    transform: 'scale(1.05) translateX(-48%)',
                    boxShadow: theme.shadows[8],
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  }
                }}
              >
                <SearchIcon sx={{ 
                  color: theme.palette.primary.main,
                  fontSize: 24 
                }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Fade in={showSearchPanel}>
          <Box sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: theme.breakpoints.values.sm,
            px: 2,
            zIndex: theme.zIndex.modal,
            pointerEvents: 'none'
          }}>
            <Box sx={{ pointerEvents: 'auto' }}>
              <SearchPanel 
                onSearch={handleSearch}
                onClose={() => setShowSearchPanel(false)}
              />
            </Box>
          </Box>
        </Fade>

        <Drawer
          variant="persistent"
          anchor="left"
          open={showResults}
          hideBackdrop
          sx={{
            width: DRAWER_WIDTH,
            minWidth: DRAWER_MIN_WIDTH,
            maxWidth: DRAWER_MAX_WIDTH,
            height: `calc(100% - ${TOOLBAR_HEIGHT}px)`,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              minWidth: DRAWER_MIN_WIDTH,
              maxWidth: DRAWER_MAX_WIDTH,
              height: `calc(100% - ${TOOLBAR_HEIGHT}px)`,
              top: TOOLBAR_HEIGHT,
              borderRight: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[3],
              bgcolor: theme.palette.background.paper
            },
            '& + .MuiBackdrop-root': {
              display: 'none'
            }
          }}
          ModalProps={{
            keepMounted: true,
            disableEnforceFocus: true,
            disableAutoFocus: true
          }}
        >
          <ResultsPanel 
            onNewSearch={handleNewSearch}
            onZoomTo={zoomToFeature}
          />
        </Drawer>
      </Box>
    </Box>
  );
}