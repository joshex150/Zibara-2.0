import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const loadEnvFile = () => {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};

  return fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .reduce<Record<string, string>>((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return acc;
      const separator = trimmed.indexOf('=');
      if (separator === -1) return acc;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
      acc[key] = value;
      return acc;
    }, {});
};

const env = loadEnvFile();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 120_000,
  globalSetup: './tests/support/global-setup.ts',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ...process.env,
      ...env,
      NODE_ENV: 'development',
      E2E_TEST_MODE: '1',
      NEXT_PUBLIC_E2E_TEST_MODE: '1',
      E2E_ARTIFACT_DIR: path.join(process.cwd(), '.test-artifacts'),
      NEXTAUTH_URL: 'http://127.0.0.1:3100',
      NEXTAUTH_SECRET: env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET || 'zibara-e2e-secret',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
