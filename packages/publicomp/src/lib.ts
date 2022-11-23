import glob from 'glob'
import { readFileSync } from 'fs'
import yaml from 'yaml'

function readYAML(path: string): object {
	return yaml.parse(readFileSync(path, 'utf-8'))
}

export function rulesToJSON(sourcePath: string, ignore?: string[]): string {
	const files = glob.sync(sourcePath, {
		ignore,
	})
	const errors = []

	const baseRules = files.reduce((acc: object, filename: string) => {
		try {
			const rules = readYAML(filename)
			return { ...acc, ...rules }
		} catch (err) {
			errors.push(err)
			console.log(
				' ❌ Une erreur est survenue lors de la lecture du fichier',
				filename,
				':\n\n',
				err.message
			)
		}
	}, {})

	return JSON.stringify(baseRules)
}
