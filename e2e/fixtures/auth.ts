/**
 * auth.ts — Shared Playwright fixture
 *
 * Extends the base `test` object with an `authedPage` fixture that automatically
 * loads the correct storage state based on the user role you need.
 *
 * Usage in tests:
 *   import { test } from '../fixtures/auth'
 *   test('speaker can see dashboard', async ({ authedPage }) => { ... })
 */

import { test as base, expect, Page } from '@playwright/test'

type AuthFixtures = {
  /** A page pre-loaded with the currently active storageState (set per project) */
  authedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authedPage: async ({ page }, use) => {
    // The storageState is already applied at the project level in playwright.config.ts
    // This fixture just exposes the page under a clearer name
    await use(page)
  },
})

export { expect }
