import { logger } from '../../utils/logger.js';
import { COMMON_TERMS } from './constants.js';

interface ReplacementMatch {
  start: number;
  end: number;
  replacement: string;
  original: string;
}

/**
 * Normaliza uma string apenas para fins de comparação
 * Não altera a string original que será usada
 */
function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^\w\s]/g, '') // remove pontuação
    .trim();
}

/**
 * Verifica se dois textos são equivalentes desconsiderando formatação
 */
function areEquivalent(text1: string, text2: string): boolean {
  return normalizeForComparison(text1) === normalizeForComparison(text2);
}

/**
 * Encontra todas as possíveis correspondências de um termo em um texto
 */
function findAllMatches(text: string, term: string): number[] {
  const normalizedText = normalizeForComparison(text);
  const normalizedTerm = normalizeForComparison(term);
  const positions: number[] = [];
  let currentIndex = 0;

  while (true) {
    const index = normalizedText.indexOf(normalizedTerm, currentIndex);
    if (index === -1) break;

    // Verifica se é uma palavra/termo completo
    const beforeChar = index === 0 ? ' ' : normalizedText[index - 1];
    const afterChar =
      index + normalizedTerm.length >= normalizedText.length
        ? ' '
        : normalizedText[index + normalizedTerm.length];

    if (/\s/.test(beforeChar) && /\s/.test(afterChar)) {
      // Encontra a posição correspondente no texto original
      const originalTextUpToMatch = text.slice(
        0,
        (text.length * index) / normalizedText.length,
      );
      positions.push(originalTextUpToMatch.length);
    }

    currentIndex = index + 1;
  }

  return positions;
}

export function preprocessQuery(query: string): string {
  let processedQuery = query.trim();
  const matches: ReplacementMatch[] = [];

  // Ordena termos do mais longo para o mais curto para evitar matches parciais
  const sortedTerms = Object.entries(COMMON_TERMS).sort(
    (a, b) => b[0].length - a[0].length,
  );

  // Para cada termo no dicionário
  for (const [term, replacement] of sortedTerms) {
    // Encontra todas as possíveis posições do termo no texto
    const positions = findAllMatches(processedQuery, term);

    for (const startPos of positions) {
      // Encontra o fim do termo no texto original
      let endPos = startPos;
      let currentText = '';

      while (endPos <= processedQuery.length) {
        currentText = processedQuery.slice(startPos, endPos);
        if (areEquivalent(currentText, term)) break;
        endPos++;
      }

      if (areEquivalent(currentText, term)) {
        matches.push({
          start: startPos,
          end: endPos,
          replacement: replacement,
          original: currentText,
        });
      }
    }
  }

  // Ordena matches por posição (do fim para o início para manter índices válidos)
  matches.sort((a, b) => b.start - a.start);

  // Remove matches sobrepostos
  const finalMatches = matches.filter((match, index) => {
    return !matches.some((otherMatch, otherIndex) => {
      if (index === otherIndex) return false;
      return (
        otherIndex < index &&
        match.start < otherMatch.end &&
        match.end > otherMatch.start
      );
    });
  });

  // Aplica as substituições
  finalMatches.forEach(match => {
    processedQuery =
      processedQuery.slice(0, match.start) +
      match.replacement +
      processedQuery.slice(match.end);
  });

  logger.debug(
    {
      stage: 'query_preprocessing',
      originalQuery: query,
      processedQuery,
      replacements: finalMatches.map(m => ({
        original: m.original,
        replacement: m.replacement,
      })),
    },
    'Query preprocessing complete',
  );

  return processedQuery;
}
