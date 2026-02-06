/* eslint-disable no-console */
import { $ } from 'bun'
import { Value } from '../../src/evaluate'

export async function compilePublicodesToJS(
	yaml: string,
): Promise<PublicodeExport> {
	try {
		const { stdout, stderr } =
			await $`bunx publicodes2 compile -i --default-to-public -o -  < ${Buffer.from(yaml)}`.quiet()

		if (stderr.toString()) {
			console.warn(stderr.toString())
		}
		// console.log(stdout.toString())
		return eval(
			stdout.toString().replace('export default ', ''),
		) as PublicodeExport // eslint-disable-line no-eval
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

type PublicodeExport = Record<
	string,
	{
		evaluate: (c?: Record<string, Value | Date>) => Value | Date
		evaluateParams: (c?: Record<string, Value | Date>) => {
			value: Value | Date
			missing: string[]
			needed: string[]
		}
		title: string
		description?: string
		note?: string
		meta: Record<string, unknown>
		type: string
		unit: string
	}
>

// A tag function that compiles publicodes YAML to JSON using the publicodes compiler.
// Nammed "yaml" so that prettier will pick it and format the template string as such.
export async function yaml(
	strings: TemplateStringsArray,
	...values: Array<{ toString(): string }>
): Promise<PublicodeExport> {
	const yaml = strings.reduce((acc, str, i) => {
		return acc + str + (i < values.length ? String(values[i]) : '')
	}, '')

	return compilePublicodesToJS(dedent(yaml))
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
