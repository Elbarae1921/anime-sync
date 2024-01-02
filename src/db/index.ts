import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';

export const connection = new Database(process.env.DATABASE_PATH!);

export const db = drizzle(connection, { schema });
