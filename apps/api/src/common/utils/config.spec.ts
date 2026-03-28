import { validateApiRuntimeEnv } from './config';

const originalEnv = process.env;

const baseEnv = {
  DATABASE_URL: 'postgresql://assetflow:assetflow@localhost:5432/assetflow?schema=public',
  FRONTEND_URL: 'http://localhost:3000',
  BACKEND_URL: 'http://localhost:3000/api',
  JWT_SECRET: 'top_secret_jwt',
  MAIL_FROM: 'AssetFlow Security <no-reply@assetflow.local>',
  PASSWORD_RESET_URL_BASE: 'http://localhost:3000/reset-password',
  GOOGLE_CLIENT_ID: '',
  GOOGLE_CLIENT_SECRET: '',
  GOOGLE_CALLBACK_URL: 'http://localhost:3000/api/auth/google/callback',
  GITHUB_CLIENT_ID: '',
  GITHUB_CLIENT_SECRET: '',
  GITHUB_CALLBACK_URL: 'http://localhost:3000/api/auth/github/callback',
};

describe('validateApiRuntimeEnv', () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ...baseEnv,
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('allows preset OAuth callback URLs when credentials are unset', () => {
    expect(() => validateApiRuntimeEnv()).not.toThrow();
  });

  it('still rejects partially configured Google OAuth credentials', () => {
    process.env.GOOGLE_CLIENT_ID = 'google-client-id';

    expect(() => validateApiRuntimeEnv()).toThrow(
      'Google OAuth requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL or BACKEND_URL.',
    );
  });

  it('still rejects partially configured GitHub OAuth credentials', () => {
    process.env.GITHUB_CLIENT_SECRET = 'github-client-secret';

    expect(() => validateApiRuntimeEnv()).toThrow(
      'GitHub OAuth requires GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GITHUB_CALLBACK_URL or BACKEND_URL.',
    );
  });
});
