import { db } from '../db/connection.js';
import { logger } from '../utils/logger.js';
import {
  QueryResult,
  SearchParams,
  PaginationParams,
  BoundingBox,
} from '../types/api.js';

export class SearchService {
  async search({
    searchParams,
    bbox,
    pagination,
  }: {
    searchParams: SearchParams;
    bbox?: BoundingBox;
    pagination: PaginationParams;
  }): Promise<QueryResult> {
    try {
      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 1;

      // Ensure searchParams is initialized
      searchParams = searchParams || {};

      // Keyword search - now includes MI and INOM
      if (searchParams.keyword) {
        conditions.push(`(
          texto_busca @@ websearch_to_tsquery('portuguese', $${paramCount})
          OR CASE 
            WHEN $${paramCount + 1} ~ '^([0-9]{1,4}-[1-4]-(NO|NE|SO|SE)|[0-9]{1,4}-[1-4]|[0-9]{1,4}|[0-9]{1,3})$'
              THEN mi = $${paramCount + 1}
            WHEN $${paramCount + 1} ~ '^[A-Z]{2}-[0-9]{2}(-[A-Z]-[A-Z](-[IVX]{1,6}(-[1-4](-[NS][EO])?)?)?)?$'
              THEN inom = $${paramCount + 1}
            ELSE lower(nome) LIKE lower($${paramCount + 2})
          END
        )`);

        params.push(
          searchParams.keyword,
          searchParams.keyword,
          `%${searchParams.keyword}%`,
        );
        paramCount += 3;
      }

      // Exact filters
      if (searchParams.scale) {
        conditions.push(`escala = $${paramCount}`);
        params.push(searchParams.scale);
        paramCount++;
      }

      if (searchParams.productType) {
        conditions.push(`tipo_produto = $${paramCount}`);
        params.push(searchParams.productType);
        paramCount++;
      }

      if (searchParams.project) {
        conditions.push(`projeto = $${paramCount}`);
        params.push(searchParams.project);
        paramCount++;
      }

      // Date period filters with date normalization
      if (searchParams.publicationPeriod) {
        conditions.push(
          `date_trunc('day', data_publicacao) BETWEEN 
           date_trunc('day', $${paramCount}::timestamp) AND 
           date_trunc('day', $${paramCount + 1}::timestamp)`,
        );
        params.push(
          searchParams.publicationPeriod.start,
          searchParams.publicationPeriod.end,
        );
        paramCount += 2;
      }

      if (searchParams.creationPeriod) {
        conditions.push(
          `date_trunc('day', data_criacao) BETWEEN 
           date_trunc('day', $${paramCount}::timestamp) AND 
           date_trunc('day', $${paramCount + 1}::timestamp)`,
        );
        params.push(
          searchParams.creationPeriod.start,
          searchParams.creationPeriod.end,
        );
        paramCount += 2;
      }

      // Spatial filters using PostGIS
      if (bbox) {
        conditions.push(
          `ST_Intersects(
            geom, 
            ST_MakeEnvelope($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, 4326)
          )`,
        );
        params.push(bbox.west, bbox.south, bbox.east, bbox.north);
        paramCount += 4;
      }

      // City intersection using normalized search
      if (searchParams.city) {
        conditions.push(`EXISTS (
          SELECT 1 FROM municipios m 
          WHERE unaccent(lower(m.nome)) ILIKE unaccent(lower($${paramCount}))
          AND ST_Intersects(datasets.geom, m.geom)
        )`);
        params.push(`%${searchParams.city}%`);
        paramCount++;
      }

      // State intersection using normalized search
      if (searchParams.state) {
        conditions.push(`EXISTS (
          SELECT 1 FROM estados e 
          WHERE unaccent(lower(e.nome)) ILIKE unaccent(lower($${paramCount}))
          AND ST_Intersects(datasets.geom, e.geom)
        )`);
        params.push(`%${searchParams.state}%`);
        paramCount++;
      }

      // Supply area intersection
      if (searchParams.supplyArea) {
        conditions.push(`EXISTS (
          SELECT 1 FROM areas_suprimento a 
          WHERE a.nome = $${paramCount}
          AND ST_Intersects(datasets.geom, a.geom)
        )`);
        params.push(searchParams.supplyArea);
        paramCount++;
      }

      const whereClause =
        conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      // Sorting with default values
      const orderField =
        searchParams.sortField === 'creationDate'
          ? 'data_criacao'
          : 'data_publicacao';
      const orderDirection = searchParams.sortDirection || 'DESC';
      const orderClause = `ORDER BY ${orderField} ${orderDirection}`;

      // Pagination with default values
      const limit = pagination.limit || 10;
      const offset = ((pagination.page || 1) - 1) * limit;
      const limitClause = `LIMIT ${limit} OFFSET ${offset}`;

      // Count query
      const countQuery = `
        SELECT COUNT(*)::integer as total
        FROM datasets
        ${whereClause}
      `;

      // Main query
      const mainQuery = `
        SELECT 
          nome as name,
          mi,
          inom,
          escala as scale,
          tipo_produto as "productType",
          projeto as project,
          data_publicacao as "publicationDate",
          data_criacao as "creationDate",
          ST_AsGeoJSON(geom)::json as geometry
        FROM datasets
        ${whereClause}
        ${orderClause}
        ${limitClause}
      `;

      // Execute queries in parallel
      const [total, items] = await Promise.all([
        db.one(countQuery, params),
        db.any(mainQuery, params),
      ]);

      logger.debug(
        {
          searchParams,
          pagination,
          total: total.total,
          resultCount: items.length,
          conditions,
          params,
        },
        'Search executed successfully',
      );

      return {
        items,
        metadata: {
          total: total.total,
          page: pagination.page || 1,
          limit,
          totalPages: Math.ceil(total.total / limit),
          processedQuery: searchParams,
        },
      };
    } catch (error) {
      logger.error(
        { error, searchParams, pagination },
        'Error executing search',
      );
      throw error;
    }
  }
}
