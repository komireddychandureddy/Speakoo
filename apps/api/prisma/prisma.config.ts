import path from 'node:path';
import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

// Load environment-specific .env file first, then fall back to .env
const nodeEnv = process.env.NODE_ENV ?? 'development';
dotenv.config({ path: path.resolve(__dirname, '..', `.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    `DATABASE_URL is not set. Ensure .env.${nodeEnv} or .env exists in the project root.`,
  );
}

export default defineConfig({
  earlyAccess: true,
  schema: path.resolve(__dirname, 'schema.prisma'),
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const { default: pg } = await import('pg');
      const pool = new pg.Pool({ connectionString: databaseUrl });
      return new PrismaPg(pool);
    },
  },
});
