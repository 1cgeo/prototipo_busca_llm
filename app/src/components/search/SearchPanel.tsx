import { useState, useEffect } from 'react';
import { 
  Paper, 
  Box, 
  ToggleButtonGroup, 
  ToggleButton, 
  Collapse, 
  Fade,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchForm from './SearchForm';
import SearchFilters from './SearchFilters';
import { useSearch } from '@/contexts/SearchContext';
import { getMetadata } from '@/services/api';
import { MetadataOptions } from '@/types/search';

type SearchMode = 'natural' | 'structured';

interface SearchPanelProps {
  onShowResults: () => void;
}

export default function SearchPanel({ onShowResults }: SearchPanelProps) {
  const [mode, setMode] = useState<SearchMode>('natural');
  const [expanded, setExpanded] = useState(true);
  const [metadata, setMetadata] = useState<MetadataOptions | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string>();
  const { state } = useSearch();

  // Carregar metadados quando necessário
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

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header com Toggle de Modo */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        borderBottom: expanded ? 1 : 0,
        borderColor: 'divider'
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

        <Tooltip title={expanded ? "Minimizar" : "Expandir"}>
          <IconButton 
            onClick={toggleExpanded}
            size="small"
            sx={{ 
              position: 'absolute',
              right: 8
            }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Conteúdo do Painel */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          <Fade key={mode} in={true}>
            <Box>
              {mode === 'natural' ? (
                <SearchForm onSearch={onShowResults} />
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
                  onSearch={onShowResults} 
                />
              ) : null}
            </Box>
          </Fade>
        </Box>
      </Collapse>

      {/* Indicador de BBox */}
      {state.bbox && expanded && (
        <Box sx={{ 
          p: 1, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          Área selecionada no mapa será considerada na busca
        </Box>
      )}
    </Paper>
  );
}