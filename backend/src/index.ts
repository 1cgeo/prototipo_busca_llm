import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import searchRouter from './routes/search.js';

const app = express();

// Middlewares de segurança e utilidades
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', searchRouter);

// Tratamento de erro para rotas não encontradas
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicia o servidor
app.listen(config.port, () => {
  logger.info(`Servidor rodando na porta ${config.port}`);
});
