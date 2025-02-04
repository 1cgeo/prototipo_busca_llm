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
        model: 'deepseek-r1:7b',
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

    return `You are a specialized system for processing cartographic data queries in Portuguese. 
Your task is to analyze a query in Portuguese about cartographic data and extract structured information.

Given query in Portuguese: "${query}"

Current date: ${today}

First, answer these questions about the query (think step by step):

1. Map Scale:
- Is there any mention of scale (escala)?
- Look for patterns like "1:25.000", "25k", "50k", "grande escala", "pequena escala"
- Valid scales are: ${scalesStr}

2. Product Type:
- What type of cartographic product is being requested?
- Look for terms like "carta topográfica", "carta ortoimagem", "carta temática"
- Valid types are: ${productTypesStr}

3. Geographic Location:
- Is there any mention of specific Brazilian states or cities?
- Look for state names, abbreviations (RJ, SP, etc.), or city names

4. Supply Area:
- Is there any mention of "CGEO" or "Centro de Geoinformação"?
- Look for patterns like "1º CGEO", "2° CGEO", etc.
- Valid areas are: ${supplyAreasStr}

5. Project:
- Is there any mention of specific mapping projects?
- Valid projects are: ${projectsStr}

6. Time Periods:
- Are there any temporal references?
- Look for date ranges, years, or relative terms like "último ano", "recente"
- Consider terms like "publicado em", "criado em", "entre X e Y"

7. Sorting:
- Is there any mention of ordering or sorting?
- Look for terms like "mais recente", "mais antigo", "por data de criação"
- Valid sort fields: ${sortFieldsStr}
- Valid directions: ${sortDirectionsStr}

8. Quantity:
- Is there any mention of quantity or limit?
- Look for numbers followed by "cartas", "resultados", etc.

Now, based on your analysis, generate a JSON response that INCLUDES ONLY the information that was EXPLICITLY or STRONGLY IMPLIED in the query.

The JSON must follow this structure:
{
  "keyword": "text for general search, if any",
  "scale": one of [${scalesStr}],
  "productType": one of [${productTypesStr}],
  "state": "state name if mentioned",
  "city": "city name if mentioned",
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
  "limit": number between 1 and 100
}

Important rules:
1. Include ONLY fields that were explicitly mentioned or strongly implied
2. For dates, convert relative terms to actual dates using current date
3. Use EXACT values from the provided valid options
4. When in doubt, omit the field
5. Response must be ONLY the JSON, with NO additional text or explanations

Format your response EXACTLY like this:
\`\`\`json
{
  // only fields found in the query
}
\`\`\``;
  }
}

export default LLMService;
