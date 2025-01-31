import { Router } from 'express';
import { SearchService } from '@/services/search';
import { LLMService } from '@/services/llm';
import { validateNaturalLanguageQuery, validateStructuredSearch } from '@/middleware/validation';
import { config } from '@/config';
import { logger } from '@/utils/logger';

const router = Router();
const searchService = new SearchService();
const llmService = new LLMService(config.llm.baseUrl);

// Rota para busca inicial com linguagem natural
router.post('/natural-search', validateNaturalLanguageQuery, async (req, res) => {
  try {
    // Processa a query em linguagem natural
    const structuredSearch = await llmService.processQuery(req.body.query);
    logger.debug('Processed natural language query:', { structuredSearch });

    // Executa a busca com a query estruturada
    const searchResults = await searchService.search(structuredSearch);

    res.json({
      ...searchResults,
      queryMetadata: {
        originalQuery: req.body.query
      }
    });
  } catch (error) {
    logger.error('Natural language search error:', error);
    
    if (error instanceof Error && error.message.includes('Não foi possível entender')) {
      return res.status(400).json({ 
        error: error.message,
        originalQuery: req.body.query 
      });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      originalQuery: req.body.query 
    });
  }
});

// Rota para navegação/paginação com busca estruturada
router.post('/structured-search', validateStructuredSearch, async (req, res) => {
  try {
    const searchResults = await searchService.search(req.body);
    res.json(searchResults);
  } catch (error) {
    logger.error('Structured search error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para metadados (valores válidos)
router.get('/metadata', (req, res) => {
  res.json({
    escalas: ['1:25.000', '1:50.000', '1:100.000', '1:250.000'],
    tiposProduto: ['Carta Topografica', 'Carta Ortoimagem', 'Carta Tematica'],
    areasSuprimento: [
      '1° Centro de Geoinformação (1° CGEO)',
      '2° Centro de Geoinformação (2° CGEO)',
      '3° Centro de Geoinformação (3° CGEO)',
      '4° Centro de Geoinformação (4° CGEO)',
      '5° Centro de Geoinformação (5° CGEO)'
    ],
    projetos: [
      'Rondônia',
      'Amapá',
      'Bahia',
      'BECA',
      'Rio Grande do Sul',
      'Mapeamento Sistemático',
      'Copa do Mundo 2014',
      'Olimpíadas',
      'Copa das Confereções 2013'
    ],
    ordenacao: {
      campos: ['dataPublicacao', 'dataCriacao'],
      direcoes: ['ASC', 'DESC']
    }
  });
});

export default router;