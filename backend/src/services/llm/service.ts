import { z } from 'zod';
import Instructor from '@instructor-ai/instructor';
import OpenAI from 'openai';
import { logger } from '../../utils/logger.js';
import { fallbackExtraction } from './utils.js';
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
        'Explain how each parameter was extracted, mentioning which text evidence led to each decision. Always explain presence or absence of keyword, state, and sort choices',
      ),

    keyword: z
      .union([z.string(), z.undefined(), z.null()])
      .describe(
        'Extract map identifiers in order: MI codes (like 2965-2-NE), INOM codes (like SF-22), or chart names. For chart names, look for complete proper names following "carta", "folha", "mapa" - for example "carta Vale do Guaporé" means keyword should be "Vale do Guaporé". Chart names often include geographical features or proper nouns',
      ),

    scale: z
      .union([z.enum(SCALES), z.undefined(), z.null()])
      .describe(
        'Match scales exactly (1:1.000 to 1:250.000). For relative terms: "maior/detalhada" use 1:1.000, "média" use 1:50.000, "menor/pequena" use 1:250.000. When comparing scales, more detailed (smaller denominator) always takes precedence',
      ),

    productType: z
      .union([z.enum(PRODUCT_TYPES), z.undefined(), z.null()])
      .describe(
        'Extract product type with priority: 1) Exact matches of technical terms (MDS, MDT, CIRC). 2) Specific product variations (banda P HH, banda X). 3) General categories. MDS/MDT without RAM suffix implies modelo tridimensional. Temático without type implies Cartas Temáticas Não SCN',
      ),

    state: z
      .union([z.string(), z.undefined(), z.null()])
      .describe(
        'Extract state names even when part of prepositions: "do para" → "Pará", "de rondonia" → "Rondônia". Always normalize with proper capitals and accents',
      ),

    city: z
      .union([z.string(), z.undefined(), z.null()])
      .describe(
        'Extract city names even when part of prepositions: "em cuiaba" → "Cuiabá". Always normalize with proper capitals and accents',
      ),

    supplyArea: z
      .union([z.enum(SUPPLY_AREAS), z.undefined(), z.null()])
      .describe(
        'Convert cgeo variations to standard format. Must include numeric reference: primeiro/1º/1o → "1° Centro de Geoinformação"',
      ),

    project: z
      .union([z.enum(PROJECTS), z.undefined(), z.null()])
      .describe(
        'Match project names exactly. Technical abbreviations (BECA → NGA-BECA) take precedence over partial matches',
      ),

    publicationPeriod: z
      .union([DateRange, z.undefined(), z.null()])
      .describe(
        'Extract date ranges including relative ones: "semana passada" → 7-13 days ago, "depois de 2020" → from 2020-01-01 to current date, "esse ano" → full current year. Always extract "semana passada" even without explicit publication mention',
      ),

    creationPeriod: z
      .union([DateRange, z.undefined(), z.null()])
      .describe(
        'Use only with explicit creation terms: "criado", "feito", "elaborado", "produzido". Calculate dates same as publication period',
      ),

    sortField: z
      .union([z.enum(SORT_FIELDS), z.undefined(), z.null()])
      .default('publicationDate')
      .describe(
        'Use creationDate when text mentions: "atualização", "primeiro mapeamento", "mais antigas" with creation context, "feito", "elaborado". For ambiguous terms like "mais antigas" without context, default to publicationDate',
      ),

    sortDirection: z
      .union([z.enum(SORT_DIRECTIONS), z.undefined(), z.null()])
      .default('DESC')
      .describe(
        'Use ASC for "mais antigas", "primeiro", "antigas". Use DESC for "recentes", "últimas", "atuais"',
      ),

    limit: z
      .union([z.number().min(1).max(100), z.undefined(), z.null()])
      .describe(
        'Extract numbers between 1-100 when they refer to quantity of results',
      ),
  })
  .describe(
    'Extract search parameters accurately, prioritizing explicit mentions over inferred values',
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
        model: 'phi4:14b',
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

    return { searchParams: extractedParams, preprocessedText };
  }

  private buildPrompt(): string {
    const today = new Date().toISOString().split('T')[0];

    return `You are an expert in natural language processing specialized in extracting search parameters for cartographic data. Current date: ${today}. 

Here are comprehensive examples of query analysis:

Query: "inom SF-22-Y-D-II-4-SE do primeiro cgeo criado na semana passada"
{
  "reasoning": "1. Found complete INOM code with SE suffix - must preserve entirely. 2. 'primeiro cgeo' translates to '1° Centro de Geoinformação'. 3. 'semana passada' with 'criado' means creation date 7-13 days before current date (${today}). 4. When relative dates are mentioned with 'criado', use creation period not publication.",
  "keyword": "SF-22-Y-D-II-4-SE",
  "supplyArea": "1° Centro de Geoinformação",
  "creationPeriod": {
    "start": "2025-01-27",
    "end": "2025-02-02"
  }
}

Query: "preciso do MDT-RAM MI 2965-2-NE do segundo cgeo em 5k"
{
  "reasoning": "1. Found complete MI code with directional suffix - use as keyword. 2. 'MDT-RAM' matches to 'MDT - RAM'. 3. 'segundo cgeo' normalizes to '2° Centro de Geoinformação'. 4. '5k' translates to '1:5.000'. 5. MI code presence makes this a specific chart request.",
  "keyword": "2965-2-NE",
  "supplyArea": "2° Centro de Geoinformação",
  "productType": "MDT - RAM",
  "scale": "1:5.000"
}

Query: "Carta Altura da Vegetação Passo da Seringueira em grande escala criada entre 2022 e 2023"
{
  "reasoning": "1. No MI/INOM patterns - use location name as keyword. 2. Explicit product type mention. 3. 'grande escala' standardizes to '1:1.000'. 4. Date range with 'criada' indicates creation period. 5. Use full year range for exact years mentioned.",
  "keyword": "Passo da Seringueira",
  "scale": "1:1.000",
  "productType": "Altura da vegetação",
  "creationPeriod": {
    "start": "2022-01-01",
    "end": "2023-12-31"
  }
}

Query: "SCN Carta Topografica Matricial detalhadas (2k ou 5k) de brasilia do ultimo trimestre"
{
  "reasoning": "1. Between multiple scales, choose most detailed (2k). 2. 'brasilia' normalizes to 'Brasília'. 3. 'ultimo trimestre' means previous complete quarter (2024-Q4). 4. Without creation/criação mention, assume publication date. 5. City name without MI/INOM is location filter, not keyword.",
  "scale": "1:2.000",
  "city": "Brasília",
  "productType": "SCN Carta Topografica Matricial",
  "publicationPeriod": {
    "start": "2024-10-01",
    "end": "2024-12-31"
  }
}

Query: "5 cartas mais antigas SF-22-Y-D ou MI 2965-2-NE do quarto cgeo em pequena escala"
{
  "reasoning": "1. Multiple identifiers - use first mentioned (SF-22-Y-D). 2. 'quarto cgeo' normalizes to '4° Centro de Geoinformação'. 3. 'pequena escala' means '1:250.000'. 4. '5 cartas' sets limit. 5. 'mais antigas' without creation context means publication date sorting.",
  "keyword": "SF-22-Y-D",
  "supplyArea": "4° Centro de Geoinformação",
  "scale": "1:250.000",
  "limit": 5,
  "sortField": "publicationDate",
  "sortDirection": "ASC"
}

Query: "cartas Tematico CTBL publicadas em 2023 do quinto cgeo em mg e es em media escala"
{
  "reasoning": "1. 'Tematico CTBL' is exact product type match. 2. Full year for 2023 publication. 3. 'quinto cgeo' normalizes to '5° Centro de Geoinformação'. 4. Multiple states - use first (MG → Minas Gerais). 5. 'media escala' means '1:50.000'.",
  "productType": "Tematico CTBL",
  "publicationPeriod": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  },
  "supplyArea": "5° Centro de Geoinformação",
  "state": "Minas Gerais",
  "scale": "1:50.000"
}

Query: "mapeamento areas interesse em goias publicado depois de 2020 ordem mais antiga"
{
  "reasoning": "1. 'mapeamento areas interesse' matches 'Mapeamento de Áreas de Interesse da Força'. 2. 'goias' normalizes to 'Goiás'. 3. 'depois de 2020' means from 2020-01-01 to current date. 4. 'ordem mais antiga' with 'publicado' means ascending publication sort.",
  "project": "Mapeamento de Áreas de Interesse da Força",
  "state": "Goiás",
  "publicationPeriod": {
    "start": "2020-01-01",
    "end": "2025-02-03"
  },
  "sortField": "publicationDate",
  "sortDirection": "ASC"
}

Query: "Ortoimagem banda P pol HH de manaus do projeto NGA-BECA"
{
  "reasoning": "1. 'Ortoimagem banda P pol HH' is exact product type match. 2. Project reference matches 'NGA-BECA'. 3. City 'manaus' normalizes to 'Manaus'. 4. No MI/INOM or specific chart name - location is filter only.",
  "productType": "Ortoimagem banda P pol HH",
  "project": "NGA-BECA",
  "city": "Manaus"
}

Query: "MI 2901 de porto alegre com data de criação mais antiga"
{
  "reasoning": "1. Found valid MI code - use as keyword. 2. 'porto alegre' normalizes to 'Porto Alegre'. 3. 'data de criação mais antiga' explicitly indicates creation date ascending sort. 4. Location serves as filter due to MI presence.",
  "keyword": "2901",
  "city": "Porto Alegre",
  "sortField": "creationDate",
  "sortDirection": "ASC"
}

Query: "carta censipam SF-22-Y-D-II"
{
  "reasoning": "1. Found complete INOM code - use as keyword. 2. Product type explicitly mentioned as 'Cartas CENSIPAM'. 3. INOM takes precedence over other potential keywords.",
  "keyword": "SF-22-Y-D-II",
  "productType": "Cartas CENSIPAM"
}`;
  }
}

export default LLMService;
export type { ExtractedSearchParams };
