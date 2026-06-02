import path from 'node:path';
import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

// Load environment-specific .env file first, then fall back to .env
const nodeEnv = process.env.NODE_ENV ?? 'development';
dotenv.config({ path: path.resolve(__dirname, '..', `.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export default defineConfig({
  schema: path.resolve(__dirname, 'schema.prisma'),
  migrations: {
    path: path.resolve(__dirname, 'migrations'),
    seed: 'ts-node --transpile-only --compiler-options \'{"module":"CommonJS"}\' prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
