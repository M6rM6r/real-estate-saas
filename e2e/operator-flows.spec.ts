/**
 * Critical operator flows — assumes the app is running on baseURL (default: localhost:3000).
 *
 * These tests validate the two most important operator paths:
 *   1. Operator can log in and reach the listings dashboard
 *   2. Operator can open the page-builder and save changes
 *
 * Set TEST_OPERATOR_EMAIL / TEST_OPERATOR_PASSWORD env vars for a real tenant account,
 * or point the app at a seeded test project.
 *
 * Run with:
 *   npx playwright test e2e/operator-flows.spec.ts --project=chromium
 */
import { test, expect, Page } from '@playwright/test'

const EMAIL = process.env.TEST_OPERATOR_EMAIL ?? 'demo@demo.com'
const PASSWORD = process.env.TEST_OPERATOR_PASSWORD ?? 'demo1234'

// ── shared login helper ───────────────────────────────────────────────────────

async function loginAsOperator(page: Page) {
  await page.goto('/login')
  // Wait for the form to appear (handles SSR / hydration)
  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 15_000 })
  await page.fill('input[type="email"], input[name="email"]', EMAIL)
  await page.fill('input[type="password"], input[name="password"]', PASSWORD)
  await page.click('button[type="submit"]')
  // After successful login the app redirects to dashboard
  await page.waitForURL(/dashboard/, { timeout: 20_000 })
}

// ── Flow 1: Operator dashboard ────────────────────────────────────────────────

test.describe('Operator: Dashboard', () => {
  test('can log in and see listings dashboard', async ({ page }) => {
    await loginAsOperator(page)

    // Verify we are on the dashboard
    await expect(page).toHaveURL(/dashboard/)

    // Navigation sidebar should be visible
    const nav = page.locator('nav, [data-testid="sidebar"], aside').first()
    await expect(nav).toBeVisible({ timeout: 10_000 })
  })

  test('can navigate to listings page', async ({ page }) => {
    await loginAsOperator(page)
    // Find listings link in nav
    const listingsLink = page.locator('a[href*="listings"]').first()
    await expect(listingsLink).toBeVisible({ timeout: 10_000 })
    await listingsLink.click()
    await expect(page).toHaveURL(/listings/)
  })

  test('listings page shows add-listing button', async ({ page }) => {
    await loginAsOperator(page)
    await page.goto('/dashboard/listings')
    // Either an "إضافة" or "Add" button should exist
    const addBtn = page.locator('button').filter({ hasText: /إضافة|add listing/i }).first()
    await expect(addBtn).toBeVisible({ timeout: 10_000 })
  })
})

// ── Flow 2: Page-builder ──────────────────────────────────────────────────────

test.describe('Operator: Page-builder', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOperator(page)
  })

  test('can open page-builder page', async ({ page }) => {
    await page.goto('/dashboard/page-builder')
    // The page title or a section heading should appear
    const heading = page.locator('h1, h2').filter({ hasText: /page.builder|بناء الصفحة|بيانات الوكالة/i }).first()
    await expect(heading).toBeVisible({ timeout: 15_000 })
  })

  test('save button is present and clickable', async ({ page }) => {
    await page.goto('/dashboard/page-builder')
    // Wait for hydration — the save button text in Arabic or English
    const saveBtn = page.locator('button').filter({ hasText: /حفظ الآن|save now|حفظ/i }).first()
    await expect(saveBtn).toBeVisible({ timeout: 15_000 })
    await expect(saveBtn).toBeEnabled()
  })

  test('agency name field accepts input', async ({ page }) => {
    await page.goto('/dashboard/page-builder')
    // Find the agency name input (labelled "اسم الوكالة" or similar)
    const nameInput = page.locator('input[placeholder*="agency"], input[placeholder*="وكالة"], input[id*="name"]').first()
    await expect(nameInput).toBeVisible({ timeout: 15_000 })
    await nameInput.fill('Test Agency Name')
    await expect(nameInput).toHaveValue('Test Agency Name')
  })
})
