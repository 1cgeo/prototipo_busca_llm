import { COMMON_TERMS } from './constants.js';
import {
  SCALES,
  SUPPLY_AREAS,
  type Scale,
  type ProductType,
  type SupplyArea,
  type Project,
  type SearchParams,
} from '../../types/api.js';

/**
 * Calcula a distância de Levenshtein entre duas strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Normaliza uma string removendo acentos e caracteres especiais
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Encontra a string mais próxima em uma lista de opções válidas
 */
export function findClosestMatch(
  value: string,
  validOptions: readonly string[],
): string | undefined {
  if (validOptions.includes(value)) {
    return value;
  }

  const normalizedValue = normalizeString(value);
  const normalizedOptions = validOptions.map(opt => ({
    original: opt,
    normalized: normalizeString(opt),
  }));

  let bestMatch = undefined;
  let minDistance = Infinity;
  const maxAllowedDistance = Math.floor(normalizedValue.length * 0.3);

  for (const option of normalizedOptions) {
    const distance = levenshteinDistance(normalizedValue, option.normalized);
    const maxLength = Math.max(
      normalizedValue.length,
      option.normalized.length,
    );
    const score = 1 - distance / maxLength;

    if (distance < minDistance && score >= 0.7) {
      minDistance = distance;
      bestMatch = option.original;
    }
  }

  return minDistance <= maxAllowedDistance ? bestMatch : undefined;
}

export function fallbackExtraction(text: string): SearchParams {
  const result: Partial<SearchParams> = {};

  // Extrair escalas
  const scaleMatch = text.match(/1:?(25|50|100|250)\.?000|(\d+)k/i);
  if (scaleMatch) {
    const scale = scaleMatch[1] || scaleMatch[2];
    const scaleStr = `1:${scale}.000` as Scale;
    if (SCALES.includes(scaleStr)) {
      result.scale = scaleStr;
    }
  }

  // Extrair tipos de produto
  if (/topo/i.test(text)) {
    result.productType = 'Carta Topográfica' as ProductType;
  } else if (/orto/i.test(text)) {
    result.productType = 'Carta Ortoimagem' as ProductType;
  } else if (/temática|tematica/i.test(text)) {
    result.productType = 'Carta Temática' as ProductType;
  }

  // Extrair áreas de suprimento
  const cgeoMatch = text.match(/(\d)[ºo°]?\s*cgeo/i);
  if (cgeoMatch && ['1', '2', '3', '4', '5'].includes(cgeoMatch[1])) {
    const area = `${cgeoMatch[1]}° Centro de Geoinformação` as SupplyArea;
    if (SUPPLY_AREAS.includes(area)) {
      result.supplyArea = area;
    }
  }

  // Extrair projetos conhecidos
  for (const [term, fullName] of Object.entries(COMMON_TERMS)) {
    if (text.toLowerCase().includes(term.toLowerCase())) {
      if (isValidProject(fullName)) {
        result.project = fullName as Project;
        break;
      }
    }
  }

  // Extrair ordenação
  if (/recent|novo|atual|último/i.test(text)) {
    result.sortField = 'publicationDate';
    result.sortDirection = 'DESC';
  } else if (/antig/i.test(text)) {
    result.sortField = 'publicationDate';
    result.sortDirection = 'ASC';
  }

  // Extrair limite numérico
  const limitMatch = text.match(/\b(\d+)\s*(carta|resultado|item)/i);
  if (limitMatch) {
    const limit = parseInt(limitMatch[1]);
    if (limit > 0 && limit <= 100) {
      result.limit = limit;
    }
  }

  // Extrair datas
  const dateRanges = extractDateRanges(text);
  if (dateRanges.publication) {
    result.publicationPeriod = dateRanges.publication;
  }
  if (dateRanges.creation) {
    result.creationPeriod = dateRanges.creation;
  }

  return result as SearchParams;
}

function extractDateRanges(text: string) {
  const result: {
    publication?: { start: string; end: string };
    creation?: { start: string; end: string };
  } = {};

  // Implementar extração de datas baseada em expressões comuns
  // Ex: "último ano", "desde 2020", "entre 2019 e 2020"
  // Esta é uma implementação básica que pode ser expandida

  const currentDate = new Date();

  if (/último ano|ultimo ano/i.test(text)) {
    const lastYear = new Date();
    lastYear.setFullYear(currentDate.getFullYear() - 1);
    result.publication = {
      start: lastYear.toISOString().split('T')[0],
      end: currentDate.toISOString().split('T')[0],
    };
  }

  // Adicionar mais padrões de data conforme necessário

  return result;
}

function isValidProject(project: string): boolean {
  return [
    'Rondônia',
    'Amapá',
    'Bahia',
    'BECA',
    'Rio Grande do Sul',
    'Mapeamento Sistemático',
    'Copa do Mundo 2014',
    'Olimpíadas',
    'Copa das Confederações 2013',
  ].includes(project);
}
