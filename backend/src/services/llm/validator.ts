import { logger } from '../../utils/logger.js';
import { findClosestMatch } from './utils.js';
import {
  SCALES,
  PRODUCT_TYPES,
  SUPPLY_AREAS,
  PROJECTS,
  SORT_FIELDS,
  SORT_DIRECTIONS,
} from '../../types/api.js';
import { SearchParamsSchema } from '../../middleware/validation.js';
import { ApiError } from '../../types/errors.js';
import { z } from 'zod';

const validKeys = {
  keyword: (v: any) => typeof v === 'string',
  scale: (v: any) => findClosestMatch(v, SCALES),
  productType: (v: any) => findClosestMatch(v, PRODUCT_TYPES),
  state: (v: any) => typeof v === 'string',
  city: (v: any) => typeof v === 'string',
  supplyArea: (v: any) => findClosestMatch(v, SUPPLY_AREAS),
  project: (v: any) => findClosestMatch(v, PROJECTS),
  publicationPeriod: (v: any) => {
    if (typeof v !== 'object' || !v.start || !v.end) return undefined;
    return {
      start: v.start,
      end: v.end,
    };
  },
  creationPeriod: (v: any) => {
    if (typeof v !== 'object' || !v.start || !v.end) return undefined;
    return {
      start: v.start,
      end: v.end,
    };
  },
  sortField: (v: any) => findClosestMatch(v, SORT_FIELDS),
  sortDirection: (v: any) => findClosestMatch(v, SORT_DIRECTIONS),
  limit: (v: any) =>
    typeof v === 'number' && v > 0 && v <= 100 ? v : undefined,
};

export function validateLLMResponse(response: string, originalQuery: string) {
  try {
    // Remove tags think ou thought
    response = response.replace(/<think>[\s\S]*?<\/think>/gi, '');
    response = response.replace(/<thought>[\s\S]*?<\/thought>/gi, '');

    // Extract JSON from between backticks
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;

    // Clean up trailing commas
    const cleanJson = jsonString.replace(/,(\s*[}\]])/g, '$1');

    // Parse JSON
    const parsedJson = JSON.parse(cleanJson);

    // Normaliza e valida cada campo
    const normalizedJson = Object.entries(parsedJson).reduce(
      (acc, [key, value]) => {
        if (key in validKeys) {
          const normalizedValue =
            validKeys[key as keyof typeof validKeys](value);
          if (normalizedValue !== undefined) {
            acc[key] = normalizedValue;
          }
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    // Remove empty values
    const cleanedJson = Object.fromEntries(
      Object.entries(normalizedJson).filter(([_, value]) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'object' && Object.keys(value).length === 0)
          return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      }),
    );

    // Add defaults
    const jsonWithDefaults = {
      ...cleanedJson,
      sortField: cleanedJson.sortField || 'publicationDate',
      sortDirection: cleanedJson.sortDirection || 'DESC',
    };

    const validatedResponse = SearchParamsSchema.parse(jsonWithDefaults);

    logger.info(
      {
        stage: 'llm_validation',
        originalQuery,
        parsedResponse: validatedResponse,
      },
      'LLM response validation complete',
    );

    return validatedResponse;
  } catch (error) {
    logger.error(
      {
        stage: 'llm_validation',
        originalQuery,
        error,
        rawResponse: response,
      },
      'LLM response validation failed',
    );

    if (error instanceof SyntaxError) {
      throw {
        error: 'Invalid JSON returned by LLM',
        code: 'INVALID_JSON',
        details: error,
        originalQuery,
      } as ApiError;
    }

    throw {
      error: 'Invalid response format',
      code: 'VALIDATION_ERROR',
      details: error instanceof z.ZodError ? error.errors : error,
      originalQuery,
    } as ApiError;
  }
}
