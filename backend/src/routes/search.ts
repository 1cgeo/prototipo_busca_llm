import { Router } from 'express';
import { SearchService } from '../services/search.js';
import { LLMService } from '../services/llm/index.js'; // Atualizado
import {
  validateNaturalLanguageQuery,
  validateFullSearchRequest,
} from '../middleware/validation.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  SCALES,
  PRODUCT_TYPES,
  SUPPLY_AREAS,
  PROJECTS,
  SORT_FIELDS,
  SORT_DIRECTIONS,
} from '../types/api.js';
import type { ApiError } from '../types/errors.js';

const router = Router();
const searchService = new SearchService();
const llmService = new LLMService(config.llm.baseUrl);

// Natural language search endpoint
router.post(
  '/natural-search',
  validateNaturalLanguageQuery,
  asyncHandler(async (req, res) => {
    try {
      // Process natural language query com pré-processamento melhorado
      const searchParams = await llmService.processQuery(req.body);

      // Execute search with processed parameters and first page
      const searchResults = await searchService.search({
        searchParams,
        pagination: { page: 1, limit: searchParams.limit || 10 },
      });

      // Return results with expanded metadata
      return res.json({
        items: searchResults.items,
        metadata: {
          ...searchResults.metadata,
          originalQuery: req.body.query,
          processedQuery: searchParams, // Adicionado para debug
        },
      });
    } catch (error) {
      const apiError = error as ApiError;

      // Consolidated error logging
      logger.error(
        {
          stage: 'natural_search',
          error: apiError,
          query: req.body.query,
          timestamp: new Date().toISOString(),
        },
        'Natural language search failed',
      );

      // Return standardized error format
      return res
        .status(
          apiError.code === 'VALIDATION_ERROR' ||
            apiError.code === 'INVALID_JSON'
            ? 400
            : 500,
        )
        .json(apiError);
    }
  }),
);

// Structured search endpoint
router.post(
  '/structured-search',
  validateFullSearchRequest,
  asyncHandler(async (req, res) => {
    try {
      const { searchParams, bbox, pagination } = req.body;

      // Log structured request
      logger.info(
        {
          stage: 'structured_search',
          request: req.body,
          timestamp: new Date().toISOString(),
        },
        'Structured search request received',
      );

      const searchResults = await searchService.search({
        searchParams,
        bbox,
        pagination,
      });

      return res.json({
        items: searchResults.items,
        metadata: {
          ...searchResults.metadata,
          bbox,
        },
      });
    } catch (error) {
      // Log error
      logger.error(
        {
          stage: 'structured_search',
          error,
          request: req.body,
          timestamp: new Date().toISOString(),
        },
        'Structured search failed',
      );

      // Format error as ApiError
      const apiError: ApiError = {
        error: 'Error executing structured search',
        code: 'SEARCH_ERROR',
        details: error,
      };

      return res.status(500).json(apiError);
    }
  }),
);

// Metadata endpoint (valid values)
router.get(
  '/metadata',
  asyncHandler(async (_req, res) => {
    return res.json({
      scales: SCALES,
      productTypes: PRODUCT_TYPES,
      supplyAreas: SUPPLY_AREAS,
      projects: PROJECTS,
      sorting: {
        fields: SORT_FIELDS,
        directions: SORT_DIRECTIONS,
      },
    });
  }),
);

export default router;
