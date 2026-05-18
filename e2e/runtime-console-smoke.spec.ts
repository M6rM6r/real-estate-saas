import { test, expect } from '@playwright/test';

const routes = ['/login', '/signup', '/saudi-cars-demo', '/dashboard/page-builder'];

for (const route of routes) {
  test(`runtime smoke has no console/page errors on ${route}`, async ({ page }) => {
    const runtimeErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        runtimeErrors.push(`[console] ${msg.text()}`);
      }
    });

    page.on('pageerror', (error) => {
      runtimeErrors.push(`[pageerror] ${error.message}`);
    });

    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();

    expect(runtimeErrors, `Runtime errors found on ${route}:\n${runtimeErrors.join('\n')}`).toEqual([]);
  });
}
