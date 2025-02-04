import { useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Drawer,
  useTheme,
  useMediaQuery,
  Theme
} from '@mui/material';
import { useTheme as useAppTheme } from '@/contexts/ThemeContext';
import MapIcon from '@mui/icons-material/Map';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Map from '@/components/map/Map';
import SearchPanel from '@/components/search/SearchPanel';
import ResultsPanel from '@/components/search/ResultsPanel';

const TOOLBAR_HEIGHT = 64;
const DRAWER_WIDTH = 400;

export default function AppLayout() {
  const { isDarkMode, toggleTheme } = useAppTheme();
  const [showResults, setShowResults] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(true);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          backgroundColor: 'background.paper',
          color: (theme: Theme) => isDarkMode ? theme.palette.text.primary : theme.palette.grey[800],
          zIndex: theme => theme.zIndex.drawer + 1
        }}
        elevation={3}
      >
        <Toolbar>
          <MapIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1, fontWeight: 500 }}
          >
            Protótipo busca por LLM
          </Typography>

          <IconButton 
            onClick={toggleTheme} 
            sx={{ 
              color: (theme: Theme) => isDarkMode ? theme.palette.text.primary : theme.palette.grey[700]
            }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Container Principal */}
      <Box sx={{ 
        position: 'relative',
        flex: 1,
        height: `calc(100vh - ${TOOLBAR_HEIGHT}px)`,
        display: 'flex'
      }}>
        {/* Área do Mapa */}
        <Box sx={{ 
          flexGrow: 1,
          position: 'relative',
          transition: theme => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(showResults && {
            marginRight: isMobile ? 0 : DRAWER_WIDTH,
            transition: theme => theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}>
          <Map enableBboxSelection />

          {/* Painel de Busca Flutuante */}
          {showSearchPanel && (
            <Box sx={{
              position: 'absolute',
              top: 2,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 'sm',
              px: 2,
              zIndex: 1,
            }}>
              <SearchPanel onSearch={handleSearch} />
            </Box>
          )}
        </Box>

        {/* Drawer de Resultados */}
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          anchor={isMobile ? 'bottom' : 'right'}
          open={showResults}
          onClose={handleCloseResults}
          sx={{
            width: isMobile ? '100%' : DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: isMobile ? '100%' : DRAWER_WIDTH,
              height: isMobile ? '90%' : '100%',
              boxSizing: 'border-box',
            },
          }}
          PaperProps={{
            sx: {
              mt: `${TOOLBAR_HEIGHT}px`
            }
          }}
        >
          <ResultsPanel 
            onClose={handleCloseResults}
            onNewSearch={handleNewSearch}
          />
        </Drawer>
      </Box>
    </Box>
  );
}