import fs from 'fs'
import path from 'path'
import { describe, it, expect } from 'bun:test'
import { CLIExecutor, runInDir } from '../cli-utils'
import { DEFAULT_BUILD_DIR } from '../../src'

const cli = new CLIExecutor()

describe('publicodes compile', () => {
	it(
		'should compile with no arguments/flags',
		async () => {
			await runInDir('tmp', async (cwd) => {
				const { stdout } = await cli.execCommand('compile')
				expect(stdout).toContain('Compilation done.')
				expect(fs.existsSync(DEFAULT_BUILD_DIR)).toBe(true)
				expect(fs.existsSync(`${DEFAULT_BUILD_DIR}/index.js`)).toBe(true)
				expect(
					fs.existsSync(
						`${DEFAULT_BUILD_DIR}/${path.basename(cwd)}.model.json`,
					),
				).toBe(true)
				expect(fs.existsSync(`${DEFAULT_BUILD_DIR}/index.d.ts`)).toBe(true)
			})
		},
		{
			timeout: 10000,
		},
	)
})
