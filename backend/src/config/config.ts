import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
