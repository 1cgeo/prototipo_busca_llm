import { logger } from '../../utils/logger.js';
import {
  SCALES,
  PRODUCT_TYPES,
  SUPPLY_AREAS,
  PROJECTS,
  SORT_FIELDS,
  SORT_DIRECTIONS,
} from '../../types/api.js';
import { preprocessQuery } from './preprocessor.js';
import { validateLLMResponse } from './validator.js';
import { fallbackExtraction } from './utils.js';
import type {
  SearchParams,
  NaturalLanguageQuery,
  OllamaApiResponse,
} from '../../types/api.js';

export class LLMService {
  constructor(private readonly baseUrl: string) {}

  async processQuery(query: NaturalLanguageQuery): Promise<{
    searchParams: SearchParams;
    preprocessedText: string;
  }> {
    // Pré-processa a query
    const preprocessedText = preprocessQuery(query.query);

    try {
      // Tenta obter resposta da LLM
      const llmResponse = await this.callLLM(preprocessedText);

      // Valida e extrai campos válidos
      const searchParams = validateLLMResponse(llmResponse);

      // Se não obteve nenhum parâmetro válido, vai para fallback
      if (Object.keys(searchParams).length === 0) {
        logger.info('No valid parameters from LLM, using fallback', {
          originalQuery: query.query,
          preprocessedText,
        });
        return {
          searchParams: fallbackExtraction(preprocessedText),
          preprocessedText,
        };
      }

      return { searchParams, preprocessedText };
    } catch (error) {
      // Qualquer erro no processo leva ao fallback
      logger.warn('Error in LLM processing, using fallback', {
        error,
        originalQuery: query.query,
        preprocessedText,
      });

      return {
        searchParams: fallbackExtraction(preprocessedText),
        preprocessedText,
      };
    }
  }

  private async callLLM(processedQuery: string): Promise<string> {
    const prompt = this.buildPrompt(processedQuery);

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        model: 'deepseek-r1:1.5b',
        temperature: 0.6,
        max_tokens: 1000,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM request failed: ${response.statusText}`);
    }

    const data = (await response.json()) as OllamaApiResponse;
    return data.response;
  }

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

First, analyze the query by answering these questions (think step by step):

1. Scale:
- Is there any mention of scale (escala)?
- Check for: "1:25.000", "25k", "grande escala", etc.
- Remember: "grande escala" = 1:25.000, "média" = 1:100.000, "pequena" = 1:250.000
- Valid scales: ${scalesStr}

2. Product Type:
- What type of cartographic product is requested?
- Check for: "carta topográfica", "carta ortoimagem", "mapa", etc.
- Remember: "mapa" = "carta"
- Valid types: ${productTypesStr}

3. Geographic Location:
- Any mention of Brazilian states or cities?
- Check state abbreviations (RJ = Rio de Janeiro)
- Check city names

4. Supply Area:
- Any mention of CGEO/Centro de Geoinformação?
- Check patterns: "1º CGEO", "2° CGEO", etc.
- Valid areas: ${supplyAreasStr}

5. Project:
- Any mention of specific projects?
- Check variations: "copa" = "Copa do Mundo 2014"
- Valid projects: ${projectsStr}

6. Time Period:
- Any temporal references?
- Check for: "último ano", "recente", "publicado em"
- Convert relative dates using current date

7. Sorting & Quantity:
- Any mention of ordering or limits?
- Check for: "mais recente", "mais antigo", "primeiros 20"
- Valid sort fields: ${sortFieldsStr}
- Valid directions: ${sortDirectionsStr}

Example of complex query processing:
Query: "Preciso de 20 cartas topográficas 1:25.000 do 2° CGEO publicadas em 2023 ordenadas por data de criação mais antiga"
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

Essential Rules:
1. Include ONLY explicitly mentioned or strongly implied fields
2. For dates: "recente" = last 6 months, "esse ano" = current year
3. Use EXACT values from provided valid options
4. When in doubt, omit the field
5. Response must be ONLY JSON between triple backticks

Format response EXACTLY like this:
\`\`\`json
{
  // only fields found in the query
}
\`\`\``;
}
}

export default LLMService;
