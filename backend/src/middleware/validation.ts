import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  SCALES,
  PRODUCT_TYPES,
  SUPPLY_AREAS,
  PROJECTS,
  SORT_FIELDS,
  SORT_DIRECTIONS,
} from '../types/api.js';

export const DateRangeSchema = z
  .object({
    start: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    end: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  })
  .refine(
    data => {
      const start = new Date(data.start);
      const end = new Date(data.end);
      return start <= end;
    },
    {
      message: 'Start date must be less than or equal to end date',
    },
  );

export const BBoxSchema = z
  .object({
    north: z.number().min(-90).max(90),
    south: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180),
    west: z.number().min(-180).max(180),
  })
  .refine(
    data => {
      return data.north > data.south && data.east > data.west;
    },
    {
      message:
        'Invalid coordinates: north must be greater than south and east must be greater than west',
    },
  );

export const SearchParamsSchema = z.object({
  keyword: z.string().optional(),
  scale: z.enum([...SCALES]).optional(),
  productType: z.enum([...PRODUCT_TYPES]).optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  supplyArea: z.enum([...SUPPLY_AREAS]).optional(),
  project: z.enum([...PROJECTS]).optional(),
  publicationPeriod: DateRangeSchema.optional(),
  creationPeriod: DateRangeSchema.optional(),
  sortField: z.enum([...SORT_FIELDS]).default('publicationDate'),
  sortDirection: z.enum([...SORT_DIRECTIONS]).default('DESC'),
  limit: z.number().min(1).max(100).optional(),
});

export const PaginationSchema = z
  .object({
    page: z.number().min(1, 'Page must be greater than 0'),
  })
  .default({
    page: 1,
  });

export const NaturalLanguageSchema = z.object({
  query: z
    .string()
    .min(5, 'Query must be at least 5 characters long')
    .max(500, 'Query must not exceed 500 characters'),
  bbox: BBoxSchema.optional(),
});

export const FullSearchRequestSchema = z.object({
  searchParams: SearchParamsSchema,
  bbox: BBoxSchema.optional(),
  pagination: PaginationSchema,
});

export const validateNaturalLanguageQuery = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    NaturalLanguageSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }
    res.status(400).json({ error: 'Invalid request' });
  }
};

export const validateFullSearchRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    FullSearchRequestSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }
    res.status(400).json({ error: 'Invalid request' });
  }
};
