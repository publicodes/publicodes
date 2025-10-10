/* eslint-disable no-console */
import { $, env } from 'bun'
import { PublicodesEngine } from '../../src'
import type { Publicodes, Outputs } from '../../src'

/**
 * Compiles publicodes YAML to JSON using the publicodes compiler
 * @param yaml The publicodes YAML string to compile
 * @returns The compiled JSON object
 */

export async function compilePublicodesToJSON(
	yaml: string,
): Promise<Publicodes<Outputs>> {
	try {
		const { stdout, stderr } =
			await $`bunx publicodes2 compile -i --default-to-public -o -  < ${Buffer.from(yaml)}`.quiet()

		if (stderr.toString()) {
			console.warn(stderr.toString())
		}

		return JSON.parse(stdout.toString()) as Publicodes<Outputs>
	} catch (error) {
		if (error instanceof Error && 'exitCode' in error) {
			// Shell error with exit code
			const shellError = error as {
				exitCode: number
				stdout?: Buffer
				stderr?: Buffer
			}
			throw new Error(
				`Compilation failed with exit code ${shellError.exitCode}:\n` +
					`stdout: ${shellError.stdout?.toString() || ''}\n` +
					`stderr: ${shellError.stderr?.toString() || ''}`,
			)
		}
		throw error
	}
}

export async function compilePublicodesToJS(yaml: string): Promise<any> {
	try {
		const { stdout, stderr } =
			await $`bunx publicodes2 compile -i --default-to-public -t js -o -  < ${Buffer.from(yaml)}`.quiet()

		if (stderr.toString()) {
			console.warn(stderr.toString())
		}

		return eval(
			stdout.toString().replace('export default ', '') + '\nnew Engine',
		) // eslint-disable-line no-eval
	} catch (error) {
		if (error instanceof Error && 'exitCode' in error) {
			// Shell error with exit code
			const shellError = error as {
				exitCode: number
				stdout?: Buffer
				stderr?: Buffer
			}
			throw new Error(
				`Compilation failed with exit code ${shellError.exitCode}:\n` +
					`stdout: ${shellError.stdout?.toString() || ''}\n` +
					`stderr: ${shellError.stderr?.toString() || ''}`,
			)
		}
		throw error
	}
}

// A tag function that compiles publicodes YAML to JSON using the publicodes compiler.
// Nammed "yaml" so that prettier will pick it and format the template string as such.
export async function yaml(
	strings: TemplateStringsArray,
	...values: Array<{ toString(): string }>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<PublicodesEngine<any>> {
	const yaml = strings.reduce((acc, str, i) => {
		return acc + str + (i < values.length ? String(values[i]) : '')
	}, '')
	if (env.OUTPUT_TYPE === 'js') {
		return compilePublicodesToJS(dedent(yaml))
	} else {
		const rules = await compilePublicodesToJSON(dedent(yaml))
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return new PublicodesEngine(rules as Publicodes<any>)
	}
}

export type TestPublicodes = Awaited<ReturnType<typeof yaml>>

function dedent(string: string) {
	const lines = string.split('\n')
	const minIndent = lines
		.filter((line) => line.trim())
		.reduce((min, line) => {
			const match = line.match(/^(\s*)/)
			const indent = match ? match[1].length : 0
			return Math.min(min, indent)
		}, Infinity)

	return lines.map((line) => line.slice(minIndent)).join('\n')
}
