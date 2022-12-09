// @ts-check
import { test, expect } from '@playwright/test'

test('page contains a publicodes value', async ({ page }) => {
	await page.goto('/')
	await expect(page.locator('#total')).toHaveText('5 potatoes')
})
