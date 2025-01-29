import fs from 'fs'
import path from 'path'
import { describe, it, expect } from 'vitest'
import { CLIExecutor, runInDir } from '../cli-utils'

const cli = new CLIExecutor()

describe('publicodes compile', () => {
	it('should compile with no arguments/flags', async () => {
		await runInDir('tmp', async (cwd) => {
			const { stdout } = await cli.execCommand('compile')
			expect(stdout).toContain('Compilation done.')
			expect(fs.existsSync('publicodes-build')).toBe(true)
			expect(fs.existsSync('publicodes-build/index.js')).toBe(true)
			expect(
				fs.existsSync(`publicodes-build/${path.basename(cwd)}.model.json`),
			).toBe(true)
			expect(fs.existsSync(`publicodes-build/index.d.ts`)).toBe(true)
		})
	})
})
