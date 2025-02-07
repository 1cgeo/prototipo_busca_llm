import { z } from 'zod';
import Instructor from '@instructor-ai/instructor';
import OpenAI from 'openai';
import { logger } from '../../utils/logger.js';
import { fallbackExtraction } from './utils.js';
import { validateExtractedParams } from './validator.js';
import {
  SCALES,
  PRODUCT_TYPES,
  SUPPLY_AREAS,
  PROJECTS,
  SORT_FIELDS,
  SORT_DIRECTIONS,
  type NaturalLanguageQuery,
} from '../../types/api.js';
import { preprocessQuery } from './preprocessor.js';

const DateRange = z.object({
  start: z.string().describe('Data inicial em formato ISO YYYY-MM-DD'),
  end: z.string().describe('Data final em formato ISO YYYY-MM-DD'),
});

const ExtractedSearchParams = z
  .object({
    reasoning: z
      .string()
      .describe(
        'Explain step by step how each parameter was extracted, mentioning which terms from the original text led to each decision',
      ),

    keyword: z
      .union([z.string(), z.undefined(), z.null()])
      .describe(
        `Extract exact matches or partial matches for: MI pattern ^\d{1,4}(-[1-4](-[NS][EO])?)?$, INOM pattern ^[A-Z]{2}-\d{2}-[A-Z]-[A-Z](-[IVX]{1,6}(-[1-4](-[NS][EO])?)?)?$, Chart name: If no MI/INOM match, use as text search (ignore product type/location terms)`
      ),

    scale: z
      .union([z.enum(SCALES), z.undefined(), z.null()])
      .describe(
        'Map scale. Accept variations and normalize: Large scale = 1:25.000, Medium scale = 1:100.000, Small scale = 1:250.000. Normalize formats: 25k, 25.000, 25000, 1/25.000 to 1:25.000. When multiple scales are mentioned, prioritize the largest (most detailed) one'
      ),

    productType: z
      .union([z.enum(PRODUCT_TYPES), z.undefined(), z.null()])
      .describe(
        `Cartographic product type. Common interpretations: map or chart without qualifier = Topographic Chart, mention of image/satellite = Orthoimagery Chart, mention of thematic = Thematic Chart. When no explicit mention, evaluate context but prefer leaving undefined over assumptions."`,
      ),

    state: z
      .union([z.string(), z.undefined(), z.null()])
      .describe(
        `Full name of Brazilian state. Convert abbreviations (e.g., RJ to Rio de Janeiro). When multiple states are mentioned, use the first one. Preserve proper capitalization and accents"`
      ),

    city: z
      .union([z.string(), z.undefined(), z.null()])
      .describe(
        `Name of Brazilian municipality. With multiple locations, use first mention. For ambiguous cities, omit state reference."`
      ),

    supplyArea: z
      .union([z.enum(SUPPLY_AREAS), z.undefined(), z.null()])
      .describe(
       `Responsible Geoinformation Center. When multiple centers mentioned, use first occurrence only. Ignore generic 'cgeo' without number. Only accept numbered references (1-5)."`
      ),

    project: z
      .union([z.enum(PROJECTS), z.undefined(), z.null()])
      .describe(
        ` 'Specific project. Normalize common variations: world cup/copa to Copa do Mundo 2014, olympics/olimpiadas to Olimpíadas. Match only against predefined project list, otherwise leave undefined."`,
      ),

    publicationPeriod: z
      .union([DateRange, z.undefined(), z.null()])
      .describe(
        'Publication period. Convert relative dates to ISO format YYYY-MM-DD.  Convert relative dates: recent = last 6 months, this year = current year. Distinguish between publication and creation period by context',
      ),

    creationPeriod: z
      .union([DateRange, z.undefined(), z.null()])
      .describe(
        'Creation period. Convert relative dates to ISO format YYYY-MM-DD.  Convert relative dates: recent = last 6 months, this year = current year. Distinguish between publication and creation period by context',
      ),

    sortField: z
      .union([z.enum(SORT_FIELDS), z.undefined(), z.null()])
      .default('publicationDate')
      .describe(
        'Field for sorting results. Use publicationDate if not specified',
      ),

    sortDirection: z
      .union([z.enum(SORT_DIRECTIONS), z.undefined(), z.null()])
      .default('DESC')
      .describe(
        'Sort direction. Use DESC (most recent) if not specified. Convert newest/latest to DESC, oldest to ASC',
      ),

    limit: z
      .union([z.number().min(1).max(100), z.undefined(), z.null()])
      .describe(
        'Maximum number of results. Extract only explicitly mentioned numbers between 1 and 100. Convert some to 5, all to undefined',
      ),
  })
  .describe(
    'Search parameters extracted from the natural language query. Always prioritize accuracy over completeness.',
  );

export class LLMService {
  private client: OpenAI;

  constructor(baseUrl: string) {
    const oai = new OpenAI({
      baseURL: baseUrl + '/v1',
      apiKey: 'ollama',
    });
    this.client = Instructor({
      client: oai,
      mode: 'JSON_SCHEMA',
    });
  }

  async processQuery(query: NaturalLanguageQuery) {
    const preprocessedText = preprocessQuery(query.query);
    let extractedParams = {};
    console.log(query.query);
    console.log(preprocessedText);
    try {
      const systemPrompt = this.buildPrompt();

      const extraction = await (this.client.chat.completions.create as any)({
        model: 'qwen2.5-coder:7b',
        temperature: 0.6,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: preprocessedText },
        ],
        response_model: {
          schema: ExtractedSearchParams,
          name: 'ExtractedSearchParams',
        },
        max_retries: 10,
      });
      console.log(extraction);

