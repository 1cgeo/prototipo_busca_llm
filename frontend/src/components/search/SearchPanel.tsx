import { useState, useEffect } from 'react';
import { 
  Box, 
  ToggleButtonGroup, 
  ToggleButton, 
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  Button
} from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import SearchForm from './SearchForm';
import SearchFilters from './SearchFilters';
import { useSearch } from '@/contexts/SearchContext';
import { getMetadata } from '@/services/api';
import { MetadataOptions } from '@/types/search';

type SearchMode = 'natural' | 'structured';

interface SearchPanelProps {
  onSearch: () => void;
  onClose?: () => void;
  variant?: 'central' | 'drawer';
}

export default function SearchPanel({ 
  onSearch,
  onClose,
  variant = 'central'
}: SearchPanelProps) {
  const [mode, setMode] = useState<SearchMode>('natural');
  const [metadata, setMetadata] = useState<MetadataOptions | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string>();
  const { state, setBoundingBox, clearMapSelection } = useSearch();
  
  const handleClearBbox = () => {
    if (clearMapSelection) {
      clearMapSelection();
    }
    setBoundingBox(undefined);
  };

  useEffect(() => {
    const loadMetadata = async () => {
      if (mode === 'structured' && !metadata) {
        setLoadingMetadata(true);
        setMetadataError(undefined);
        
        try {
          const data = await getMetadata();
          setMetadata(data);
        } catch (error) {
          setMetadataError('Erro ao carregar opções de filtro');
          console.error('Erro ao carregar metadados:', error);
        } finally {
          setLoadingMetadata(false);
        }
      }
    };

    loadMetadata();
  }, [mode, metadata]);

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: SearchMode | null) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };
  const containerStyles = variant === 'central' ? {
    maxWidth: 600,
    mx: 'auto',
    borderRadius: 2,
    bgcolor: 'background.paper',
    boxShadow: 3,
    position: 'relative'
  } : {
    bgcolor: 'background.paper'
  };
  return (
    <Paper sx={containerStyles}>
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            zIndex: 1
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      )}

      <Box sx={{ p: 2 }}>
        {/* Toggle de Modo */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
          mt: 1
        }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            aria-label="modo de busca"
            size="small"
          >
            <ToggleButton value="natural" aria-label="busca em texto livre">
              <TextFieldsIcon sx={{ mr: 1 }} />
              Texto Livre
            </ToggleButton>
            <ToggleButton value="structured" aria-label="busca com filtros">
              <FilterListIcon sx={{ mr: 1 }} />
              Filtros
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Conteúdo do Painel */}
        <Box sx={{ 
          maxHeight: variant === 'drawer' ? 'calc(100vh - 200px)' : 'auto',
          overflowY: variant === 'drawer' ? 'auto' : 'visible'
        }}>
          {mode === 'natural' ? (
            <SearchForm 
              onSearch={onSearch}
              variant={variant}
            />
          ) : loadingMetadata ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              p: 4 
            }}>
              <CircularProgress />
            </Box>
          ) : metadataError ? (
            <Alert 
              severity="error"
              sx={{ mt: 2 }}
            >
              {metadataError}
            </Alert>
          ) : metadata ? (
            <SearchFilters 
              metadata={metadata} 
              onSearch={onSearch}
              variant={variant}
            />
          ) : null}
        </Box>

        {/* Alerta de BBox */}
        {state.bbox && (
          <Alert 
            severity="info"
            sx={{ mt: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleClearBbox}
                startIcon={<ClearIcon />}
              >
                Limpar
              </Button>
            }
          >
            Área selecionada no mapa será considerada na busca
          </Alert>
        )}
      </Box>
    </Paper>
  );
}