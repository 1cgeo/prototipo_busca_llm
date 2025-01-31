import { SearchQuery } from '@/types/api';
import { logger } from '@/utils/logger';
import { z } from 'zod';

const ParsedQuerySchema = z.object({
  palavraChave: z.string().optional(),
  escala: z.enum(['1:25.000', '1:50.000', '1:100.000', '1:250.000']).optional(),
  tipoProduto: z.enum(['Carta Topografica', 'Carta Ortoimagem', 'Carta Tematica']).optional(),
  estado: z.string().optional(),
  municipio: z.string().optional(),
  areaSuprimento: z.enum([
    '1° Centro de Geoinformação (1° CGEO)',
    '2° Centro de Geoinformação (2° CGEO)',
    '3° Centro de Geoinformação (3° CGEO)',
    '4° Centro de Geoinformação (4° CGEO)',
    '5° Centro de Geoinformação (5° CGEO)'
  ]).optional(),
  projeto: z.enum([
    'Rondônia', 'Amapá', 'Bahia', 'BECA', 'Rio Grande do Sul',
    'Mapeamento Sistemático', 'Copa do Mundo 2014', 'Olimpíadas',
    'Copa das Confereções 2013'
  ]).optional(),
  periodoPublicacao: z.object({
    inicio: z.string(),
    fim: z.string()
  }).optional(),
  periodoCriacao: z.object({
    inicio: z.string(),
    fim: z.string()
  }).optional(),
  bbox: z.object({
    norte: z.number(),
    sul: z.number(),
    leste: z.number(),
    oeste: z.number()
  }).optional(),
  ordenacao: z.object({
    campo: z.enum(['dataPublicacao', 'dataCriacao']),
    direcao: z.enum(['ASC', 'DESC'])
  }).optional(),
  paginacao: z.object({
    limite: z.number().min(1).max(100).default(10),
    pagina: z.number().min(1).default(1)
  }).optional().default({
    limite: 10,
    pagina: 1
  })
});

export type ParsedQuery = z.infer<typeof ParsedQuerySchema>;

export class LLMService {
  constructor(private readonly baseUrl: string) {}

  private buildPrompt(query: string): string {
    return `Converta a seguinte consulta em linguagem natural para um formato JSON estruturado para busca de dados cartográficos.
Query: ${query}

Responda APENAS com um JSON no seguinte formato, sem texto adicional:
{
  "palavraChave": string opcional,
  "escala": uma das opções: "1:25.000", "1:50.000", "1:100.000", "1:250.000",
  "tipoProduto": uma das opções: "Carta Topografica", "Carta Ortoimagem", "Carta Tematica",
  "estado": string opcional com nome do estado,
  "municipio": string opcional com nome do município,
  "areaSuprimento": uma das opções: "1° Centro de Geoinformação (1° CGEO)" até "5° Centro de Geoinformação (5° CGEO)",
  "projeto": uma das opções permitidas (Rondônia, Amapá, etc),
  "periodoPublicacao": {
    "inicio": "YYYY-MM-DD",
    "fim": "YYYY-MM-DD"
  },
  "periodoCriacao": {
    "inicio": "YYYY-MM-DD",
    "fim": "YYYY-MM-DD"
  },
  "bbox": {
    "norte": number,
    "sul": number,
    "leste": number,
    "oeste": number
  },
  "ordenacao": {
    "campo": "dataPublicacao" ou "dataCriacao",
    "direcao": "ASC" ou "DESC"
  },
  "paginacao": {
    "limite": número entre 1 e 100,
    "pagina": número maior que 0
  }
}

Se o usuário mencionar ordenação ou limites de resultados, inclua esses campos. 
Caso contrário, omita os campos não mencionados.
A paginação é opcional, se não especificada será usado o padrão (10 resultados por página, página 1).`
  }

  private validateResponse(response: any): ParsedQuery {
    try {
      if (typeof response === 'string') {
        try {
          response = JSON.parse(response);
        } catch (e) {
          logger.error('LLM returned invalid JSON:', response);
          throw new Error('Não foi possível entender o pedido do usuário - JSON inválido retornado pela LLM');
        }
      }

      const validatedResponse = ParsedQuerySchema.parse(response);
      return validatedResponse;
    } catch (error) {
      logger.error('LLM response validation failed:', { error, response });
      throw new Error('Não foi possível entender o pedido do usuário - formato de resposta inválido');
    }
  }

  async processQuery(query: SearchQuery): Promise<ParsedQuery> {
    try {
      logger.info('Processing query with LLM:', query);
      
      const prompt = this.buildPrompt(query.query);
      logger.debug('Generated LLM prompt:', { prompt });

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: 'deepseek-1.5b',
        }),
      });

      if (!response.ok) {
        logger.error('LLM request failed:', { 
          status: response.status, 
          statusText: response.statusText 
        });
        throw new Error(`LLM request failed: ${response.statusText}`);
      }

      const rawResponse = await response.text();
      logger.debug('Raw LLM response:', { rawResponse });

      const parsedQuery = this.validateResponse(rawResponse);
      logger.info('Successfully processed and validated LLM response:', parsedQuery);

      return parsedQuery;
    } catch (error) {
      logger.error('LLM processing error:', { error, query });
      throw error;
    }
  }
}