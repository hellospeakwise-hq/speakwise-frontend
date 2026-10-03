import { test, expect } from '../fixtures/auth'

/**
 * Organizer Dashboard Tests
 * Runs with organizer storage state pre-loaded (storageState set in playwright.config.ts)
 */

test.describe('Organizer Dashboard', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    test.skip(
      !process.env.TEST_ORG_EMAIL,
      'TEST_ORG_EMAIL not configured — skipping organizer dashboard tests'
    )
    await page.goto('/dashboard/organizer')
    await page.waitForLoadState('networkidle')
  })

  test('renders without flashing speaker dashboard', async ({ authedPage: page }) => {
    await expect(page).toHaveURL(/\/dashboard\/organizer/)
    const onSpeaker = await page.evaluate(() =>
      window.location.pathname.includes('/dashboard/speaker')
    )
    expect(onSpeaker).toBe(false)
  })

  test('shows organization name or dashboard heading', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 8_000 })
  })

  test('shows status banner (pending, active, or no org found)', async ({ authedPage: page }) => {
    // One of these states must be shown
    const pending = page.getByText(/profile under review|being reviewed/i)
    const active  = page.getByText(/approved|active/i)
    const noOrg   = page.getByText(/no organization found|being set up/i)

    const anyVisible = await Promise.any([
      pending.isVisible({ timeout: 5_000 }),
      active.isVisible({ timeout: 5_000 }),
      noOrg.isVisible({ timeout: 5_000 }),
      // Org name in heading is also proof of active state
      page.getByRole('heading', { level: 1 }).isVisible({ timeout: 5_000 }),
    ]).catch(() => false)

    expect(anyVisible).toBeTruthy()
  })

  test('main navigation is visible', async ({ authedPage: page }) => {
    await expect(page.getByRole('link', { name: /dashboard/i }).first()).toBeVisible()
  })

  test('event management section or "no events" state visible for active org', async ({ authedPage: page }) => {
    // If org is active, event management table should be shown
    const table  = page.locator('table, [data-testid="event-table"]')
    const noEvts = page.getByText(/no events|create your first/i)

    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false)
    const hasEmpty = await noEvts.isVisible({ timeout: 5_000 }).catch(() => false)

    // Either state is valid — just verify we're not showing a blank screen
    const isPending = await page.getByText(/profile under review/i).isVisible().catch(() => false)
    if (!isPending) {
      expect(hasTable || hasEmpty).toBe(true)
    }
  })

  test('/dashboard base route redirects organizer to /dashboard/organizer', async ({ authedPage: page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard\/organizer/, { timeout: 8_000 })
  })

  test('logout redirects to /signin', async ({ authedPage: page }) => {
    const logoutBtn = page.getByRole('button', { name: /log out|sign out/i })
    const visible = await logoutBtn.isVisible().catch(() => false)

    if (!visible) {
      const menuBtn = page.getByRole('button').filter({ hasText: /julius|user|account/i }).first()
      if (await menuBtn.isVisible()) await menuBtn.click()
    }

    await page.getByRole('button', { name: /log out|sign out/i }).click()
    await expect(page).toHaveURL(/signin/, { timeout: 10_000 })
  })
})