      logger.info('LLM extraction successful', {
        originalQuery: query.query,
        preprocessedText,
        extractedParams: extraction,
      });
      extractedParams = extraction;
    } catch (error) {
      logger.warn('LLM extraction failed, using fallback', {
        error,
        query: query.query,
      });

      extractedParams = fallbackExtraction(preprocessedText);
    }

    const validatedParams = validateExtractedParams(extractedParams);

    logger.info('Query processing complete', {
      originalQuery: query.query,
      preprocessedText,
      finalParams: validatedParams,
    });

    return { searchParams: validatedParams, preprocessedText };
  }

  private buildPrompt(): string {
    const today = new Date().toISOString().split('T')[0];

    return `You are an expert in natural language processing specialized in extracting search parameters for cartographic data. Current date: ${today}. 
    
    Here are comprehensive examples of query analysis:

Query: "preciso da orto MI 2965-2-NE do segundo cgeo"
{
  "reasoning": "'Orto' refers to 'Carta Ortoimagem' a product type. Found supply area from 'segundo cgeo'. Identified valid MI code '2965-2-NE'.",
  "keyword": "2965-2-NE",
  "supplyArea": "2° Centro de Geoinformação",
  "productType": "Carta Ortoimagem"
}

Query: "buscar folha SF-22-Y-D-II-4 do RS publicada esse ano"
{
  "reasoning": "Found state reference 'RS' for Rio Grande do Sul. 'Folha' commonly refers to 'Carta Topográfica', a product type. Identified complete INOM code 'SF-22-Y-D-II-4'. Publication period set to current year 2025.",
  "keyword": "SF-22-Y-D-II-4",
  "state": "Rio Grande do Sul",
  "productType": "Carta Topográfica",
  "publicationPeriod": {
    "start": "2025-01-01",
    "end": "2025-12-31"
  }
}

Query: "carta topográfica Passo da Seringueira em grande escala"
{
  "reasoning": "Explicit product type 'topográfica'. 'grande escala' refers to '1:25.000'. No MI/INOM pattern found, using 'Passo da Seringueira' as chart name.",
  "keyword": "Passo da Seringueira",
  "scale": "1:25.000",
  "productType": "Carta Topográfica"
}

Query: "carta temática do projeto olimpíadas SF-22-Y-D-II"
{
  "reasoning": "Identified project 'Olimpíadas'. Found complete INOM code 'SF-22-Y-D-II'. 'carta temática' is a product type.",
  "keyword": "SF-22-Y-D-II",
  "productType": "Carta Temática",
  "project": "Olimpíadas"
}

Query: "MI 2901 de porto alegre com data de criação mais antiga"
{
  "reasoning": "Found city 'Porto Alegre'. Identified MI '2901'. Term 'mais antiga' with 'data de criação' sets ascending creation date sort.",
  "keyword": "2901",
  "city": "Porto Alegre",
  "sortField": "creationDate",
  "sortDirection": "ASC"
}

Query: "cartas de pequena escala do projeto Copa do Mundo em São Paulo"
{
  "reasoning": "Term 'Copa do Mundo' matches project list exactly, should not be treated as keyword. 'Cartas' commonly refers to 'Carta Topográfica', a product type. 'pequena escala' refers to '1:250.000' São Paulo' is location reference. No valid MI/INOM pattern or chart name found.",
  "project": "Copa do Mundo 2014",
  "productType": "Carta Topográfica",
  "scale": "1:250.000",
  "state": "São Paulo"
}

Query: "buscar carta ortoimagem de média escala de Manaus"
{
  "reasoning": "Term 'ortoimagem' defines product type. 'Média escala' refers to '1:100.000' scale. 'Manaus' is city reference, not a chart name. No MI/INOM patterns found. Without specific chart name beyond location, no keyword is set.",
  "productType": "Carta Ortoimagem",
  scale": "1:100.000"
  "city": "Manaus"
}
  
Query: "mapas detalhados produzidos entre julho e dezembro do ano passado"
{
  "reasoning": "'Detalhado' refers to '1:25.000' scale. Terms 'produzidos/produção/elaborados' indicate creation date, not publication. 'ano passado' refers to 2024, with specific months 'julho' to 'dezembro'.",
  "scale": "1:25.000",
  "creationPeriod": {
    "start": "2024-07-01",
    "end": "2024-12-31"
  }
}
  
Query: "cartas topo publicadas em 2023 do quinto cgeo em mg e es em media ou pequena escala"
{
  "reasoning": "Found product type 'carta topo' for Carta Topográfica. Publication period for '2023' full year. Supply area from 'quinto cgeo'. Term 'media ou pequena' scale defaults to the more detailed, medium, which means 1:100.000. Multiple states mentioned but using first (MG).",
  "productType": "Carta Topográfica",
  "publicationPeriod": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  },
  "supplyArea": "5° Centro de Geoinformação",
  "state": "Minas Gerais",
  "scale": "1:100.000"
}
  
Query: "imagens de satelite de rondonia e acre em grande escala"
{
  "reasoning": "Term 'imagens de satelite' indicates Carta Ortoimagem. 'grande escala' translates to 1:25.000. Multiple states mentioned but using first (Rondônia).",
  "productType": "Carta Ortoimagem",
  "state": "Rondônia",
  "scale": "1:25.000"
}`;
  }
}

export default LLMService;
export type { ExtractedSearchParams };
