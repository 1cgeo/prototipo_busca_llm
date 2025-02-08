import { ReactNode } from 'react';
import { Box, Typography, Paper, SxProps } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import ErrorIcon from '@mui/icons-material/Error';

type EmptyStateType = 'initial' | 'noResults' | 'error';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  sx?: SxProps;
}

const defaultProps: Record<EmptyStateType, Omit<EmptyStateProps, 'type'>> = {
  initial: {
    title: 'Faça uma busca',
    description: 'Use a barra de busca acima ou selecione uma área no mapa',
    icon: <SearchIcon sx={{ fontSize: 48, color: 'primary.main' }} />
  },
  noResults: {
    title: 'Nenhum resultado encontrado',
    description: 'Tente modificar sua busca ou selecionar outra área no mapa',
    icon: <MapIcon sx={{ fontSize: 48, color: 'primary.main' }} />
  },
  error: {
    title: 'Ocorreu um erro',
    description: 'Não foi possível completar sua busca. Tente novamente.',
    icon: <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
  }
};

export default function EmptyState({ 
  type = 'initial',
  title,
  description,
  icon,
  action,
  sx
}: EmptyStateProps) {
  const defaultState = defaultProps[type];
  const finalTitle = title || defaultState.title;
  const finalDescription = description || defaultState.description;
  const finalIcon = icon || defaultState.icon;

  return (
    <Paper
      elevation={0}
      sx={{ 
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: 'transparent',
        ...sx
      }}
    >
      <Box sx={{ mb: 2 }}>
        {finalIcon}
      </Box>

      <Typography 
        variant="h6" 
        component="h3"
        gutterBottom
      >
        {finalTitle}
      </Typography>

      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ maxWidth: 'sm', mb: action ? 3 : 0 }}
      >
        {finalDescription}
      </Typography>

      {action && (
        <Box sx={{ mt: 2 }}>
          {action}
        </Box>
      )}
    </Paper>
  );
}