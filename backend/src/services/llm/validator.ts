import { logger } from '../../utils/logger.js';
import { findClosestMatch } from './utils.js';
import {
  SCALES,
  PRODUCT_TYPES,
  SUPPLY_AREAS,
  PROJECTS,
  SORT_FIELDS,
  SORT_DIRECTIONS,
  type Scale,
  type ProductType,
  type SupplyArea,
  type Project,
  type SortField,
  type SortDirection,
  type SearchParams,
} from '../../types/api.js';

export function validateLLMResponse(response: string): SearchParams {
  try {
    // Remove blocos think/thought
    response = response.replace(/<think>[\s\S]*?<\/think>/gi, '');
    response = response.replace(/<thought>[\s\S]*?<\/thought>/gi, '');

    // Tenta extrair JSON da resposta
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;
    const cleanJson = jsonString.replace(/,(\s*[}\]])/g, '$1');

    // Parse do JSON
    const parsedJson = JSON.parse(cleanJson);

    return extractValidFields(parsedJson);
  } catch (error) {
    logger.warn(
      'Failed to parse LLM response JSON, falling back to text analysis',
      {
        error,
        response,
      },
    );

    // Se falhar o parse, retorna objeto vazio que será tratado pelo fallback
    return {} as SearchParams;
  }
}

function extractValidFields(data: Record<string, any>): SearchParams {
  const result: Partial<SearchParams> = {};

  // Validar e extrair campos válidos
  if (typeof data.keyword === 'string') {
    result.keyword = data.keyword;
  }

  // Escala com aproximação
  if (data.scale) {
    const matchedScale = findClosestMatch(data.scale.toString(), SCALES) as
      | Scale
      | undefined;
    if (matchedScale) {
      result.scale = matchedScale;
    }
  }

  // Tipo de produto com aproximação
  if (data.productType) {
    const matchedType = findClosestMatch(
      data.productType.toString(),
      PRODUCT_TYPES,
    ) as ProductType | undefined;
    if (matchedType) {
      result.productType = matchedType;
    }
  }

  // Estado e cidade (strings simples)
  if (typeof data.state === 'string') {
    result.state = data.state;
  }
  if (typeof data.city === 'string') {
    result.city = data.city;
  }

  // Área de suprimento com aproximação
  if (data.supplyArea) {
    const matchedArea = findClosestMatch(
      data.supplyArea.toString(),
      SUPPLY_AREAS,
    ) as SupplyArea | undefined;
    if (matchedArea) {
      result.supplyArea = matchedArea;
    }
  }

  // Projeto com aproximação
  if (data.project) {
    const matchedProject = findClosestMatch(
      data.project.toString(),
      PROJECTS,
    ) as Project | undefined;
    if (matchedProject) {
      result.project = matchedProject;
    }
  }

  // Períodos de data
  if (isValidDatePeriod(data.publicationPeriod)) {
    result.publicationPeriod = data.publicationPeriod;
  }
  if (isValidDatePeriod(data.creationPeriod)) {
    result.creationPeriod = data.creationPeriod;
  }

  // Campos de ordenação com aproximação
  if (data.sortField) {
    const matchedField = findClosestMatch(
      data.sortField.toString(),
      SORT_FIELDS,
    ) as SortField | undefined;
    if (matchedField) {
      result.sortField = matchedField;
    }
  }

  if (data.sortDirection) {
    const matchedDirection = findClosestMatch(
      data.sortDirection.toString(),
      SORT_DIRECTIONS,
    ) as SortDirection | undefined;
    if (matchedDirection) {
      result.sortDirection = matchedDirection;
    }
  }

  // Limite numérico
  if (typeof data.limit === 'number' && data.limit > 0 && data.limit <= 100) {
    result.limit = data.limit;
  }

  // Adiciona valores default se não existirem
  if (!result.sortField) {
    result.sortField = 'publicationDate';
  }
  if (!result.sortDirection) {
    result.sortDirection = 'DESC';
  }

  return result as SearchParams;
}

function isValidDatePeriod(period: any): boolean {
  if (!period || typeof period !== 'object') return false;

  const { start, end } = period;
  if (!start || !end) return false;

  const startDate = new Date(start);
  const endDate = new Date(end);

  return (
    !isNaN(startDate.getTime()) &&
    !isNaN(endDate.getTime()) &&
    startDate <= endDate
  );
}
