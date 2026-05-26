import path from 'node:path';
import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

// Load environment-specific .env file first, then fall back to .env
const nodeEnv = process.env.NODE_ENV ?? 'development';
dotenv.config({ path: path.resolve(__dirname, `.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  schema: path.resolve(__dirname, 'prisma', 'schema.prisma'),
  migrations: {
    path: path.resolve(__dirname, 'prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
