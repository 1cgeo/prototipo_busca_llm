import { SearchResult, PaginatedResponse } from '@/types/api';
import { ParsedQuery } from './llm';
import { db } from './database';
import { logger } from '@/utils/logger';

export class SearchService {
  async search(parsedQuery: ParsedQuery): Promise<PaginatedResponse<SearchResult>> {
    try {
      const conditions = [];
      const params = [];
      let paramCount = 1;

      if (parsedQuery.palavraChave) {
        conditions.push(`to_tsvector('portuguese', nome || ' ' || descricao) @@ plainto_tsquery('portuguese', ${paramCount})`);
        params.push(parsedQuery.palavraChave);
        paramCount++;
      }

      if (parsedQuery.escala) {
        conditions.push(`escala = ${paramCount}`);
        params.push(parsedQuery.escala);
        paramCount++;
      }

      if (parsedQuery.tipoProduto) {
        conditions.push(`tipo_produto = ${paramCount}`);
        params.push(parsedQuery.tipoProduto);
        paramCount++;
      }

      if (parsedQuery.projeto) {
        conditions.push(`projeto = ${paramCount}`);
        params.push(parsedQuery.projeto);
        paramCount++;
      }

      if (parsedQuery.periodoPublicacao) {
        conditions.push(`data_publicacao BETWEEN ${paramCount} AND ${paramCount + 1}`);
        params.push(parsedQuery.periodoPublicacao.inicio, parsedQuery.periodoPublicacao.fim);
        paramCount += 2;
      }

      if (parsedQuery.periodoCriacao) {
        conditions.push(`data_criacao BETWEEN ${paramCount} AND ${paramCount + 1}`);
        params.push(parsedQuery.periodoCriacao.inicio, parsedQuery.periodoCriacao.fim);
        paramCount += 2;
      }

      if (parsedQuery.bbox) {
        conditions.push(`ST_Intersects(
          geometry, 
          ST_MakeEnvelope(${paramCount}, ${paramCount + 1}, ${paramCount + 2}, ${paramCount + 3}, 4326)
        )`);
        params.push(parsedQuery.bbox.oeste, parsedQuery.bbox.sul, parsedQuery.bbox.leste, parsedQuery.bbox.norte);
        paramCount += 4;
      }

      if (parsedQuery.municipio) {
        conditions.push(`EXISTS (
          SELECT 1 FROM municipios m 
          WHERE m.nome = ${paramCount} 
          AND ST_Intersects(datasets.geometry, m.geometry)
        )`);
        params.push(parsedQuery.municipio);
        paramCount++;
      }

      if (parsedQuery.estado) {
        conditions.push(`EXISTS (
          SELECT 1 FROM estados e 
          WHERE e.nome = ${paramCount} 
          AND ST_Intersects(datasets.geometry, e.geometry)
        )`);
        params.push(parsedQuery.estado);
        paramCount++;
      }

      if (parsedQuery.areaSuprimento) {
        conditions.push(`EXISTS (
          SELECT 1 FROM areas_suprimento a 
          WHERE a.nome = ${paramCount} 
          AND ST_Intersects(datasets.geometry, a.geometry)
        )`);
        params.push(parsedQuery.areaSuprimento);
        paramCount++;
      }

      const whereClause = conditions.length > 0 
        ? 'WHERE ' + conditions.join(' AND ')
        : '';

      // Calcular total de resultados
      const countQuery = `
        SELECT COUNT(*) 
        FROM datasets 
        ${whereClause}
      `;
      
      const totalCount = parseInt((await db.one(countQuery, params)).count);
      
      // Configurar paginação e ordenação
      const { limite, pagina } = parsedQuery.paginacao;
      const offset = (pagina - 1) * limite;
      
      const orderClause = parsedQuery.ordenacao 
        ? `ORDER BY ${parsedQuery.ordenacao.campo === 'dataPublicacao' ? 'data_publicacao' : 'data_criacao'} ${parsedQuery.ordenacao.direcao}`
        : 'ORDER BY data_publicacao DESC';

      // Query principal com paginação
      const sql = `
        SELECT 
          nome,
          descricao,
          escala,
          tipo_produto as "tipoProduto",
          projeto,
          data_publicacao as "dataPublicacao",
          data_criacao as "dataCriacao",
          ST_AsGeoJSON(geometry)::json as geometry
        FROM datasets
        ${whereClause}
        ${orderClause}
        LIMIT ${limite}
        OFFSET ${offset}
      `;

      logger.debug('Executing search query:', { sql, params, limite, pagina });

      const results = await db.any(sql, params);

      logger.info(`Found ${results.length} results (total: ${totalCount})`);
      
      return {
        items: results,
        metadata: {
          total: totalCount,
          pagina: pagina,
          limite: limite,
          totalPaginas: Math.ceil(totalCount / limite)
        }
      };
    } catch (error) {
      logger.error('Search error:', error);
      throw error;
    }
  }
} } from '@/types/api';
import { ParsedQuery } from './llm';
import { db } from './database';
import { logger } from '@/utils/logger';

