import React from 'react';
import { SearchProvider } from '@/contexts/SearchContext';
import { useTheme } from '@/contexts/ThemeContext';
import SearchForm from '@/components/search/SearchForm';
import ActiveFilters from '@/components/search/ActiveFilters';
import SearchResults from '@/components/search/SearchResults';
import Map from '@/components/map/Map';
import {
  Container,
  Typography,
  Grid,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Box,
  useTheme as useMuiTheme
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MapIcon from '@mui/icons-material/Map';

export default function SearchPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = useMuiTheme();

  return (
    <SearchProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <MapIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dados Cartográficos
            </Typography>
            <IconButton onClick={toggleTheme} color="inherit">
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ mb: 4, fontWeight: 'medium' }}
          >
            Busca de Dados Geoespaciais
          </Typography>
          
          <SearchForm />
          
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2,
                  height: '100%',
                  bgcolor: 'background.paper'
                }}
              >
                <ActiveFilters />
                <SearchResults />
              </Paper>
            </Grid>
            
            <Grid item xs={12} lg={6}>
              <Paper 
                elevation={3}
                sx={{ 
                  height: { xs: '50vh', lg: 'calc(100vh - 200px)' },
                  position: { lg: 'sticky' },
                  top: { lg: theme.spacing(2) },
                  bgcolor: 'background.paper'
                }}
              >
                <Map />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </SearchProvider>
  );
}