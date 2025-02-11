import { COMMON_TERMS } from './constants.js';
import {
  SCALES,
  PRODUCT_TYPES,
  SUPPLY_AREAS,
  type Scale,
  type ProductType,
  type Project,
  type SearchParams,
} from '../../types/api.js';

/**
 * Verifica se um projeto é válido
 */
function isValidProject(project: string): boolean {
  return [
    'AMAN',
    'Base Cartográfica Digital da Bahia',
    'Base Cartográfica Digital de Rondônia',
    'Base Cartográfica Digital do Amapá',
    'COTer Não EDGV',
    'Cobertura Aerofotogramétrica do Estado de São Paulo',
    'Conversão do Mapeamento Sistematico do SCN para Vetorial',
    'Copa das Confederações',
    'Copa do Mundo 2014',
    'Mapeamento Sistemático',
    'Mapeamento de Áreas de Interesse da Força',
    'NGA-BECA',
    'Olimpíadas Rio 2016',
    'Produtos Temáticos Diversos',
    'Radiografia da Amazônia',
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
  const currentMonth = currentDate.getMonth() + 1;

  // Expressões de tempo relativas
  if (/últim[oa]s?\s+6\s+meses|ultim[oa]s?\s+6\s+meses/i.test(text)) {
    const startDate = new Date(currentDate);
    startDate.setMonth(currentMonth - 6);
    result.publication = {
      start: startDate.toISOString().split('T')[0],
      end: currentDate.toISOString().split('T')[0],
    };
  } else if (/últim[oa]s?\s+3\s+meses|ultim[oa]s?\s+3\s+meses/i.test(text)) {
    const startDate = new Date(currentDate);
    startDate.setMonth(currentMonth - 3);
    result.publication = {
      start: startDate.toISOString().split('T')[0],
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

  // Último trimestre atual
  if (/últim[oa] trimestre|ultim[oa] trimestre/i.test(text)) {
    const quarterStartMonth = Math.floor((currentMonth - 1) / 3) * 3;
    const startDate = new Date(currentYear, quarterStartMonth, 1);
    const endDate = new Date(currentYear, quarterStartMonth + 3, 0);
    result.publication = {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  }

  // Trimestre específico
  const quarterMatch = text.match(
    /(primeir[oa]|segund[oa]|terceir[oa]|quart[oa]) trimestre(?: de )?(\d{4})?/i,
  );
  if (quarterMatch) {
    const year = quarterMatch[2] ? parseInt(quarterMatch[2]) : currentYear;
    if (year <= currentYear) {
      let startMonth = 0;
      if (/segund[oa]/i.test(quarterMatch[1])) startMonth = 3;
      else if (/terceir[oa]/i.test(quarterMatch[1])) startMonth = 6;
      else if (/quart[oa]/i.test(quarterMatch[1])) startMonth = 9;

      const startDate = new Date(year, startMonth, 1);
      const endDate = new Date(year, startMonth + 3, 0);
      result.publication = {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      };
    }
  }

  // Último semestre
  if (/últim[oa] semestre|ultim[oa] semestre/i.test(text)) {
    const semesterStartMonth = Math.floor((currentMonth - 1) / 6) * 6;
    const startDate = new Date(currentYear, semesterStartMonth, 1);
    const endDate = new Date(currentYear, semesterStartMonth + 6, 0);
    result.publication = {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  }

  // Primeiro/segundo semestre de um ano específico
  const semesterMatch = text.match(
    /(primeir[oa]|segund[oa]) semestre(?: de )?(\d{4})?/i,
  );
  if (semesterMatch) {
    const year = semesterMatch[2] ? parseInt(semesterMatch[2]) : currentYear;
    if (year <= currentYear) {
      const isFirstSemester = /primeir[oa]/i.test(semesterMatch[1]);
      const startMonth = isFirstSemester ? 0 : 6;
      const startDate = new Date(year, startMonth, 1);
      const endDate = new Date(year, startMonth + 6, 0);
      result.publication = {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      };
    }
  }

  // Se tiver menção explícita a criação, move para creation
  if (/criad[oa]|elaborad[oa]|produzid[oa]/i.test(text) && result.publication) {
    result.creation = result.publication;
    delete result.publication;
  }

  return result;
}

/**
 * Extrai escala a partir do texto
 */
function extractScale(text: string): Scale | undefined {
  // Padrões diretos de escala (1:X.000)
  const directScalePattern = /1:([0-9.]+)\.?000/i;
  const match = text.match(directScalePattern);
  if (match) {
    const scaleStr = `1:${match[1]}.000` as Scale;
    if (SCALES.includes(scaleStr)) {
      return scaleStr;
    }
  }

  // Padrões numéricos (25k, 25.000, etc)
  const numericPatterns = [/\b(\d+)k\b/i, /\b(\d+)\.000\b/, /\b(\d+)000\b/];

  for (const pattern of numericPatterns) {
    const match = text.match(pattern);
    if (match) {
      const scaleStr = `1:${match[1]}.000` as Scale;
      if (SCALES.includes(scaleStr)) {
        return scaleStr;
      }
    }
  }

  // Termos descritivos
  if (/\b(grande|detalhad[ao]|maior)\b/i.test(text)) {
    return '1:1.000';
  }
  if (/\b(media|média)\b/i.test(text)) {
    return '1:50.000';
  }
  if (/\b(pequena|menor)\b/i.test(text)) {
    return '1:250.000';
  }

  return undefined;
}

/**
 * Extrai tipo de produto a partir do texto
 */
function extractProductType(text: string): ProductType | undefined {
  const normalizedText = text.toLowerCase();

  // Procura correspondência exata nos tipos de produto
  const exactMatch = PRODUCT_TYPES.find(type =>
    normalizedText.includes(type.toLowerCase()),
  );
  if (exactMatch) {
    return exactMatch;
  }

  // Verifica MDS/MDT
  if (/\bmds\b/.test(normalizedText)) {
    return normalizedText.includes('modelo')
      ? 'Modelo Tridimensional MDS'
      : 'MDS - RAM';
  }
  if (/\bmdt\b/.test(normalizedText)) {
    return normalizedText.includes('modelo')
      ? 'Modelo Tridimensional MDT'
      : 'MDT - RAM';
  }

  // Verifica ortoimagens
  if (
    normalizedText.includes('ortoimagem') ||
    normalizedText.includes('orto')
  ) {
    if (normalizedText.includes('scn')) return 'Ortoimagem SCN';
    if (normalizedText.includes('radar')) return 'Ortoimagem Radar Colorida';
    if (
      normalizedText.includes('banda p') ||
      normalizedText.includes('polarizacao p')
    ) {
      if (normalizedText.includes('hh')) return 'Ortoimagem banda P pol HH';
      if (normalizedText.includes('hv')) return 'Ortoimagem banda P pol HV';
      return 'Ortoimagem banda P';
    }
    if (
      normalizedText.includes('banda x') ||
      normalizedText.includes('polarizacao x')
    ) {
      if (normalizedText.includes('hh')) return 'Ortoimagem banda X pol HH';
    }
    if (normalizedText.includes('especial')) return 'Carta Ortoimagem Especial';
    return 'Ortoimagem';
  }

  // Verifica tipos temáticos
  const tematicMatches: Record<string, ProductType> = {
    circ: 'Tematico CIRC',
    cirp: 'Tematico CIRP',
    cisc: 'Tematico CISC',
    cisp: 'Tematico CISP',
    cmil: 'Tematico CMIL',
    ctbl: 'Tematico CTBL',
    ctp: 'Tematico CTP',
  };

  for (const [key, value] of Object.entries(tematicMatches)) {
    if (normalizedText.includes(key.toLowerCase())) {
      return value as ProductType;
    }
  }

  return undefined;
}

/**
 * Extração de parâmetros fallback quando a LLM falha
 */
export function fallbackExtraction(text: string): SearchParams {
  const result: Partial<SearchParams> = {};
  const normalizedText = text.toLowerCase();

  // Extrai escala
  const scale = extractScale(text);
  if (scale) {
    result.scale = scale;
  }

  // Extrai tipo de produto
  const productType = extractProductType(text);
  if (productType) {
    result.productType = productType;
  }

  // Extrai área de suprimento
  const cgeoMatch = text.match(/(\d)[ºo°]?\s*cgeo/i);
  if (cgeoMatch && ['1', '2', '3', '4', '5'].includes(cgeoMatch[1])) {
    const area = `${cgeoMatch[1]}° Centro de Geoinformação`;
    if (SUPPLY_AREAS.includes(area as any)) {
      result.supplyArea = area as any;
    }
  }

  // Extrai projeto a partir do COMMON_TERMS
  for (const [term, fullName] of Object.entries(COMMON_TERMS)) {
    if (normalizedText.includes(term.toLowerCase())) {
      if (isValidProject(fullName)) {
        result.project = fullName as Project;
        break;
      }
    }
  }

  // Extrai ordenação
  if (/recent|nov[oa]|atual|últim[oa]/i.test(text)) {
    result.sortField = 'publicationDate';
    result.sortDirection = 'DESC';
  } else if (/antig[oa]/i.test(text)) {
    result.sortField = 'publicationDate';
    result.sortDirection = 'ASC';
  }

  // Extrai limite numérico
  const limitMatch = text.match(/\b(\d+)\s*(carta|resultado|item)/i);
  if (limitMatch) {
    const limit = parseInt(limitMatch[1]);
    if (limit > 0 && limit <= 100) {
      result.limit = limit;
    }
  }

  // Extrai datas
  const dateRanges = extractDateRanges(text);
  if (dateRanges.publication) {
    result.publicationPeriod = dateRanges.publication;
  }
  if (dateRanges.creation) {
    result.creationPeriod = dateRanges.creation;
  }

  return result as SearchParams;
}
