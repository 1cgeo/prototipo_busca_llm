import { logger } from '../../utils/logger.js';
import {
  SCALES,
  PRODUCT_TYPES,
  SUPPLY_AREAS,
  PROJECTS,
  SORT_FIELDS,
  SORT_DIRECTIONS,
  type NaturalLanguageQuery,
  type OllamaApiResponse,
} from '../../types/api.js';
import { preprocessQuery } from './preprocessor.js';
import { validateLLMResponse } from './validator.js';
import { ApiError } from '../../types/errors.js';

export class LLMService {
  constructor(private readonly baseUrl: string) {}

  private buildPrompt(query: string): string {
    const today = new Date().toISOString().split('T')[0];
    const scalesStr = SCALES.map(e => `"${e}"`).join(', ');
    const productTypesStr = PRODUCT_TYPES.map(t => `"${t}"`).join(', ');
    const supplyAreasStr = SUPPLY_AREAS.map(a => `"${a}"`).join(', ');
    const projectsStr = PROJECTS.map(p => `"${p}"`).join(', ');
    const sortFieldsStr = SORT_FIELDS.map(f => `"${f}"`).join(', ');
    const sortDirectionsStr = SORT_DIRECTIONS.map(d => `"${d}"`).join(', ');

    return `You are a specialized system for processing cartographic data queries. Your task is to convert natural language queries in Portuguese into structured JSON format.

Query in Portuguese: "${query}"

Current date: ${today}

Example of a complex query and its JSON conversion:

Query: "Preciso de 20 cartas topográficas 1:25.000 do 2° Centro de Geoinformação publicadas em 2023 ordenadas por data de criação mais antiga"

Response:
\`\`\`json
{
  "productType": "Carta Topográfica",
  "scale": "1:25.000",
  "supplyArea": "2° Centro de Geoinformação",
  "publicationPeriod": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  },
  "sortField": "creationDate",
  "sortDirection": "ASC",
  "limit": 20
}
\`\`\`

Respond ONLY with valid JSON between THREE BACKTICKS, without any additional text:
\`\`\`json
{
  "keyword": optional string for text search,
  "scale": one of [${scalesStr}],
  "productType": one of [${productTypesStr}],
  "state": optional string with Brazilian state name,
  "city": optional string with Brazilian city name,
  "supplyArea": one of [${supplyAreasStr}],
  "project": one of [${projectsStr}],
  "publicationPeriod": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "creationPeriod": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "sortField": one of [${sortFieldsStr}],
  "sortDirection": one of [${sortDirectionsStr}],
  "limit": optional number between 1 and 100
}
\`\`\`

Processing rules:
1. Carefully analyze user intent and query context in Portuguese
2. Extract only explicitly mentioned or strongly implied information
3. For temporal references:
   - Convert expressions like "último ano", "mês passado", etc. using current date
   - Always use YYYY-MM-DD format
   - Periods must have start less than or equal to end
   - "Recente" typically means last 6 months
4. For geographical references:
   - Use official Brazilian state and city names
5. For scale references:
   - "Grande escala" implies 1:25.000 or 1:50.000
   - "Média escala" implies 1:100.000
   - "Pequena escala" implies 1:250.000
6. For sorting and limits:
   - "Mais recente" implies sortField: "publicationDate", sortDirection: "DESC"
   - "Mais antigo" implies sortField: "publicationDate", sortDirection: "ASC"
   - "Por data de criação" implies sortField: "creationDate"
   - Number mentions like "mostrar 20" sets limit to that number

Important:
- Validate all values before including them
- Omit fields when ambiguous
- Use exact values from provided options
- DO NOT add extra fields or modify JSON structure
- Respond ONLY with JSON, no additional text
- NEVER include text outside JSON block
- NEVER use comments or explanations
- Ensure JSON is syntactically correct`;
  }

  async processQuery(query: NaturalLanguageQuery) {
    try {
      // Pré-processa a query
      const processedQuery = preprocessQuery(query.query);

      // Gera o prompt
      const prompt = this.buildPrompt(processedQuery);

      // Registra o tempo de início
      const startTime = Date.now();

      // Faz a requisição para a LLM
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: 'deepseek-r1:7b',
          temperature: 0.1,
          max_tokens: 1000,
          stream: false,
        }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        logger.error(
          {
            stage: 'llm_request',
            originalQuery: query.query,
            processedQuery,
            status: response.status,
            statusText: response.statusText,
            duration,
          },
          'LLM request failed',
        );

        throw {
          error: 'LLM request error',
          code: 'LLM_ERROR',
          details: {
            status: response.status,
            statusText: response.statusText,
          },
          originalQuery: query.query,
        } as ApiError;
      }

      const data = (await response.json()) as OllamaApiResponse;

      // Valida e processa a resposta
      return validateLLMResponse(data.response, processedQuery);
    } catch (error) {
      // Se já é um ApiError, propaga
      if ((error as ApiError).code) {
        throw error;
      }

      // Caso contrário, cria um novo ApiError
      throw {
        error: 'LLM processing error',
        code: 'LLM_ERROR',
        details: error,
        originalQuery: query.query,
      } as ApiError;
    }
  }
}

export default LLMService;
