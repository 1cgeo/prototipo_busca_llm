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
        'Extract exact matches or partial matches for: MI (map index codes like 2965-2-NE, 2866-3, 2901, 530), INOM (nomenclature index like SF-22-Y-D-II-4), or product names. Prioritize exact matches for MI and INOM codes when found. Consider the following examples for recognition: "MI 2965-2-NE" -> "2965-2-NE", "carta SF-22" -> "SF-22", "folha 2901" -> "2901". Return the exact code or name found, without additional text.',
      ),

    scale: z
      .union([z.enum(SCALES), z.undefined(), z.null()])
      .describe(
          'Map scale. Accept variations and normalize: Large scale = 1:25.000, Medium scale = 1:100.000, Small scale = 1:250.000. Normalize formats: 25k, 25.000, 25000, 1/25.000 to 1:25.000. When multiple scales are mentioned, prioritize the largest (most detailed) one'
      ),

    productType: z
      .union([z.enum(PRODUCT_TYPES), z.undefined(), z.null()])
      .describe(
        'Cartographic product type. Common interpretations: map or chart without qualifier = Topographic Chart, mention of image/satellite = Orthoimagery Chart, mention of thematic = Thematic Chart',
      ),

    state: z
      .union([z.string(), z.undefined(), z.null()])
      .describe(
        'Full name of Brazilian state. Convert abbreviations (e.g., RJ to Rio de Janeiro). When multiple states are mentioned, use the first one. Preserve proper capitalization and accents',
      ),

    city: z
      .union([z.string(), z.undefined(), z.null()])
      .describe(
        'Name of Brazilian municipality. When multiple cities are mentioned, use the first one. Preserve proper capitalization and accents',
      ),

    supplyArea: z
      .union([z.enum(SUPPLY_AREAS), z.undefined(), z.null()])
      .describe(
        'Responsible Geoinformation Center. When multiple centers mentioned, use the first one. Ignore mentions without specific number',
      ),

    project: z
      .union([z.enum(PROJECTS), z.undefined(), z.null()])
      .describe(
        'Specific project. Normalize common variations: world cup/copa to Copa do Mundo 2014, olympics/olimpiadas to Olimpíadas. Match exact project names from the predefined list',
      ),

    publicationPeriod: z
      .union([DateRange, z.undefined(), z.null()])
      .describe(
        'Publication period. Convert relative dates: recent = last 6 months, this year = current year. Use ISO format YYYY-MM-DD',
      ),

    creationPeriod: z
      .union([DateRange, z.undefined(), z.null()])
      .describe(
        'Creation period. Convert relative dates to ISO format YYYY-MM-DD. Handle specific periods like quarters and semesters',
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
        max_retries: 3,
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

    return `You are an expert in natural language processing specialized in extracting search parameters for cartographic data. Current date: ${today}. Let's analyze queries step by step, field by field, through a careful thought process.
For Geoinformation Centers (supplyArea), examine the mention of Geoinformation Center. When multiple centers are mentioned, focus on the first one. Require specific number mention - generic CGEO references should be ignored.

The keyword field requires special attention for identifying three distinct types of references. For MI (Military Index) codes, we match the pattern ^\d{1,4}(-[1-4](-[NS][EO])?)?$ which captures all valid formats: from simple digit sequences (like 530, 2901) to those with one subdivision (like 2866-3) and those with cardinal direction (like 2965-2-NE). This encompasses all MI codes where we start with 1-4 digits, optionally followed by a hyphen and a digit 1-4, and optionally ending with a cardinal direction.
The INOM (Systematic Map Index Nomenclature) codes follow a single comprehensive pattern ^[A-Z]{2}-\d{2}-[A-Z]-[A-Z](-[IVX]{1,6}(-[1-4](-[NS][EO])?)?)?$. This pattern covers all variations: starting with two uppercase letters, two digits, and two single letters (like SF-22-Y-D), optionally extending with a roman numeral up to VI (like SF-22-Y-D-II), optionally followed by a digit 1-4 (like SF-22-Y-D-II-4), and potentially ending with a cardinal direction (like SF-22-Y-D-II-4-SE). The structure ensures each component is properly formatted while making the latter parts optional.
For chart names, when neither MI nor INOM patterns are matched, we process the input as a potential chart name or location reference. These don't follow a specific pattern but rather serve as text search terms, allowing users to find charts by their descriptive names, geographical features, or location references they contain. The system treats these as general text search terms and applies appropriate text search algorithms to find matches.

When analyzing scale, look for direct scale mentions like 1:25.000 or 25k. Consider qualitative descriptions where detailed or large scale indicates 1:25.000, medium scale suggests 1:100.000, and small or general scale points to 1:250.000. With multiple scales, always choose the most detailed one. For instance, 25k or 50k should become 1:25.000, while a detailed map implies 1:25.000.

For location analysis, determine whether mentions refer to states or municipalities. Convert state abbreviations to full names and identify associated states for cities. If the city is ambiguous do not specify the state. With multiple locations, use the first mentioned.
Project identification involves matching official project names while handling common variations. World Cup references should convert to Copa do Mundo 2014, and Olympics mentions become Olimpíadas. Always match against the predefined project list for validation.
Date processing requires distinguishing between publication and creation dates. Convert relative periods to specific date ranges - this year means the full current year, last 6 months requires calculating the exact date range. Always output dates in ISO format (YYYY-MM-DD).
For sorting and limits, interpret directional indicators where newest or most recent implies DESC ordering, while oldest suggests ASC. Handle numeric limits explicitly, converting some to 5 and interpreting all as unlimited.
For each analysis, ask what specific words or phrases support each extraction decision. Consider multiple interpretations and choose the most confident one. Document your reasoning, explaining how each conclusion was reached. Always prioritize precision over completeness - leave fields undefined when confidence is low.
Here are comprehensive examples of query analysis:
Query: "preciso da carta MI 2965-2-NE do segundo cgeo"
{
"reasoning": "Found exact MI code '2965-2-NE'. 'segundo cgeo' reference normalizes to standard name.",
"keyword": "2965-2-NE",
"supplyArea": "2° Centro de Geoinformação",
"productType": "Carta Topográfica"
}
Query: "buscar folha SF-22-Y-D-II-4 do RS publicada esse ano"
{
"reasoning": "Found exact INOM code 'SF-22-Y-D-II-4'. Location 'RS' converts to Rio Grande do Sul. Time period 'this year' translates to full 2025 range.",
"keyword": "SF-22-Y-D-II-4",
"state": "Rio Grande do Sul",
"publicationPeriod": {
"start": "2025-01-01",
"end": "2025-12-31"
}
}
Query: "carta topográfica Passo da Seringueira em 1:25.000"
{
"reasoning": "Name reference 'Passo da Seringueira' for keyword. Scale explicitly mentioned as 1:25.000. Product type directly specified as topográfica.",
"keyword": "Passo da Seringueira",
"scale": "1:25.000",
"productType": "Carta Topográfica"
}
Query: "MI 530 mais nova do primeiro cgeo"
{
"reasoning": "Found MI code '530'. 'primeiro cgeo' reference normalizes to standard name.  'mais novas' indicates descending sort.",
"keyword": "530",
"supplyArea": "1° Centro de Geoinformação",
"sortField": "publicationDate",
"sortDirection": "DESC"
}
Query: "cartas mais recentes com inom SF-22"
{
"reasoning": "Partial INOM code 'SF-22' identified. 'mais recentes' indicates sort by publication date descending.",
"keyword": "SF-22",
"sortField": "publicationDate",
"sortDirection": "DESC"
}
Query: "carta do projeto olimpíadas SF-22-Y-D-II"
{
"reasoning": "Found INOM code 'SF-22-Y-D-II'. Project 'olimpíadas' normalizes to 'Olimpíadas'",
"keyword": "SF-22-Y-D-II",
"project": "Olimpíadas"
}
Query: "MI 2901 de são paulo com data de criação mais antiga"
{
"reasoning": "Found MI code '2901'. Location 'são paulo' converts to full state name. Sort by creation date with 'mais antiga' indicating ascending order.",
"keyword": "2901",
"state": "São Paulo",
"sortField": "creationDate",
"sortDirection": "ASC"
}`;
  }
}

export default LLMService;
export type { ExtractedSearchParams };
