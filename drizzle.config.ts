import 'dotenv/config';
import type { Config } from 'drizzle-kit';
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite', // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dbCredentials: {
    url: process.env.DATABASE_PATH!
  }
} satisfies Config;
