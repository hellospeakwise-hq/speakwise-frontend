import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import fs from 'fs'

// Storage state files — written by global setup, read by tests
export const SPEAKER_STATE = path.join(__dirname, 'e2e/.auth/speaker.json')
export const ORG_STATE = path.join(__dirname, 'e2e/.auth/organizer.json')
export const PUBLIC_STATE = path.join(__dirname, 'e2e/.auth/public.json')

export default defineConfig({
  testDir: './e2e',
  // 60s test timeout to allow cold Next.js page compilation in dev mode
  timeout: 60_000,
  // Run tests in files in parallel
  fullyParallel: true,
  // Fail fast in CI
  forbidOnly: !!process.env.CI,
  // Retry once on CI
  retries: process.env.CI ? 1 : 0,
  // 2 workers locally to prevent Next.js dev server compilation bottleneck
  workers: process.env.CI ? 1 : 2,
  // HTML report
  reporter: [['html', { open: 'never' }], ['line']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    // Capture screenshots and video on failure only
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
  },

  // Warm up auth sessions before any test runs
  globalSetup: './e2e/global-setup.ts',

  projects: [
    // Public tests — uses public state (cookie banner dismissed)
    {
      name: 'public',
      testMatch: ['**/public/**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        ...(fs.existsSync(PUBLIC_STATE) ? { storageState: PUBLIC_STATE } : {}),
      },
    },

    // Auth flow tests — no stored state (they test the login itself)
    {
      name: 'auth',
      testMatch: ['**/auth/**/*.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
      
    },

    // Speaker dashboard — loads speaker storage state
    {
      name: 'speaker-dashboard',
      testMatch: ['**/dashboard/speaker.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: SPEAKER_STATE,
      },
    },

    // Organizer dashboard — loads organizer storage state
    {
      name: 'organizer-dashboard',
      testMatch: ['**/dashboard/organizer.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: ORG_STATE,
      },
    },
  ],

  // Auto-start the Next.js dev server — skip if SKIP_SERVER is set (for CI with pre-deployed app)
  ...(process.env.SKIP_SERVER
    ? {}
    : {
        webServer: {
          command: 'pnpm dev',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
})
