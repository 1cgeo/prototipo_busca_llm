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

const ExtractedSearchParams = z
  .object({
    reasoning: z
      .string()
      .describe(
        'Explique passo a passo como cada parâmetro foi extraído, mencionando quais termos do texto original levaram a cada decisão',
      ),

    keyword: z
      .union([z.string(), z.undefined(), z.null()])
      .describe(
        'Palavras-chave significativas para busca textual. Extrair apenas quando houver termos claramente relevantes para busca, ignorando palavras comuns como "mapa", "carta", "preciso", etc.',
      ),

    scale: z.union([z.enum(SCALES), z.undefined(), z.null()])
      .describe(`Escala do mapa. Aceitar variações e normalizar: Grande escala = 1:25.000, Média escala = 1:100.000, Pequena escala = 1:250.000, Normalizar formatos: 25k, 25.000, 25000, 1/25.000 em 1:25.000, Se múltiplas escalas forem mencionadas, priorizar a maior (mais detalhada)`),

    productType: z.union([z.enum(PRODUCT_TYPES), z.undefined(), z.null()])
      .describe(`Tipo de produto cartográfico. Interpretações comuns: "mapa" ou "carta" sem qualificador = "Carta Topográfica",  Menção a imagem/satélite = "Carta Ortoimagem", Mencão a temático = "Carta Temática"`),
    state: z
      .union([z.string(), z.undefined(), z.null()])
      .describe(
        'Nome completo do estado brasileiro. Converter siglas (ex: RJ para Rio de Janeiro). Se múltiplos estados forem mencionados, usar o primeiro.',
      ),

    city: z
      .union([z.string(), z.undefined(), z.null()])
      .describe(
        'Nome do município brasileiro. Se múltiplos municípios forem mencionados, usar o primeiro. Preservar acentuação.',
      ),

    supplyArea: z.union([z.enum(SUPPLY_AREAS), z.undefined(), z.null()])
    .describe(
      'Centro de Geoinformação responsável. Converter siglas para o nome completo.',
    ),

    project: z.union([z.enum(PROJECTS), z.undefined(), z.null()])
      .describe(`Projeto específico. Normalizar variações comuns: "copa" para "Copa do Mundo 2014", "olimpiadas/olimpíadas" para "Olimpíadas"`),

    publicationPeriod: z.union([DateRange, z.undefined(), z.null()])
    .describe(
      'Período de publicação. "recente"=últimos 6 meses, "esse ano"=ano atual',
    ),

    creationPeriod: z
      .union([DateRange, z.undefined(), z.null()])
      .describe('Período de criação do produto'),


    sortField: z.enum(SORT_FIELDS).default('publicationDate')
    .describe(
      'Campo para ordenação. Usar "publicationDate" se não especificado',
    ),

    sortDirection: z
      .union([z.enum(SORT_DIRECTIONS), z.undefined(), z.null()])
      .default('DESC')      
      .describe(
        'Direção da ordenação. Usar "DESC" (mais recente) se não especificado',
      ),

    limit: z
      .union([z.number().min(1).max(100), z.undefined(), z.null()])
      .describe(
        'Número máximo de resultados. Extrair apenas números explicitamente mencionados entre 1 e 100.',
      ),
  })
  .describe(
    'Parâmetros de busca extraídos da consulta em linguagem natural. Sempre priorizar exatidão sobre completude.',
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

    return `Você é um especialista em extrair parâmetros estruturados de consultas sobre dados cartográficos em português.

Data atual: ${today}

Para cada consulta, faça as seguintes perguntas:

1. MÚLTIPLOS VALORES
- Há múltiplas escalas mencionadas?
  Escolha a mais detalhada (menor denominador)
  Exemplo: "25k ou 50k" use 1:25.000

- Há múltiplos estados/cidades?
  Use o primeiro mencionado
  Exemplo: "mapas de SP e RJ" use São Paulo

- Há múltiplos CGEOs?
  Use o primeiro mencionado
  Exemplo: "primeiro e segundo cgeo" use 1° Centro de Geoinformação

2. LOCALIZAÇÃO (Estado e Cidade)
Para cada localidade mencionada, pergunte:
- É um estado ou cidade?
- Se é sigla, qual o nome completo?
- Se menciona cidade, qual seu estado?
Tente identificar tanto estado quanto cidade quando possível:
- "Rio" para state: "Rio de Janeiro"
- "Salvador" para city: "Salvador", state: "Bahia"
- "Cuiabá, MT" para city: "Cuiabá", state: "Mato Grosso"

3. PRIORIZAÇÃO DE VALORES
Para cada menção temporal, pergunte:
- É sobre publicação ou criação?
- É uma data específica ou período relativo?
- Qual a data mais relevante se houver múltiplas?

Para cada menção de ordenação, pergunte:
- É sobre data de criação ou publicação?
- Indica mais recente ou mais antigo?
- Qual o critério principal se houver múltiplos?

4. INFERÊNCIA DE VALORES
Pergunte para termos implícitos:
- "detalhado" ou "preciso" para scale: "1:25.000"
- "visão geral" para scale: "1:250.000"
- "satélite" ou "imagem" para productType: "Carta Ortoimagem"
- "curvas de nível" para productType: "Carta Topográfica"
- "recente" para sortDirection: "DESC" + últimos 6 meses
- "alguns" para limit: 5
- "todos" para não definir limite

Exemplos de inferências corretas:

1. Query: "mapas detalhados de Manaus e Belém"
{
  "reasoning": "- Localização: múltiplas cidades, usando a primeira (Manaus/AM) - 'detalhados' indica escala 1:25.000 - 'mapas' indica Carta Topográfica",
  "scale": "1:25.000",
  "city": "Manaus",
  "state": "Amazonas",
  "productType": "Carta Topográfica"
}

2. Query: "cartas do Rio publicadas esse ano"
{
  "reasoning": "- Localização: 'Rio' é ambíguo, mas comum referir-se ao estado- 'esse ano' refere-se a publicação em 2025 - 'cartas' sem qualificador indica Carta Topográfica",
  "state": "Rio de Janeiro",
  "productType": "Carta Topográfica",
  "publicationPeriod": {
    "start": "2025-01-01",
    "end": "2025-12-31"
  }
}

3. Query: "imagens recentes de Curitiba e região"
{
  "reasoning": "- Localização: Curitiba/PR identificados - 'imagens' indica Carta Ortoimagem - 'recentes' implica últimos 6 meses e ordenação DESC",
  "city": "Curitiba",
  "state": "Paraná",
  "productType": "Carta Ortoimagem",
  "publicationPeriod": {
    "start": "2024-08-04",
    "end": "2025-02-04"
  },
  "sortField": "publicationDate",
  "sortDirection": "DESC"
}

Ao analisar cada consulta:
1. Primeiro identifique todos os valores mencionados
2. Resolva casos de múltiplos valores usando as regras de priorização
3. Verifique relações entre cidade/estado
4. Infira valores implícitos com alta confiança
5. Documente seu raciocínio explicando cada decisão`;
  }
}

export default LLMService;
export type { ExtractedSearchParams };
