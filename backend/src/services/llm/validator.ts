import { logger } from '../../utils/logger.js';
import type { SearchParams } from '../../types/api.js';
import {
  SCALES,
  PRODUCT_TYPES,
  SUPPLY_AREAS,
  PROJECTS,
  SORT_FIELDS,
  SORT_DIRECTIONS,
} from '../../types/api.js';

function isValidMI(mi: string): boolean {
  // Remove espaços e converte para maiúsculo para padronização
  mi = mi.trim().toUpperCase();

  // MI 25k: XXXX-X-(NO|NE|SO|SE)
  // Ex: 2965-2-NE, 123-1-SO, 1-2-SE
  const mi25kPattern = /^\d{1,4}-[1-4]-(NO|NE|SO|SE)$/;

  // MI 50k: XXXX-X
  // Ex: 2866-3, 123-1, 1-4
  const mi50kPattern = /^\d{1,4}-[1-4]$/;

  // MI 100k: XXXX
  // Ex: 2901, 123, 45, 1
  const mi100kPattern = /^\d{1,4}$/;

  // MI 250k: XXX
  // Ex: 530, 12, 1
  const mi250kPattern = /^\d{1,3}$/;

  if (mi25kPattern.test(mi)) return true;
  if (mi50kPattern.test(mi)) return true;
  if (mi100kPattern.test(mi)) return true;
  if (mi250kPattern.test(mi)) return true;

  return false;
}

function isValidINOM(inom: string): boolean {
  // Remove espaços e converte para maiúsculo para padronização
  inom = inom.trim().toUpperCase();

  // Componentes básicos do INOM
  const baseINOM = /^[A-Z]{2}-\d{2}-[A-Z]-[A-Z]/;

  // INOM 250k: SF-22-Y-D
  const inom250kPattern = /^[A-Z]{2}-\d{2}-[A-Z]-[A-Z]$/;

  // INOM 100k: SF-22-Y-D-II
  const inom100kPattern = /^[A-Z]{2}-\d{2}-[A-Z]-[A-Z]-[IVX]{1,6}$/;

  // INOM 50k: SF-22-Y-D-II-4
  const inom50kPattern = /^[A-Z]{2}-\d{2}-[A-Z]-[A-Z]-[IVX]{1,6}-[1-4]$/;

  // INOM 25k: SF-22-Y-D-II-4-SE
  const inom25kPattern =
    /^[A-Z]{2}-\d{2}-[A-Z]-[A-Z]-[IVX]{1,6}-[1-4]-(NO|NE|SO|SE)$/;

  // Verifica primeiro se tem o formato base
  if (!baseINOM.test(inom)) return false;

  // Verifica cada padrão específico
  if (inom25kPattern.test(inom)) return true;
  if (inom50kPattern.test(inom)) return true;
  if (inom100kPattern.test(inom)) return true;
  if (inom250kPattern.test(inom)) return true;

  return false;
}

export function validateExtractedParams(
  params: Record<string, any>,
): SearchParams {
  const validatedParams: Partial<SearchParams> = {};

  try {
    // Validação do keyword - agora inclui validação de MI e INOM
    if (typeof params.keyword === 'string') {
      const keyword = params.keyword.trim();
      // Verifica se é um MI ou INOM válido
      if (isValidMI(keyword) || isValidINOM(keyword)) {
        validatedParams.keyword = keyword;
      } else {
        // Se não for MI ou INOM, aceita como keyword normal
        validatedParams.keyword = keyword;
      }
    }

    // Validação de campos simples string/number
    if (typeof params.state === 'string') {
      validatedParams.state = params.state;
    }

    if (typeof params.city === 'string') {
      validatedParams.city = params.city;
    }

    // Validação de enums
    if (params.scale && SCALES.includes(params.scale)) {
      validatedParams.scale = params.scale;
    }

    if (params.productType && PRODUCT_TYPES.includes(params.productType)) {
      validatedParams.productType = params.productType;
    }

    if (params.supplyArea && SUPPLY_AREAS.includes(params.supplyArea)) {
      validatedParams.supplyArea = params.supplyArea;
    }

    if (params.project && PROJECTS.includes(params.project)) {
      validatedParams.project = params.project;
    }

    // Validação de campos de ordenação
    if (params.sortField && SORT_FIELDS.includes(params.sortField)) {
      validatedParams.sortField = params.sortField;
    } else {
      validatedParams.sortField = 'publicationDate'; // valor default
    }

    if (
      params.sortDirection &&
      SORT_DIRECTIONS.includes(params.sortDirection)
    ) {
      validatedParams.sortDirection = params.sortDirection;
    } else {
      validatedParams.sortDirection = 'DESC'; // valor default
    }

    // Validação do limite
    if (
      typeof params.limit === 'number' &&
      params.limit > 0 &&
      params.limit <= 100
    ) {
      validatedParams.limit = params.limit;
    }

    // Validação de períodos de data
    if (params.publicationPeriod) {
      if (isValidDatePeriod(params.publicationPeriod)) {
        validatedParams.publicationPeriod = params.publicationPeriod;
      }
    }

    if (params.creationPeriod) {
      if (isValidDatePeriod(params.creationPeriod)) {
        validatedParams.creationPeriod = params.creationPeriod;
      }
    }

    logger.debug(
      {
        stage: 'params_validation',
        input: params,
        output: validatedParams,
      },
      'Parameters validation complete',
    );

    return validatedParams as SearchParams;
  } catch (error) {
    logger.error(
      {
        stage: 'params_validation',
        error,
        params,
      },
      'Error validating parameters',
    );

    // Em caso de erro, retorna objeto com valores default mínimos
    return {
      sortField: 'publicationDate',
      sortDirection: 'DESC',
    } as SearchParams;
  }
}

function isValidDatePeriod(period: any): boolean {
  if (!period || typeof period !== 'object') return false;

  const { start, end } = period;
  if (!start || !end) return false;

  // Validação do formato da data (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(start) || !dateRegex.test(end)) return false;

  // Validação de datas válidas
  const startDate = new Date(start);
  const endDate = new Date(end);

  return (
    !isNaN(startDate.getTime()) &&
    !isNaN(endDate.getTime()) &&
    startDate <= endDate
  );
}
