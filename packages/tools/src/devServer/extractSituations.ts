import { readFile } from 'fs/promises'
import { sync } from 'glob'
import { RawPublicodes, Situation } from 'publicodes'
import { parse } from 'yaml'
import { normalizeSourcePaths } from '../compilation'

export type TestSituation = Record<string, Situation<string>>
/**
 * Extracts situations from a list of publicodes files.
 * @param files - An array of file paths to process
 * @returns A Promise that resolves to an array of DocSituation objects
 * @throws {Error} If file reading or parsing fails
 */
export async function extractSituations(
	files: string[],
): Promise<TestSituation> {
	const situations: TestSituation = {}

	const paths = sync(normalizeSourcePaths(files))
	for (const filePath of paths) {
		const content = parse(
			await readFile(filePath, 'utf-8'),
		) as RawPublicodes<string>
		// For each rule in the file
		for (const [ruleName, rule] of Object.entries(content)) {
			if (typeof rule === 'object' && rule !== null && 'contexte' in rule) {
				situations[ruleName] = rule.contexte as Situation<string>
			}
		}
	}

	return situations
}
