import { Router } from 'express';
import { SearchService } from '../services/search.js';
import { LLMService } from '../services/llm/index.js';
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

router.post(
  '/natural-search',
  validateNaturalLanguageQuery,
  asyncHandler(async (req, res) => {
    try {
      const { query, bbox } = req.body;

      // Process natural language query
      const searchParams = await llmService.processQuery({ query });

      const searchResults = await searchService.search({
        searchParams,
        bbox,
        pagination: {
          page: 1,
          limit: searchParams.limit || 10,
        },
      });

      return res.json({
        items: searchResults.items,
        metadata: {
          total: searchResults.metadata.total,
          page: searchResults.metadata.page,
          limit: searchResults.metadata.limit,
          totalPages: searchResults.metadata.totalPages,
          originalQuery: query,
          processedQuery: searchParams,
        },
      });
    } catch (error) {
      const apiError = error as ApiError;

      logger.error(
        {
          stage: 'natural_search',
          error: apiError,
          query: req.body.query,
          timestamp: new Date().toISOString(),
        },
        'Natural language search failed',
      );

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

router.post(
  '/structured-search',
  validateFullSearchRequest,
  asyncHandler(async (req, res) => {
    try {
      const { searchParams, bbox, pagination } = req.body;
      const limit = searchParams.limit || 10;

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
        pagination: {
          ...pagination,
          limit,
        },
      });

      return res.json({
        items: searchResults.items,
        metadata: {
          total: searchResults.metadata.total,
          page: searchResults.metadata.page,
          limit: searchResults.metadata.limit,
          totalPages: searchResults.metadata.totalPages,
          processedQuery: searchParams,
        },
      });
    } catch (error) {
      logger.error(
        {
          stage: 'structured_search',
          error,
          request: req.body,
          timestamp: new Date().toISOString(),
        },
        'Structured search failed',
      );

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