export class SearchService {
  async search(parsedQuery: ParsedQuery): Promise<SearchResult[]> {
    try {
      const conditions = [];
      const params = [];
      let paramCount = 1;

      if (parsedQuery.palavraChave) {
        conditions.push(`to_tsvector('portuguese', nome || ' ' || descricao) @@ plainto_tsquery('portuguese', $${paramCount})`);
        params.push(parsedQuery.palavraChave);
        paramCount++;
      }

      if (parsedQuery.escala) {
        conditions.push(`escala = $${paramCount}`);
        params.push(parsedQuery.escala);
        paramCount++;
      }

      if (parsedQuery.tipoProduto) {
        conditions.push(`tipo_produto = $${paramCount}`);
        params.push(parsedQuery.tipoProduto);
        paramCount++;
      }

      if (parsedQuery.projeto) {
        conditions.push(`projeto = $${paramCount}`);
        params.push(parsedQuery.projeto);
        paramCount++;
      }

      if (parsedQuery.periodoPublicacao) {
        conditions.push(`data_publicacao BETWEEN $${paramCount} AND $${paramCount + 1}`);
        params.push(parsedQuery.periodoPublicacao.inicio, parsedQuery.periodoPublicacao.fim);
        paramCount += 2;
      }

      if (parsedQuery.periodoCriacao) {
        conditions.push(`data_criacao BETWEEN $${paramCount} AND $${paramCount + 1}`);
        params.push(parsedQuery.periodoCriacao.inicio, parsedQuery.periodoCriacao.fim);
        paramCount += 2;
      }

      if (parsedQuery.bbox) {
        conditions.push(`ST_Intersects(
          geometry, 
          ST_MakeEnvelope($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, 4326)
        )`);
        params.push(parsedQuery.bbox.oeste, parsedQuery.bbox.sul, parsedQuery.bbox.leste, parsedQuery.bbox.norte);
        paramCount += 4;
      }

      if (parsedQuery.municipio) {
        conditions.push(`EXISTS (
          SELECT 1 FROM municipios m 
          WHERE m.nome = $${paramCount} 
          AND ST_Intersects(datasets.geometry, m.geometry)
        )`);
        params.push(parsedQuery.municipio);
        paramCount++;
      }

      if (parsedQuery.estado) {
        conditions.push(`EXISTS (
          SELECT 1 FROM estados e 
          WHERE e.nome = $${paramCount} 
          AND ST_Intersects(datasets.geometry, e.geometry)
        )`);
        params.push(parsedQuery.estado);
        paramCount++;
      }

      if (parsedQuery.areaSuprimento) {
        conditions.push(`EXISTS (
          SELECT 1 FROM areas_suprimento a 
          WHERE a.nome = $${paramCount} 
          AND ST_Intersects(datasets.geometry, a.geometry)
        )`);
        params.push(parsedQuery.areaSuprimento);
        paramCount++;
      }

      const whereClause = conditions.length > 0 
        ? 'WHERE ' + conditions.join(' AND ')
        : '';

      const sql = `
        SELECT 
          nome,
          descricao,
          escala,
          tipo_produto as "tipoProduto",
          projeto,
          data_publicacao as "dataPublicacao",
          data_criacao as "dataCriacao",
          ST_AsGeoJSON(geometry)::json as geometry
        FROM datasets
        ${whereClause}
        ORDER BY data_publicacao DESC
        LIMIT 100
      `;

      logger.debug('Executing search query:', { sql, params });

      const results = await db.any(sql, params);

      logger.info(`Found ${results.length} results`);
      
      return results;
    } catch (error) {
      logger.error('Search error:', error);
      throw error;
    }
  }
}