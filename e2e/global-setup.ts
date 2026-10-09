/**
 * global-setup.ts
 *
 * Runs ONCE before all tests. Logs in as Speaker and Organizer, saves the
 * browser storage state so authenticated test suites don't need to log in
 * on every test (much faster, avoids rate-limiting).
 *
 * If credentials are missing or login fails, writes an empty state file so
 * public tests always run — dashboard tests will simply be skipped.
 */

import { chromium, FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { SPEAKER_STATE, ORG_STATE, PUBLIC_STATE } from '../playwright.config'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

const CONSENT_STATE = JSON.stringify({
  cookies: [],
  origins: [
    {
      origin: BASE_URL,
      localStorage: [
        {
          name: 'sw_cookie_consent',
          value: JSON.stringify({
            accepted: true,
            timestamp: Date.now(),
            preferences: { necessary: true, performance: true, functional: true },
          }),
        },
      ],
    },
  ],
})

const EMPTY_STATE = CONSENT_STATE

async function loginAndSave(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  email: string,
  password: string,
  stateFile: string,
  label: string
): Promise<boolean> {
  const context = await browser.newContext()
  const page = await context.newPage()
  try {
    // Dismiss cookie popup before page loads
    await page.addInitScript(() => {
      localStorage.setItem('sw_cookie_consent', JSON.stringify({
        accepted: true,
        timestamp: Date.now(),
        preferences: { necessary: true, performance: true, functional: true },
      }))
    })

    await page.goto(`${BASE_URL}/signin`, { waitUntil: 'domcontentloaded' })
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/password/i).fill(password)
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait until we land on a dashboard page
    await page.waitForURL(/\/dashboard\//, { timeout: 15_000 })

    // Save the full browser state (cookies + localStorage)
    await context.storageState({ path: stateFile })
    console.log(`[global-setup] ✅ ${label} auth state saved → ${stateFile}`)
    return true
  } catch (err) {
    console.warn(`[global-setup] ⚠️  ${label} login failed — dashboard tests will be skipped.`)
    console.warn(`   Reason: ${err instanceof Error ? err.message : String(err)}`)
    console.warn(`   Make sure .env.test has valid credentials for ${label}.`)
    fs.writeFileSync(stateFile, EMPTY_STATE)
    return false
  } finally {
    await context.close()
  }
}

export default async function globalSetup(_config: FullConfig) {
  // Ensure the auth dir exists
  const authDir = path.join(__dirname, '.auth')
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true })

  // Always write public state with cookie consent pre-accepted
  fs.writeFileSync(PUBLIC_STATE, CONSENT_STATE)

  const selectedProjects = process.argv.flatMap((arg, index, args) => {
    if (arg.startsWith('--project=')) return arg.slice('--project='.length).split(',')
    if (arg === '--project') return (args[index + 1] ?? '').split(',')
    return []
  }).filter(Boolean)

  if (selectedProjects.length > 0 && selectedProjects.every(project => project === 'public')) {
    fs.writeFileSync(SPEAKER_STATE, EMPTY_STATE)
    fs.writeFileSync(ORG_STATE, EMPTY_STATE)
    return
  }

  const speakerEmail = process.env.TEST_SPEAKER_EMAIL
  const speakerPass  = process.env.TEST_SPEAKER_PASSWORD
  const orgEmail     = process.env.TEST_ORG_EMAIL
  const orgPass      = process.env.TEST_ORG_PASSWORD

  // Skip entire browser launch if no credentials at all
  const needsBrowser = (speakerEmail && speakerPass) || (orgEmail && orgPass)
  if (!needsBrowser) {
    console.warn('[global-setup] No test credentials found in .env.test — writing empty auth states.')
    console.warn('   Public tests will run normally. Add credentials to .env.test for dashboard tests.')
    fs.writeFileSync(SPEAKER_STATE, EMPTY_STATE)
    fs.writeFileSync(ORG_STATE, EMPTY_STATE)
    return
  }

  const browser = await chromium.launch()

  if (speakerEmail && speakerPass) {
    await loginAndSave(browser, speakerEmail, speakerPass, SPEAKER_STATE, 'Speaker')
  } else {
    console.warn('[global-setup] TEST_SPEAKER_EMAIL/PASSWORD not set — skipping speaker auth')
    fs.writeFileSync(SPEAKER_STATE, EMPTY_STATE)
  }

  if (orgEmail && orgPass) {
    await loginAndSave(browser, orgEmail, orgPass, ORG_STATE, 'Organizer')
  } else {
    console.warn('[global-setup] TEST_ORG_EMAIL/PASSWORD not set — skipping organizer auth')
    fs.writeFileSync(ORG_STATE, EMPTY_STATE)
  }

  await browser.close()
}
