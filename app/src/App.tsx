import { ThemeProvider } from '@/contexts/ThemeContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { CssBaseline } from '@mui/material';
import AppLayout from '@/components/layouts/AppLayout';

export default function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <SearchProvider>
        <AppLayout />
      </SearchProvider>
    </ThemeProvider>
  );
}