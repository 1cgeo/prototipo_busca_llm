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
 * Extração de parâmetros fallback quando a LLM falha
 */
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

/**
 * Verifica se um projeto é válido
 */
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

/**
 * Extrai ranges de data de um texto
 */
function extractDateRanges(text: string) {
  const result: {
    publication?: { start: string; end: string };
    creation?: { start: string; end: string };
  } = {};

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Expressões de tempo relativas
  if (/últim[oa]s?\s+6\s+meses|ultim[oa]s?\s+6\s+meses/i.test(text)) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentMonth - 6);
    result.publication = {
      start: sixMonthsAgo.toISOString().split('T')[0],
      end: currentDate.toISOString().split('T')[0],
    };
  } else if (/últim[oa]s?\s+3\s+meses|ultim[oa]s?\s+3\s+meses/i.test(text)) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentMonth - 3);
    result.publication = {
      start: threeMonthsAgo.toISOString().split('T')[0],
      end: currentDate.toISOString().split('T')[0],
    };
  } else if (/esse ano|este ano/i.test(text)) {
    result.publication = {
      start: `${currentYear}-01-01`,
      end: `${currentYear}-12-31`,
    };
  } else if (/ano passado|último ano|ultim[oa] ano/i.test(text)) {
    result.publication = {
      start: `${currentYear - 1}-01-01`,
      end: `${currentYear - 1}-12-31`,
    };
  }

  // Expressões de períodos específicos
  const yearMatch = text.match(/em (\d{4})/i);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= 2000 && year <= currentYear) {
      result.publication = {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
      };
    }
  }

  // Período entre anos
  const yearRangeMatch = text.match(/entre (\d{4})\s+e\s+(\d{4})/i);
  if (yearRangeMatch) {
    const startYear = parseInt(yearRangeMatch[1]);
    const endYear = parseInt(yearRangeMatch[2]);
    if (startYear <= endYear && endYear <= currentYear) {
      result.publication = {
        start: `${startYear}-01-01`,
        end: `${endYear}-12-31`,
      };
    }
  }

  // Último trimestre
  if (/últim[oa] trimestre|ultim[oa] trimestre/i.test(text)) {
    const startQuarter = new Date();
    startQuarter.setMonth(currentMonth - 3);
    result.publication = {
      start: startQuarter.toISOString().split('T')[0],
      end: currentDate.toISOString().split('T')[0],
    };
  }

  // Último semestre
  if (/últim[oa] semestre|ultim[oa] semestre/i.test(text)) {
    const startSemester = new Date();
    startSemester.setMonth(currentMonth - 6);
    result.publication = {
      start: startSemester.toISOString().split('T')[0],
      end: currentDate.toISOString().split('T')[0],
    };
  }

  // Primeiro/segundo semestre de um ano específico
  const semesterMatch = text.match(
    /(primeir[oa]|segund[oa]) semestre (?:de )?(\d{4})/i,
  );
  if (semesterMatch) {
    const year = parseInt(semesterMatch[2]);
    if (year >= 2000 && year <= currentYear) {
      const isFirstSemester = /primeir[oa]/i.test(semesterMatch[1]);
      result.publication = {
        start: `${year}-${isFirstSemester ? '01' : '07'}-01`,
        end: `${year}-${isFirstSemester ? '06' : '12'}-${isFirstSemester ? '30' : '31'}`,
      };
    }
  }

  return result;
}
