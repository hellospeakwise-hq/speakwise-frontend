import { test, expect } from '@playwright/test'

const SPEAKER_EMAIL = process.env.TEST_SPEAKER_EMAIL ?? ''
const SPEAKER_PASS  = process.env.TEST_SPEAKER_PASSWORD ?? ''
const ORG_EMAIL     = process.env.TEST_ORG_EMAIL ?? ''
const ORG_PASS      = process.env.TEST_ORG_PASSWORD ?? ''

test.describe('Sign In Flow', () => {
  test('sign-in page renders correctly', async ({ page }) => {
    await page.goto('/signin')
    await expect(page.getByRole('heading', { name: /sign in|welcome back/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows error on wrong password', async ({ page }) => {
    test.skip(!SPEAKER_EMAIL, 'TEST_SPEAKER_EMAIL not configured')

    await page.goto('/signin')
    await page.getByLabel(/email/i).fill(SPEAKER_EMAIL)
    await page.getByLabel(/password/i).fill('totally_wrong_password_xyz')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Expect an error toast or error message
    await expect(
      page.getByText(/invalid|incorrect|wrong|failed|credentials/i)
    ).toBeVisible({ timeout: 8_000 })
    // Should stay on signin
    await expect(page).toHaveURL(/signin/)
  })

  test('shows error on non-existent email', async ({ page }) => {
    await page.goto('/signin')
    await page.getByLabel(/email/i).fill('doesnotexist_99999@nowhere.com')
    await page.getByLabel(/password/i).fill('SomePassword123!')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(
      page.getByText(/invalid|incorrect|not found|failed/i)
    ).toBeVisible({ timeout: 8_000 })
    await expect(page).toHaveURL(/signin/)
  })

  test('speaker: successful sign-in redirects to speaker dashboard', async ({ page }) => {
    test.skip(!SPEAKER_EMAIL || !SPEAKER_PASS, 'TEST_SPEAKER_* not configured')

    await page.goto('/signin')
    await page.getByLabel(/email/i).fill(SPEAKER_EMAIL)
    await page.getByLabel(/password/i).fill(SPEAKER_PASS)
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/speaker/, { timeout: 15_000 })
  })

  test('organizer: successful sign-in redirects to organizer dashboard', async ({ page }) => {
    test.skip(!ORG_EMAIL || !ORG_PASS, 'TEST_ORG_* not configured')

    await page.goto('/signin')
    await page.getByLabel(/email/i).fill(ORG_EMAIL)
    await page.getByLabel(/password/i).fill(ORG_PASS)
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/organizer/, { timeout: 15_000 })
  })

  test('forgot password link navigates to /forgot-password', async ({ page }) => {
    await page.goto('/signin')
    await page.getByRole('link', { name: /forgot.*password/i }).click()
    await expect(page).toHaveURL(/forgot-password/)
  })

  test('sign-up link navigates to /signup', async ({ page }) => {
    await page.goto('/signin')
    await page.getByRole('link', { name: /sign up|create account/i }).click()
    await expect(page).toHaveURL(/signup/)
  })

  test('unauthenticated access to /dashboard redirects to /signin', async ({ page }) => {
    // Clear any stored auth just in case
    await page.goto('/signin')
    await page.evaluate(() => localStorage.clear())

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/signin/, { timeout: 8_000 })
  })
})
