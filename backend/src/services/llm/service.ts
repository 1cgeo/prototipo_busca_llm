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

// Schema otimizado para extração de parâmetros
const DateRange = z.object({
  start: z.string().describe('Data inicial em formato ISO YYYY-MM-DD'),
  end: z.string().describe('Data final em formato ISO YYYY-MM-DD'),
});

const ExtractedSearchParams = z.object({
  reasoning: z.string()
    .describe('Explain step by step how each parameter was extracted, mentioning which terms from the original text led to each decision'),

  keyword: z.union([z.string(), z.undefined(), z.null()])
    .describe('Significant keywords for text search. Extract only when there are clearly relevant search terms, ignoring common words like map, chart, need, etc.'),

  scale: z.union([z.enum(SCALES), z.undefined(), z.null()])
    .describe('Map scale. Accept variations and normalize: Large scale = 1:25.000, Medium scale = 1:100.000, Small scale = 1:250.000. Normalize formats: 25k, 25.000, 25000, 1/25.000 to 1:25.000. When multiple scales are mentioned, prioritize the largest (most detailed) one'),

  productType: z.union([z.enum(PRODUCT_TYPES), z.undefined(), z.null()])
    .describe('Cartographic product type. Common interpretations: map or chart without qualifier = Topographic Chart, mention of image/satellite = Orthoimagery Chart, mention of thematic = Thematic Chart'),

  state: z.union([z.string(), z.undefined(), z.null()])
    .describe('Full name of Brazilian state. Convert abbreviations (e.g., RJ to Rio de Janeiro). When multiple states are mentioned, use the first one. Preserve proper capitalization and accents'),

  city: z.union([z.string(), z.undefined(), z.null()])
    .describe('Name of Brazilian municipality. When multiple cities are mentioned, use the first one. Preserve proper capitalization and accents'),

  supplyArea: z.union([z.enum(SUPPLY_AREAS), z.undefined(), z.null()])
    .describe('Responsible Geoinformation Center. When multiple centers mentioned, use the first one. Ignore mentions without specific number'),

  project: z.union([z.enum(PROJECTS), z.undefined(), z.null()])
    .describe('Specific project. Normalize common variations: world cup/copa to Copa do Mundo 2014, olympics/olimpiadas to Olimpíadas. Match exact project names from the predefined list'),

  publicationPeriod: z.union([DateRange, z.undefined(), z.null()])
    .describe('Publication period. Convert relative dates: recent = last 6 months, this year = current year. Use ISO format YYYY-MM-DD'),

  creationPeriod: z.union([DateRange, z.undefined(), z.null()])
    .describe('Creation period. Convert relative dates to ISO format YYYY-MM-DD. Handle specific periods like quarters and semesters'),

  sortField: z.enum(SORT_FIELDS).default('publicationDate')
    .describe('Field for sorting results. Use publicationDate if not specified'),

  sortDirection: z.enum(SORT_DIRECTIONS).default('DESC')
    .describe('Sort direction. Use DESC (most recent) if not specified. Convert newest/latest to DESC, oldest to ASC'),

  limit: z.union([z.number().min(1).max(100), z.undefined(), z.null()])
    .describe('Maximum number of results. Extract only explicitly mentioned numbers between 1 and 100. Convert some to 5, all to undefined')
}).describe(
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
    // Pré-processa a query
    const preprocessedText = preprocessQuery(query.query);
    let extractedParams = {};
    console.log(query.query)
    console.log(preprocessedText)

    try {
      // Gera o prompt para o modelo
      const systemPrompt = this.buildPrompt();

      // Faz a chamada usando Instructor
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
        max_retries: 3,
      });
      console.log(extraction)

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

      // Em caso de falha, usa fallback
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

    return `You are an expert in natural language processing specialized in extracting search parameters for cartographic data. Current date: ${today}. Let's analyze queries step by step, field by field, through a careful thought process.

For Geoinformation Centers (supplyArea), examine the mention of Geoinformation Center. When multiple centers are mentioned, focus on the first one. Require specific number mention - generic CGEO references should be ignored.

When analyzing scale, look for direct scale mentions like 1:25.000 or 25k. Consider qualitative descriptions where detailed or large scale indicates 1:25.000, medium scale suggests 1:100.000, and small or general scale points to 1:250.000. With multiple scales, always choose the most detailed one. For instance, 25k or 50k should become 1:25.000, while a detailed map implies 1:25.000.

For location analysis, determine whether mentions refer to states or municipalities. Convert state abbreviations to full names and identify associated states for cities. If the city is ambiguous do not specify the state. With multiple locations, use the first mentioned. Consider examples like RJ becoming Rio de Janeiro. Avoid interpreting generic regional references.

Product type analysis requires attention to both explicit mentions and implicit indicators. Satellite or image references suggest Orthoimagery Chart, contour lines indicate Topographic Chart, and thematic mentions point to Thematic Chart. Generic map or chart references default to Topographic Chart if no other indicators exist.

Project identification involves matching official project names while handling common variations. World Cup references should convert to Copa do Mundo 2014, and Olympics mentions become Olimpíadas. Always match against the predefined project list for validation.

Date processing requires distinguishing between publication and creation dates. Convert relative periods to specific date ranges - this year means the full current year, last 6 months requires calculating the exact date range. Always output dates in ISO format (YYYY-MM-DD).

For sorting and limits, interpret directional indicators where newest or most recent implies DESC ordering, while oldest suggests ASC. Handle numeric limits explicitly, converting some to 5 and interpreting all as unlimited. For example, 10 most recent should set limit: 10 with DESC ordering.

For each analysis:
Ask what specific words or phrases support each extraction decision. Consider multiple interpretations and choose the most confident one. Document your reasoning, explaining how each conclusion was reached. Always prioritize precision over completeness - leave fields undefined when confidence is low.

Here are comprehensive examples of query analysis:

Query: "mapas detalhados de Manaus e Belém"
{
  "reasoning": "Location: Multiple cities mentioned, using the first one (Manaus). Scale: Term 'detailed' indicates the most precise scale (1:25.000). Product Type: Generic term 'maps' without qualifiers defaults to Topographic Chart.",
  "scale": "1:25.000",
  "city": "Manaus",
  "productType": "Carta Topográfica"
}

Query: "cartas do Rio publicadas esse ano"
{
  "reasoning": "Location: 'Rio' is ambiguous but commonly refers to the state Rio de Janeiro rather than the city. Time Period: 'this year' refers to publication in 2025, setting full year range. Product Type: Generic term 'charts' without qualifiers indicates Topographic Chart.",
  "state": "Rio de Janeiro",
  "productType": "Carta Topográfica",
  "publicationPeriod": {
    "start": "2025-01-01",
    "end": "2025-12-31"
  }
}

Query: "imagens recentes na área do 2° Centro de Geoinformação"
{
  "reasoning": "Supply Area: Exact match for '2° Centro de Geoinformação'. Product Type: Term 'imagery' indicates Orthoimagery Chart. Time Filter: 'recent' implies last 6 months and descending sort order. Publication period calculated from current date (2025-02-05).",
  "supplyArea": "2° Centro de Geoinformação",
  "productType": "Carta Ortoimagem",
  "publicationPeriod": {
    "start": "2024-08-05",
    "end": "2025-02-05"
  },
  "sortField": "publicationDate",
  "sortDirection": "DESC"
}

Query: "mapas do primeiro cgeo de 2023 em escala 25k ordenados por data de criação"
{
  "reasoning": "Supply Area: 'first cgeo' normalizes to '1° Centro de Geoinformação'. Scale: '25k' converts to '1:25.000'. Time Period: Specific year 2023 for creation dates. Sort: Explicit request for creation date sorting without direction implies ascending.",
  "supplyArea": "1° Centro de Geoinformação",
  "scale": "1:25.000",
  "creationPeriod": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  },
  "sortField": "creationDate",
  "sortDirection": "ASC"
}

Query: "5 cartas temáticas mais recentes do projeto Bahia"
{
  "reasoning": "Limit: Explicit number 5 requested. Product Type: 'thematic maps' indicates Thematic Chart. Project: Direct reference to Bahia project. Sort: 'newest' implies publication date descending.",
  "productType": "Carta Temática",
  "project": "Bahia",
  "limit": 5,
  "sortField": "publicationDate",
  "sortDirection": "DESC"
}

Query: "cartas ortoimagem das olimpíadas em média escala"
{
  "reasoning": "Project: 'olympics' normalizes to 'Olimpíadas'. Product Type: Direct reference to orthoimagery. Scale: 'medium scale' converts to 1:100.000 based on scale classifications.",
  "project": "Olimpíadas",
  "productType": "Carta Ortoimagem",
  "scale": "1:100.000"
}`;
  }
}

export default LLMService;
export type { ExtractedSearchParams };
