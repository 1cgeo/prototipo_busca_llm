import React from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { Box, Chip } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

export default function ActiveFilters() {
  const { state, setFilters } = useSearch();
  const { filters } = state;

  if (!Object.keys(filters).length) return null;

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof typeof filters];
    setFilters(newFilters);
  };

  const renderFilterValue = (key: string, value: any) => {
    if (typeof value === 'object') {
      if (key === 'periodoPublicacao' || key === 'periodoCriacao') {
        return `${value.inicio} até ${value.fim}`;
      }
      if (key === 'bbox') {
        return 'Área selecionada no mapa';
      }
    }
    return value;
  };

  const getLabel = (key: string): string => {
    const labels: Record<string, string> = {
      palavraChave: 'Palavra-chave',
      escala: 'Escala',
      tipoProduto: 'Tipo de Produto',
      estado: 'Estado',
      municipio: 'Município',
      areaSuprimento: 'Área de Suprimento',
      projeto: 'Projeto',
      periodoPublicacao: 'Período de Publicação',
      periodoCriacao: 'Período de Criação',
      bbox: 'Área'
    };
    return labels[key] || key;
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
      {Object.entries(filters).map(([key, value]) => value && (
        <Chip
          key={key}
          label={`${getLabel(key)}: ${renderFilterValue(key, value)}`}
          onDelete={() => removeFilter(key)}
          deleteIcon={<CancelIcon />}
          color="primary"
          variant="outlined"
          sx={{ borderRadius: 2 }}
        />
      ))}
    </Box>
  );
}