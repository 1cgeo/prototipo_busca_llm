import { db } from '../db/connection.js';
import { logger } from '../utils/logger.js';
import type { SearchParams } from '../types/api.js';

export class ValidationService {
  /**
   * Validates location data (state and city) against the database
   */
  async validateLocations(
    params: Partial<SearchParams>,
  ): Promise<Partial<SearchParams>> {
    const validatedParams = { ...params };

    try {
      if (params.state) {
        const stateExists = await db.oneOrNone(
          `
          SELECT nome 
          FROM estados 
          WHERE unaccent(lower(nome)) ILIKE unaccent(lower($1))
          OR sigla ILIKE $2
        `,
          [params.state, params.state.length === 2 ? params.state : null],
        );

        if (stateExists) {
          validatedParams.state = stateExists.nome; // Use standardized name from database
        } else {
          delete validatedParams.state;
          logger.warn(`Invalid state: ${params.state}`);
        }
      }

      if (params.city) {
        const cityQuery = `
          SELECT DISTINCT m.nome
          FROM municipios m
          WHERE unaccent(lower(m.nome)) ILIKE unaccent(lower($1))
          ${
            params.state
              ? `
            AND m.sigla_estado = (
              SELECT sigla FROM estados 
              WHERE nome = $2
            )`
              : ''
          }
        `;

        const cityExists = await db.oneOrNone(
          cityQuery,
          params.state ? [params.city, params.state] : [params.city],
        );

        if (cityExists) {
          validatedParams.city = cityExists.nome; // Use standardized name from database
        } else {
          delete validatedParams.city;
          logger.warn(`Invalid city: ${params.city}`);
        }
      }

      return validatedParams;
    } catch (error) {
      logger.error('Error validating locations:', error);
      return params; // Return original params on error
    }
  }
}

export default ValidationService;
