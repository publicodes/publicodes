import { CLIExecutor, runInDir } from '../cli-utils'
import { describe, expect } from 'vitest'

describe('publicodes --help', () => {
	test('should list all available commands', async () => {
		const cli = new CLIExecutor()

		await runInDir('tmp', async () => {
			const { stdout } = await cli.execCommand('--help')
			expect(stdout).toContain('init')
			expect(stdout).toContain('compile')
		})
	}, 10000)
})
