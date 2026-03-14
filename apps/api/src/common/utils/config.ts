import dotenv from 'dotenv';
import { expand } from 'dotenv-expand';

expand(dotenv.config());

export const getDatabaseUrl = (): string | undefined => process.env.DATABASE_URL ?? undefined;
