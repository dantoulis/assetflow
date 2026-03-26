import dotenv from 'dotenv';
import { expand } from 'dotenv-expand';

expand(dotenv.config());

export const getDatabaseUrl = (): string | undefined => process.env.DATABASE_URL ?? undefined;

export const getFrontendUrl = (): string | undefined => process.env.FRONTEND_URL ?? undefined;
