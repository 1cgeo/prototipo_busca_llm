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

export function validateExtractedParams(
  params: Record<string, any>,
): SearchParams {
  const validatedParams: Partial<SearchParams> = {};

  try {
    // Validação de campos simples string/number
    if (typeof params.keyword === 'string') {
      validatedParams.keyword = params.keyword;
    }

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
