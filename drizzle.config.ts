import 'dotenv/config';
import type { Config } from 'drizzle-kit';

const config: Config = {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '', // Use 'url' instead of 'connectionString'
  },
};

export default config;
