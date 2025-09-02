import { $ } from 'bun'
import { Engine } from '../../src/engine'
/**
 * Compiles publicodes YAML to JSON using the publicodes compiler
 * @param yaml The publicodes YAML string to compile
 * @returns The compiled JSON object
 */
export async function compilePublicodes(yaml: string): Promise<any> {
  // First, test if publicodes is installed
  // const isInstalled =
  //   await $`if hash publicodes 2>/dev/null; then echo "true" else echo "false" fi;`.json()
  // if (!isInstalled) {
  //   throw new Error('publicodes compiler is not installed')
  // }

  try {
    const { stdout, stderr } =
      await $`publicodes compile --default-to-public -o -  < ${Buffer.from(yaml)}  `.quiet()
    console.warn(stderr.toString())
    return JSON.parse(stdout.toString())
  } catch (error) {
    if (error instanceof Error && 'exitCode' in error) {
      // Shell error with exit code
      const shellError = error as any
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
  ...values: any[]
): Promise<Engine<any>> {
  const yaml = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] ?? '')
  }, '')
  const rules = await compilePublicodes(dedent(yaml))
  return new Engine(rules)
}

function dedent(string: string) {
  const lines = string.split('\n')
  const minIndent = lines
    .filter((line) => line.trim())
    .reduce((min, line) => {
      const indent = line.match(/^(\s*)/)[1].length
      return Math.min(min, indent)
    }, Infinity)

  return lines.map((line) => line.slice(minIndent)).join('\n')
}
