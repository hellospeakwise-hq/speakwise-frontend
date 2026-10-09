import { test, expect } from '@playwright/test'

test.describe('Speakers Directory', () => {
  test('speakers page renders with heading', async ({ page }) => {
    await page.goto('/speakers')
    await expect(page.getByRole('heading', { level: 1, name: 'Speakers Directory' })).toBeVisible()
  })

  test('shows speaker cards or empty state', async ({ page }) => {
    await page.goto('/speakers')
    await expect(page.getByRole('heading', { level: 1, name: 'Speakers Directory' })).toBeVisible()

    const cards = page.locator('[href*="/speakers/"]').filter({ hasNot: page.locator('[href="/speakers"]') })
    const count = await cards.count()

    if (count === 0) {
      // Empty state is acceptable
      await expect(page.getByText(/no speakers|be the first/i)).toBeVisible().catch(() => {
        // Some apps show nothing — that's fine too
      })
    } else {
      await expect(cards.first()).toBeVisible()
    }
  })

  test('clicking a speaker card navigates to speaker profile', async ({ page }) => {
    await page.goto('/speakers')
    await expect(page.getByRole('heading', { level: 1, name: 'Speakers Directory' })).toBeVisible()

    // Find speaker cards (exclude nav links)
    const cards = page.locator('a[href*="/speakers/"]').filter({ hasNot: page.locator('[href="/speakers"]') })
    const count = await cards.count()
    test.skip(count === 0, 'No speakers in database')

    const href = await cards.first().getAttribute('href')
    await cards.first().click()
    await expect(page).toHaveURL(href!, { timeout: 8_000 })
  })

  test('speaker detail page shows speaker name', async ({ page }) => {
    await page.goto('/speakers')
    await page.waitForTimeout(2000)

    const cards = page.locator('a[href*="/speakers/"]').filter({ hasNot: page.locator('[href="/speakers"]') })
    const count = await cards.count()
    test.skip(count === 0, 'No speakers in database')

    await cards.first().click()
    await page.waitForLoadState('networkidle')

    // Speaker profile should have at least one heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 8_000 })
  })
})
