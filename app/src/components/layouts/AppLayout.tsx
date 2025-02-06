import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
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

// Keyframe animation for search button pulse
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
`;

export default function AppLayout() {
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { state } = useSearch();
  const [showResults, setShowResults] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(true);
  const [zoomToFeature, setZoomToFeature] = useState<(geometry: GeoJSON.Polygon) => void>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Update panels visibility based on search results
  useEffect(() => {
    if (state.results.length > 0) {
      setShowResults(true);
      setShowSearchPanel(false);
    }
  }, [state.results]);

  const handleSearch = () => {
    setShowResults(true);
    setShowSearchPanel(false);
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setShowSearchPanel(true);
  };

  const handleNewSearch = () => {
    setShowResults(false);
    setShowSearchPanel(true);
  };

  const toggleSearchPanel = () => {
    setShowSearchPanel(!showSearchPanel);
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
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* AppBar */}
      <AppBar 
        position="relative"
        sx={{ 
          zIndex: theme => theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: theme => isDarkMode ? theme.palette.text.primary : theme.palette.grey[800]
        }}
        elevation={3}
      >
        <Toolbar>
          <MapIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 500 }}>
            Protótipo busca por LLM
          </Typography>
          <IconButton 
            onClick={toggleTheme}
            sx={{ color: theme => isDarkMode ? theme.palette.text.primary : theme.palette.grey[700] }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={{ 
        position: 'relative',
        flex: 1,
        height: `calc(100vh - ${TOOLBAR_HEIGHT}px)`,
      }}>
        {/* Map Container */}
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

        {/* Floating Search Button when panel is closed */}
        {!showSearchPanel && !showResults && (
          <Tooltip title="Abrir busca">
            <IconButton
              onClick={toggleSearchPanel}
              sx={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1,
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'action.hover',
                  animation: 'none'
                },
                animation: `${pulseAnimation} 2s infinite ease-in-out`
              }}
            >
              <SearchIcon color="primary" />
            </IconButton>
          </Tooltip>
        )}

        {/* Central Search Panel */}
        <Fade in={showSearchPanel}>
          <Box sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 'sm',
            px: 2,
            zIndex: 1,
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

        {/* Results Panel (Left Side Drawer) */}
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          anchor="left"
          open={showResults}
          onClose={handleCloseResults}
          sx={{
            width: DRAWER_WIDTH,
            minWidth: DRAWER_MIN_WIDTH,
            maxWidth: DRAWER_MAX_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              minWidth: DRAWER_MIN_WIDTH,
              maxWidth: DRAWER_MAX_WIDTH,
              height: '100%',
              position: 'absolute',
              bgcolor: 'background.paper',
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              boxShadow: 3
            },
          }}
          PaperProps={{
            sx: {
              mt: 0
            }
          }}
          ModalProps={{
            keepMounted: true
          }}
        >
          <ResultsPanel 
            onClose={handleCloseResults}
            onNewSearch={handleNewSearch}
            onZoomTo={zoomToFeature}
          />
        </Drawer>
      </Box>
    </Box>
  );
}