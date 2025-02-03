// @ts-check
import { defineConfig } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = defineConfig({
	testDir: './tests',
	timeout: 30 * 1000,
	expect: {
		timeout: 5000,
	},
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		actionTimeout: 0,
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry',
	},
	webServer: {
		command: 'yarn dev',
		url: 'http://localhost:5173',
	},
})

export default config
