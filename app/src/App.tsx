import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import SearchPage from '@/pages/SearchPage';

export default function App() {
  return (
    <ThemeProvider>
      <SearchPage />
    </ThemeProvider>
  );
}