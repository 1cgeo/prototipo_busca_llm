// src/services/llm/preprocessor.ts
import { logger } from '../../utils/logger.js';
import { COMMON_TERMS } from './constants.js';
import { normalizeString } from './utils.js';

export function preprocessQuery(query: string): string {
  // Remove espaços extras mantendo um único espaço entre palavras
  let processedQuery = query.replace(/\s+/g, ' ').trim();

  // Aplica substituições de termos comuns usando comparação normalizada
  Object.entries(COMMON_TERMS).forEach(([term, replacement]) => {
    const normalizedTerm = normalizeString(term);
    const words = processedQuery.split(/\s+/);
    const termWordCount = term.split(/\s+/).length;
    
    // Procura por sequências de palavras que correspondam ao termo
    for (let i = 0; i <= words.length - termWordCount; i++) {
      const slice = words.slice(i, i + termWordCount).join(' ');
      if (normalizeString(slice) === normalizedTerm) {
        // Substitui apenas a sequência exata de palavras
        const before = words.slice(0, i);
        const after = words.slice(i + termWordCount);
        processedQuery = [...before, replacement, ...after].join(' ');
        // Como já fizemos uma substituição neste termo, podemos pular para o próximo
        i += termWordCount - 1;
      }
    }
  });

  logger.debug(
    {
      stage: 'query_preprocessing',
      originalQuery: query,
      processedQuery,
    },
    'Query preprocessing complete',
  );

  return processedQuery;
}