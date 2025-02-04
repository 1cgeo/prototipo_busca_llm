import { logger } from '../../utils/logger.js';
import { COMMON_TERMS } from './constants.js';

interface ReplacementMatch {
    start: number;
    end: number;
    replacement: string;
    original: string;
}

function normalizeString(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')  // remove acentos
        .replace(/[^\w\s]/g, '')  // remove pontuação
        .replace(/\s+/g, ' ')     // normaliza espaços
        .trim();
}

function preprocessText(text: string): string {
    // Normaliza espaços e converte para minúsculo
    return text
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

export function preprocessQuery(query: string): string {
    // Pré-processa o texto inicial
    let processedQuery = preprocessText(query);
    const originalQueryNormalized = normalizeString(processedQuery);
    const matches: ReplacementMatch[] = [];

    // Ordena termos do mais longo para o mais curto para evitar matches parciais
    const sortedTerms = Object.entries(COMMON_TERMS)
        .sort((a, b) => b[0].length - a[0].length);

    // Para cada termo no dicionário
    for (const [term, replacement] of sortedTerms) {
        const normalizedTerm = normalizeString(term);
        let currentIndex = 0;

        // Procura todas as ocorrências do termo
        while (true) {
            const index = originalQueryNormalized.indexOf(normalizedTerm, currentIndex);
            if (index === -1) break;

            // Verifica se é uma palavra/frase completa
            const beforeChar = index === 0 ? ' ' : originalQueryNormalized[index - 1];
            const afterChar = index + normalizedTerm.length >= originalQueryNormalized.length 
                ? ' ' 
                : originalQueryNormalized[index + normalizedTerm.length];

            if (/\s/.test(beforeChar) && /\s/.test(afterChar)) {
                matches.push({
                    start: index,
                    end: index + normalizedTerm.length,
                    replacement: replacement,
                    original: processedQuery.slice(index, index + normalizedTerm.length)
                });
            }

            currentIndex = index + 1;
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
                replacement: m.replacement
            }))
        },
        'Query preprocessing complete'
    );

    return processedQuery;
}