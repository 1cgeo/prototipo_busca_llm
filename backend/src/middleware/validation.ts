import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const NaturalLanguageSchema = z.object({
  query: z.string()
    .min(3, 'A consulta deve ter pelo menos 3 caracteres')
    .max(500, 'A consulta deve ter no máximo 500 caracteres')
});

const StructuredSearchSchema = z.object({
  filtros: z.object({
    palavraChave: z.string().optional(),
    escala: z.enum(['1:25.000', '1:50.000', '1:100.000', '1:250.000']).optional(),
    tipoProduto: z.enum(['Carta Topografica', 'Carta Ortoimagem', 'Carta Tematica']).optional(),
    estado: z.string().optional(),
    municipio: z.string().optional(),
    areaSuprimento: z.string().optional(),
    projeto: z.string().optional(),
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
    }).optional()
  }),
  ordenacao: z.object({
    campo: z.enum(['dataPublicacao', 'dataCriacao']),
    direcao: z.enum(['ASC', 'DESC'])
  }),
  paginacao: z.object({
    pagina: z.number().min(1),
    limite: z.number().min(1).max(100)
  })
});

export const validateNaturalLanguageQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    NaturalLanguageSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Erro de validação',
        details: error.errors 
      });
    }
    res.status(400).json({ error: 'Requisição inválida' });
  }
};

export const validateStructuredSearch = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    StructuredSearchSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Erro de validação',
        details: error.errors 
      });
    }
    res.status(400).json({ error: 'Requisição inválida' });
  }
};