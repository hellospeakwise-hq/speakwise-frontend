import { test, expect } from '@playwright/test'

test.describe('Events Listing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/events')
    await expect(page.getByText(/loading events/i)).toBeHidden({ timeout: 30_000 })
  })

  test('page renders with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible()
    await expect(page.getByText(/discover.*events/i)).toBeVisible()
  })

  test('shows event count in results', async ({ page }) => {
    await expect(page.getByText(/showing \d+ of \d+ event/i)).toBeVisible({ timeout: 25_000 })
  })

  test('filter sidebar is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Time Period' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /call for proposal/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /filter by country/i })).toBeVisible()
  })

  test('search filter narrows results in real time', async ({ page }) => {
    const cards = page.locator('main a[href*="/events/"]')
    const countBefore = await cards.count()
    test.skip(countBefore === 0, 'No events in database')

    await page.getByPlaceholder(/event name.*location/i).fill('zzznomatch9999')

    // Should show empty state
    await expect(page.getByText(/no events match/i)).toBeVisible({ timeout: 5_000 })
  })

  test('search then clear restores all events', async ({ page }) => {
    const cards = page.locator('main a[href*="/events/"]')
    const countBefore = await cards.count()
    test.skip(countBefore === 0, 'No events in database')

    const searchInput = page.getByPlaceholder(/event name.*location/i)
    await searchInput.fill('zzznomatch9999')
    await expect(page.getByText(/no events match/i)).toBeVisible({ timeout: 5_000 })

    // Clear the search
    await searchInput.clear()
    await expect(cards).toHaveCount(countBefore, { timeout: 5_000 })
  })

  test('period filter: Upcoming shows subset', async ({ page }) => {
    const cards = page.locator('main a[href*="/events/"]')
    const countAll = await cards.count()
    test.skip(countAll === 0, 'No events in database')

    await page.getByRole('button', { name: 'Upcoming', exact: true }).click()
    // Count should be ≤ total
    const countUpcoming = await cards.count()
    expect(countUpcoming).toBeLessThanOrEqual(countAll)

    // Count label should update
    await expect(page.getByText(/showing \d+ of \d+ event/i)).toBeVisible()
  })

  test('period filter: Past shows subset', async ({ page }) => {
    const cards = page.locator('main a[href*="/events/"]')
    const countAll = await cards.count()
    test.skip(countAll === 0, 'No events in database')

    await page.getByRole('button', { name: 'Past', exact: true }).click()
    const countPast = await cards.count()
    expect(countPast).toBeLessThanOrEqual(countAll)
  })

  test('period filter: All Events restores full list', async ({ page }) => {
    const cards = page.locator('main a[href*="/events/"]')
    const countAll = await cards.count()
    test.skip(countAll === 0, 'No events in database')

    await page.getByRole('button', { name: 'Upcoming', exact: true }).click()
    await page.getByRole('button', { name: 'All Events', exact: true }).click()
    await expect(cards).toHaveCount(countAll, { timeout: 5_000 })
  })

  test('CFP Open toggle filters events', async ({ page }) => {
    const cards = page.locator('main a[href*="/events/"]')
    const countAll = await cards.count()
    test.skip(countAll === 0, 'No events in database')

    await page.getByRole('button', { name: /cfp open only/i }).click()
    const countCfp = await cards.count()
    expect(countCfp).toBeLessThanOrEqual(countAll)
  })

  test('admission filters select free and ticketed states', async ({ page }) => {
    const freeFilter = page.getByRole('button', { name: 'Free', exact: true })
    const ticketedFilter = page.getByRole('button', { name: 'Ticketed', exact: true })

    await freeFilter.click()
    await expect(freeFilter).toHaveAttribute('aria-pressed', 'true')
    await expect(ticketedFilter).toHaveAttribute('aria-pressed', 'false')

    await ticketedFilter.click()
    await expect(ticketedFilter).toHaveAttribute('aria-pressed', 'true')
    await expect(freeFilter).toHaveAttribute('aria-pressed', 'false')
  })

  test('Clear all filters button appears when filters active', async ({ page }) => {
    await page.getByRole('button', { name: 'Upcoming', exact: true }).click()
    await expect(page.getByRole('button', { name: /clear all filters/i })).toBeVisible({ timeout: 5_000 })
  })

  test('Clear all filters resets everything', async ({ page }) => {
    const cards = page.locator('main a[href*="/events/"]')
    const countAll = await cards.count()
    test.skip(countAll === 0, 'No events in database')

    await page.getByRole('button', { name: 'Upcoming', exact: true }).click()
    await page.getByRole('button', { name: /cfp open only/i }).click()
    await page.getByRole('button', { name: /clear all filters/i }).click()

    await expect(cards).toHaveCount(countAll, { timeout: 5_000 })
    await expect(page.getByRole('button', { name: /clear all filters/i })).not.toBeVisible()
  })

  test('grid/list view toggle works', async ({ page }) => {
    const cards = page.locator('main a[href*="/events/"]')
    const countAll = await cards.count()
    test.skip(countAll === 0, 'No events in database')

    // Switch to list view
    await page.getByLabel(/list view/i).click()
    await expect(cards.first()).toBeVisible()

    // Switch back to grid
    await page.getByLabel(/grid view/i).click()
    await expect(cards.first()).toBeVisible()
  })

  test('clicking an event card navigates to event detail', async ({ page }) => {
    const cards = page.locator('main a[href*="/events/"]')
    const cardCount = await cards.count()
    test.skip(cardCount === 0, 'No events in database')

    const firstCard = cards.first()
    const href = await firstCard.getAttribute('href')
    await firstCard.click()
    await expect(page).toHaveURL(href!, { timeout: 8_000 })
  })
})
