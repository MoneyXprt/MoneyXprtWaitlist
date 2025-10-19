import { test, expect } from '@playwright/test'

test('load intake, fill basics, run', async ({ page }) => {
  await page.goto('/intake')

  await page.getByLabel('W-2 wages (YTD)').fill('120000')
  await page.getByLabel('Business income').fill('50000')
  await page.getByLabel('Real estate net').fill('0')

  await page.getByRole('button', { name: /get strategies|ask the ai strategist/i }).click()

  // Expect either the loading state or results to appear
  await expect(
    page.locator('text=Analyzing…').or(page.locator('.animate-pulse')).or(page.locator('pre'))
  ).toBeVisible({ timeout: 15000 })
})

