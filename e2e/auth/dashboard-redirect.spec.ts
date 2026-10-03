import { test, expect } from '@playwright/test'

/**
 * Dashboard Role Routing Tests
 *
 * These tests specifically guard against the speaker-dashboard flash bug:
 * an organizer should NEVER briefly see /dashboard/speaker before landing
 * on /dashboard/organizer.
 *
 * Strategy: After login, we immediately start watching URL changes. The final
 * settled URL must be the correct role-specific dashboard with no intermediate
 * wrong-dashboard visit.
 */

const SPEAKER_EMAIL = process.env.TEST_SPEAKER_EMAIL ?? ''
const SPEAKER_PASS  = process.env.TEST_SPEAKER_PASSWORD ?? ''
const ORG_EMAIL     = process.env.TEST_ORG_EMAIL ?? ''
const ORG_PASS      = process.env.TEST_ORG_PASSWORD ?? ''

test.describe('Dashboard Role Routing', () => {
  test('speaker lands on /dashboard/speaker — not organizer', async ({ page }) => {
    test.skip(!SPEAKER_EMAIL || !SPEAKER_PASS, 'TEST_SPEAKER_* not configured')

    const visitedUrls: string[] = []
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) visitedUrls.push(frame.url())
    })

    await page.goto('/signin')
    await page.getByLabel(/email/i).fill(SPEAKER_EMAIL)
    await page.getByLabel(/password/i).fill(SPEAKER_PASS)
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for dashboard to settle
    await page.waitForURL(/\/dashboard\//, { timeout: 15_000 })

    // Final URL must be speaker dashboard
    await expect(page).toHaveURL(/\/dashboard\/speaker/)

    // At no point should we have landed on organizer dashboard
    const orgVisit = visitedUrls.find(u => u.includes('/dashboard/organizer'))
    expect(orgVisit).toBeUndefined()
  })

  test('organizer lands on /dashboard/organizer — not speaker', async ({ page }) => {
    test.skip(!ORG_EMAIL || !ORG_PASS, 'TEST_ORG_* not configured')

    const visitedUrls: string[] = []
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) visitedUrls.push(frame.url())
    })

    await page.goto('/signin')
    await page.getByLabel(/email/i).fill(ORG_EMAIL)
    await page.getByLabel(/password/i).fill(ORG_PASS)
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for dashboard to settle
    await page.waitForURL(/\/dashboard\//, { timeout: 15_000 })

    // Final URL must be organizer dashboard
    await expect(page).toHaveURL(/\/dashboard\/organizer/)

    // At no point should we have flashed to speaker dashboard
    const speakerVisit = visitedUrls.find(u => u.includes('/dashboard/speaker'))
    expect(speakerVisit).toBeUndefined()
  })

  test('organizer navigating to /dashboard redirects correctly', async ({ page }) => {
    test.skip(!ORG_EMAIL || !ORG_PASS, 'TEST_ORG_* not configured')

    // Sign in first
    await page.goto('/signin')
    await page.getByLabel(/email/i).fill(ORG_EMAIL)
    await page.getByLabel(/password/i).fill(ORG_PASS)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/dashboard\//, { timeout: 15_000 })

    // Navigate to the base /dashboard — should redirect to organizer
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard\/organizer/, { timeout: 8_000 })
  })

  test('speaker navigating to /dashboard/organizer gets redirected', async ({ page }) => {
    test.skip(!SPEAKER_EMAIL || !SPEAKER_PASS, 'TEST_SPEAKER_* not configured')

    // Sign in as speaker
    await page.goto('/signin')
    await page.getByLabel(/email/i).fill(SPEAKER_EMAIL)
    await page.getByLabel(/password/i).fill(SPEAKER_PASS)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/dashboard\/speaker/, { timeout: 15_000 })

    // Try to access organizer dashboard directly
    await page.goto('/dashboard/organizer')

    // ProtectedRoute should redirect them away
    await expect(page).not.toHaveURL(/\/dashboard\/organizer/, { timeout: 5_000 })
  })
})
