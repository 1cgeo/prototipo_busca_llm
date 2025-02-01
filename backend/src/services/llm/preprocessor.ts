import { logger } from '../../utils/logger.js';
import { COMMON_TERMS } from './constants.js';
import { normalizeString } from './utils.js';

interface ReplacementMatch {
  start: number;
  end: number;
  replacement: string;
}

function findWordBoundary(
  text: string,
  position: number,
  direction: 'forward' | 'backward',
): number {
  const isWordChar = (char: string) => /[\p{L}\p{N}]/u.test(char);

  if (direction === 'forward') {
    while (position < text.length && isWordChar(text[position])) position++;
    return position;
  } else {
    while (position > 0 && isWordChar(text[position - 1])) position--;
    return position;
  }
}

export function preprocessQuery(query: string): string {
  // First, normalize spaces and trim
  let processedQuery = query.replace(/\s+/g, ' ').trim();

  // Create a list to store all matches and their positions
  const matches: ReplacementMatch[] = [];

  // Find all potential matches
  Object.entries(COMMON_TERMS).forEach(([term, replacement]) => {
    // Convert both strings to lowercase for case-insensitive comparison
    const normalizedTerm = normalizeString(term);
    const normalizedQuery = normalizeString(processedQuery);

    let searchStartIndex = 0;
    while (true) {
      const index = normalizedQuery.indexOf(normalizedTerm, searchStartIndex);
      if (index === -1) break;

      // Find actual word boundaries
      const startPos = findWordBoundary(processedQuery, index, 'backward');
      const endPos = findWordBoundary(
        processedQuery,
        index + normalizedTerm.length,
        'forward',
      );

      // Verify this is a complete word/phrase match
      const actualMatch = processedQuery.slice(startPos, endPos);
      if (normalizeString(actualMatch) === normalizedTerm) {
        matches.push({
          start: startPos,
          end: endPos,
          replacement,
        });
      }

      searchStartIndex = index + 1;
    }
  });

  // Sort matches by position in reverse order (to maintain indices when replacing)
  matches.sort((a, b) => b.start - a.start);

  // Apply replacements from end to beginning to maintain indices
  matches.forEach(match => {
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
      replacements: matches,
    },
    'Query preprocessing complete',
  );

  return processedQuery;
}

// Helper function to handle ordinal number variations
export function normalizeOrdinalNumbers(text: string): string {
  return text
    .replace(/(\d+)[ºª°]?\s*(cgeo|CGEO)/gi, '$1° CGEO')
    .replace(/primeiro/i, '1°')
    .replace(/segundo/i, '2°')
    .replace(/terceiro/i, '3°')
    .replace(/quarto/i, '4°')
    .replace(/quinto/i, '5°');
}
