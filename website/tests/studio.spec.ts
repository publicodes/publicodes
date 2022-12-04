import { test, expect, type Page } from '@playwright/test'

test.describe('studio', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/studio')
	})

	async function typeInEditor(page: Page, text: string) {
		await page.click('.monaco-editor')
		await page.keyboard.press('Control+A')
		await page.keyboard.type(text)
	}

	test('should display warning', async ({ page }) => {
		await typeInEditor(page, 'courses: 3 carottes + 2 choux')
		const warning =
			"Dans l'expression '+', la partie gauche (unité: carottes) n'est pas compatible avec la partie droite (unité: choux)"
		await expect(page.locator(`text=${warning}`)).toBeVisible()
	})
})
