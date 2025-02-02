import { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Fade } from '@mui/material';
import { useTheme as useAppTheme } from '@/contexts/ThemeContext';
import { useSearch } from '@/contexts/SearchContext';
import MapIcon from '@mui/icons-material/Map';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Map from '@/components/map/Map';
import SearchPanel from '@/components/search/SearchPanel';
import ResultsPanel from '@/components/search/ResultsPanel';

const TOOLBAR_HEIGHT = 64; // Altura fixa da toolbar

export default function AppLayout() {
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { state } = useSearch();
  const [showResults, setShowResults] = useState(false);

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
          backgroundColor: theme => theme.palette.background.paper,
          color: theme => isDarkMode ? 'inherit' : theme.palette.grey[800],
          zIndex: theme => theme.zIndex.drawer + 1
        }}
        elevation={3}
      >
        <Toolbar>
          <MapIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 500
            }}
          >
            Protótipo busca por LLM
          </Typography>

          <IconButton 
            onClick={toggleTheme} 
            sx={{ 
              color: theme => isDarkMode ? 'inherit' : theme.palette.grey[700]
            }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mapa Base */}
      <Box sx={{ 
        position: 'relative',
        flex: 1,
        height: `calc(100vh - ${TOOLBAR_HEIGHT}px)`
      }}>
        <Map 
          enableBboxSelection 
        />
      </Box>

      {/* Container de Painéis */}
      <Box sx={{
        position: 'absolute',
        top: TOOLBAR_HEIGHT,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: theme => theme.zIndex.drawer + 2
      }}>
        {/* Painel de Busca */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 600,
            mt: 2,
            px: 2,
            pointerEvents: 'auto'
          }}
        >
          <SearchPanel 
            onShowResults={() => setShowResults(true)} 
          />
        </Box>

        {/* Painel de Resultados */}
        <Box sx={{ flex: 1 }} />
        <Fade in={showResults && state.results.length > 0}>
          <Box
            sx={{
              width: '100%',
              maxWidth: 800,
              mb: 3,
              px: 2,
              pointerEvents: 'auto'
            }}
          >
            <ResultsPanel 
              onClose={() => setShowResults(false)}
              onNewSearch={() => setShowResults(false)}
            />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}