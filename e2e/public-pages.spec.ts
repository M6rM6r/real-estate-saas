import { test, expect } from '@playwright/test'

test.describe('Public Pages', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Real Estate SaaS/)
  })

  test('should navigate to agency page', async ({ page }) => {
    // This test assumes there's a way to navigate to an agency page
    // You might need to adjust this based on your actual routing
    await page.goto('/agency/demo') // Adjust this URL as needed
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should display property listings', async ({ page }) => {
    await page.goto('/agency/demo') // Adjust this URL as needed

    // Wait for listings to load
    await page.waitForSelector('[data-testid="property-listing"]', { timeout: 10000 })

    // Check that at least one listing is displayed
    const listings = page.locator('[data-testid="property-listing"]')
    await expect(listings.first()).toBeVisible()
  })

  test('should open contact modal', async ({ page }) => {
    await page.goto('/agency/demo') // Adjust this URL as needed

    // Click on a contact button (adjust selector as needed)
    await page.click('[data-testid="contact-button"]')

    // Check that modal opens
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })
})