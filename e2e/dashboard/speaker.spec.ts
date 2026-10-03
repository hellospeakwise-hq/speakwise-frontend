import { test, expect } from '../fixtures/auth'

/**
 * Speaker Dashboard Tests
 * Runs with speaker storage state pre-loaded (storageState set in playwright.config.ts)
 */

test.describe('Speaker Dashboard', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    test.skip(
      !process.env.TEST_SPEAKER_EMAIL,
      'TEST_SPEAKER_EMAIL not configured — skipping speaker dashboard tests'
    )
    await page.goto('/dashboard/speaker')
    await page.waitForLoadState('networkidle')
  })

  test('renders without flashing organizer dashboard', async ({ authedPage: page }) => {
    const visitedOrg = await page.evaluate(() => {
      return window.location.pathname.includes('/dashboard/organizer')
    })
    expect(visitedOrg).toBe(false)
    await expect(page).toHaveURL(/\/dashboard\/speaker/)
  })

  test('shows dashboard heading or speaker name', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 8_000 })
  })

  test('main navigation is visible', async ({ authedPage: page }) => {
    // Nav should have Dashboard link
    await expect(page.getByRole('link', { name: /dashboard/i }).first()).toBeVisible()
  })

  test('shows speaker events/talks section', async ({ authedPage: page }) => {
    // Look for events/talks content — flexible check
    const hasContent = await page.getByText(/event|talk|session|cfp/i).first().isVisible({ timeout: 5_000 }).catch(() => false)
    // Could be empty state too — both are acceptable
    const hasEmpty = await page.getByText(/no events|no talks|get started/i).isVisible({ timeout: 2_000 }).catch(() => false)
    expect(hasContent || hasEmpty).toBe(true)
  })

  test('profile link in nav navigates to /profile', async ({ authedPage: page }) => {
    // Find the avatar/user menu
    const userMenu = page.getByRole('button', { name: /account|profile|menu/i })
    if (await userMenu.isVisible()) {
      await userMenu.click()
    }
    await page.getByRole('link', { name: /profile/i }).first().click()
    await expect(page).toHaveURL(/\/profile/, { timeout: 8_000 })
  })

  test('logout works and redirects to signin', async ({ authedPage: page }) => {
    // Find logout button — may be in a dropdown
    const logoutBtn = page.getByRole('button', { name: /log out|sign out/i })
    const isVisible = await logoutBtn.isVisible().catch(() => false)

    if (!isVisible) {
      // May be inside a user menu dropdown
      const menuBtn = page.getByRole('button').filter({ hasText: /julius|user|account/i }).first()
      if (await menuBtn.isVisible()) await menuBtn.click()
    }

    await page.getByRole('button', { name: /log out|sign out/i }).click()
    await expect(page).toHaveURL(/signin/, { timeout: 10_000 })
  })
})
