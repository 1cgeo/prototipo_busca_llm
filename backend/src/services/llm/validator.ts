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
import ValidationService from '../../services/validation.js';

const validationService = new ValidationService();

/**
 * Validates MI (Military Index) code format
 */
function isValidMI(mi: string): boolean {
  mi = mi.trim().toUpperCase();

  // MI 25k: XXXX-X-(NO|NE|SO|SE)
  const mi25kPattern = /^\d{1,4}-[1-4]-(NO|NE|SO|SE)$/;

  // MI 50k: XXXX-X
  const mi50kPattern = /^\d{1,4}-[1-4]$/;

  // MI 100k: XXXX
  const mi100kPattern = /^\d{1,4}$/;

  // MI 250k: XXX
  const mi250kPattern = /^\d{1,3}$/;

  return (
    mi25kPattern.test(mi) ||
    mi50kPattern.test(mi) ||
    mi100kPattern.test(mi) ||
    mi250kPattern.test(mi)
  );
}

/**
 * Validates INOM (Systematic Map Index Nomenclature) code format
 */
function isValidINOM(inom: string): boolean {
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

  return (
    baseINOM.test(inom) &&
    (inom250kPattern.test(inom) ||
      inom100kPattern.test(inom) ||
      inom50kPattern.test(inom) ||
      inom25kPattern.test(inom))
  );
}

/**
 * Validates the keyword field for MI or INOM patterns
 */
function validateKeyword(keyword: string): string | null {
  const normalizedKeyword = keyword.trim().toUpperCase();

  if (isValidMI(normalizedKeyword) || isValidINOM(normalizedKeyword)) {
    return normalizedKeyword;
  }

  // If it looks like an MI or INOM but isn't valid, return null
  const miPattern = /^\d{1,4}(-[1-4](-[NS][EO])?)?$/;
  const inomPattern = /^[A-Z]{2}-\d{2}/;

  if (
    miPattern.test(normalizedKeyword) ||
    inomPattern.test(normalizedKeyword)
  ) {
    logger.warn(`Invalid MI/INOM code: ${normalizedKeyword}`);
    return null;
  }

  // If it's not trying to be an MI or INOM, return as is
  return keyword;
}

export async function validateExtractedParams(
  params: Record<string, any>,
): Promise<SearchParams> {
  const validatedParams: Partial<SearchParams> = {};

  try {
    // Validate keyword (MI/INOM pattern validation)
    if (typeof params.keyword === 'string') {
      const validatedKeyword = validateKeyword(params.keyword);
      if (validatedKeyword !== null) {
        validatedParams.keyword = validatedKeyword;
      }
    }

    // Basic type validations
    if (typeof params.state === 'string') {
      validatedParams.state = params.state;
    }

    if (typeof params.city === 'string') {
      validatedParams.city = params.city;
    }

    // Validate enums
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

    // Validate sorting fields
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

    // Validate limit
    if (
      typeof params.limit === 'number' &&
      params.limit > 0 &&
      params.limit <= 100
    ) {
      validatedParams.limit = params.limit;
    }

    // Validate date periods
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

    // Validate locations against database
    const dbValidatedParams =
      await validationService.validateLocations(validatedParams);

    logger.debug(
      {
        stage: 'params_validation',
        input: params,
        output: dbValidatedParams,
      },
      'Parameters validation complete',
    );

    return dbValidatedParams as SearchParams;
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
