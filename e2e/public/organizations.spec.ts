import { test, expect } from '@playwright/test'

test.describe('Organizations Page', () => {
  test('organizations listing page renders', async ({ page }) => {
    await page.goto('/organizations')
    await expect(page.getByRole('heading', { name: /organizations/i })).toBeVisible()
  })

  test('shows organization cards', async ({ page }) => {
    await page.goto('/organizations')
    // Wait for skeletons to disappear
    await page.locator('.animate-pulse').first().waitFor({ state: 'detached', timeout: 15_000 }).catch(() => {})
    const cards = page.locator('main a[href*="/organizations/"]')
    const cardCount = await cards.count()
    // Either org cards exist, or an empty state message
    if (cardCount === 0) {
      await expect(page.getByText(/no organizations|be the first/i)).toBeVisible()
    } else {
      await expect(cards.first()).toBeVisible()
    }
  })

  test('clicking an org card navigates to org detail page', async ({ page }) => {
    await page.goto('/organizations')
    await page.locator('.animate-pulse').first().waitFor({ state: 'detached', timeout: 15_000 }).catch(() => {})
    const cards = page.locator('main a[href*="/organizations/"]')
    const cardCount = await cards.count()
    test.skip(cardCount === 0, 'No organizations in database')

    const firstCard = cards.first()
    const href = await firstCard.getAttribute('href')
    await firstCard.click()
    await expect(page).toHaveURL(href!, { timeout: 8_000 })
  })
})

test.describe('Organization Detail Page', () => {
  let orgUrl: string

  test.beforeEach(async ({ page }) => {
    // Get the first org from the listing
    await page.goto('/organizations')
    await page.locator('.animate-pulse').first().waitFor({ state: 'detached', timeout: 15_000 }).catch(() => {})
    const cards = page.locator('main a[href*="/organizations/"]')
    const cardCount = await cards.count()
    if (cardCount === 0) {
      test.skip(true, 'No organizations in database')
      return
    }
    const firstCard = cards.first()
    orgUrl = (await firstCard.getAttribute('href')) ?? ''
    await page.goto(orgUrl)
    await page.waitForLoadState('networkidle')
  })

  test('shows organization name', async ({ page }) => {
    test.skip(!orgUrl)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('shows back to organizations link', async ({ page }) => {
    test.skip(!orgUrl)
    await expect(page.getByRole('link', { name: /organizations/i })).toBeVisible()
    await page.getByRole('link', { name: /^organizations$/i }).click()
    await expect(page).toHaveURL(/\/organizations$/)
  })

  test('shows contact section in sidebar', async ({ page }) => {
    test.skip(!orgUrl)
    await expect(page.getByRole('heading', { name: /contact/i })).toBeVisible()
  })

  test('events section appears when org has events', async ({ page }) => {
    test.skip(!orgUrl)
    const eventsSection = page.getByRole('heading', { name: /^events$/i })
    const hasEvents = await eventsSection.isVisible({ timeout: 5_000 }).catch(() => false)

    if (hasEvents) {
      // Filter bar should also be visible
      await expect(page.getByPlaceholder(/search events/i)).toBeVisible()
      await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Upcoming' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Past' })).toBeVisible()
      await expect(page.getByRole('button', { name: /cfp open/i })).toBeVisible()
    }
    // If org has no events, the section simply doesn't render — both cases are valid
  })

  test('org event search filters events', async ({ page }) => {
    test.skip(!orgUrl)
    const eventsSection = page.getByRole('heading', { name: /^events$/i })
    const hasEvents = await eventsSection.isVisible({ timeout: 5_000 }).catch(() => false)
    test.skip(!hasEvents, 'This org has no events')

    const searchInput = page.getByPlaceholder(/search events/i)
    await searchInput.fill('zzznomatch9999')
    await expect(page.getByText(/no events match/i)).toBeVisible({ timeout: 5_000 })

    await searchInput.clear()
    await expect(page.getByText(/no events match/i)).not.toBeVisible({ timeout: 3_000 })
  })

  test('org event period filter works', async ({ page }) => {
    test.skip(!orgUrl)
    const eventsSection = page.getByRole('heading', { name: /^events$/i })
    const hasEvents = await eventsSection.isVisible({ timeout: 5_000 }).catch(() => false)
    test.skip(!hasEvents, 'This org has no events')

    await page.getByRole('button', { name: 'Upcoming' }).click()
    // Should not crash — count changes or empty state shown
    await page.waitForTimeout(500)

    await page.getByRole('button', { name: 'All' }).click()
    await page.waitForTimeout(500)
  })

  test('clicking an org event navigates to event detail', async ({ page }) => {
    test.skip(!orgUrl)
    const eventsSection = page.getByRole('heading', { name: /^events$/i })
    const hasEvents = await eventsSection.isVisible({ timeout: 5_000 }).catch(() => false)
    test.skip(!hasEvents, 'This org has no events')

    const firstEventLink = page.locator('a[href*="/events/"]').first()
    const href = await firstEventLink.getAttribute('href')
    await firstEventLink.click()
    await expect(page).toHaveURL(href!, { timeout: 8_000 })
  })
})
