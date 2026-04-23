import { test, expect } from '@playwright/test'

test.describe('Admin Authentication', () => {
  test('should load admin login page', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('h1')).toContainText(/Admin Login/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/admin/login')

    // Fill in login form
    await page.fill('[name="email"]', 'invalid@example.com')
    await page.fill('[name="password"]', 'wrongpassword')

    // Submit form
    await page.click('[type="submit"]')

    // Check for error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/admin/login')

    // Fill in valid credentials (you'll need to set these up in your test environment)
    await page.fill('[name="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@example.com')
    await page.fill('[name="password"]', process.env.TEST_ADMIN_PASSWORD || 'password')

    // Submit form
    await page.click('[type="submit"]')

    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/)
  })
})

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/admin/login')
    await page.fill('[name="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@example.com')
    await page.fill('[name="password"]', process.env.TEST_ADMIN_PASSWORD || 'password')
    await page.click('[type="submit"]')
    await page.waitForURL(/\/admin/)
  })

  test('should display admin dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Admin Dashboard/)
  })

  test('should navigate to tenants page', async ({ page }) => {
    await page.click('[data-testid="tenants-nav"]')
    await expect(page).toHaveURL(/\/admin\/tenants/)
  })

  test('should navigate to analytics page', async ({ page }) => {
    await page.click('[data-testid="analytics-nav"]')
    await expect(page).toHaveURL(/\/admin\/analytics/)
  })
})