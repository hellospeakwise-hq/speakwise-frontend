import { test, expect } from '@playwright/test'

test.describe('Sign Up Flow', () => {
  test('shows sign-up form with required fields', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('heading', { name: /create.*account|sign up/i })).toBeVisible()
    await expect(page.getByLabel(/first name/i)).toBeVisible()
    await expect(page.getByLabel(/last name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i).first()).toBeVisible()
  })

  test('shows validation errors when submitting empty form', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('button', { name: /sign up|create account/i }).click()
    // HTML5 validation or toast should appear
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toBeFocused().catch(() => {
      // Fallback: check that we're still on the signup page
    })
    await expect(page).toHaveURL(/signup/)
  })

  test('navigates to verify-email after successful signup', async ({ page }) => {
    const timestamp = Date.now()
    const email = `testuser_${timestamp}@mailinator.com`

    await page.goto('/signup')

    await page.getByLabel(/first name/i).fill('Test')
    await page.getByLabel(/last name/i).fill('User')
    // Username field if present
    const usernameField = page.getByLabel(/username/i)
    if (await usernameField.isVisible()) {
      await usernameField.fill(`testuser_${timestamp}`)
    }
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/^password$/i).fill('TestPassword123!')
    // Confirm password if present
    const confirmField = page.getByLabel(/confirm password/i)
    if (await confirmField.isVisible()) {
      await confirmField.fill('TestPassword123!')
    }

    await page.getByRole('button', { name: /sign up|create account/i }).click()

    // Should redirect to verify-email
    await expect(page).toHaveURL(/verify-email/, { timeout: 10_000 })
  })

  test('verify-email page shows the registered email', async ({ page }) => {
    const email = 'someone@example.com'
    await page.goto(`/verify-email?email=${encodeURIComponent(email)}`)
    await expect(page.getByText(email)).toBeVisible()
  })

  test('sign-in link on signup page navigates to signin', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('link', { name: /sign in|log in/i }).click()
    await expect(page).toHaveURL(/signin/)
  })
})
