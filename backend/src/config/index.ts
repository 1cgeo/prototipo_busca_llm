import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'geospatial_search',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  llm: {
    baseUrl: process.env.LLM_BASE_URL || 'http://localhost:11434',
  },
};