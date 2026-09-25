#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs/promises'
import yaml, { Scalar, YAMLMap, YAMLOMap, isMap } from 'yaml'

// Authorized keys that should not be moved to the `meta` object
const authorizedKeys = [
	'description',
	'titre',
	'public',
	'meta',
	'note',
	'plancher',
	'arrondi au supérieur',
	'plafond',
	'unité',
	"arrondi à l'inférieur",
	'non applicable si',
	'type',
	'arrondi',
	'contexte',
	'par défaut',
	'applicable si',
	'une de ces conditions',
	'variations',
	'produit',
	'somme',
	'le minimum de',
	'le maximum de',
	'est applicable',
	'valeur',
	'toutes ces conditions',
	'est non applicable',
	'remplace',
	'avec',
	'rend non applicable',
	'barème',
	'grille',
	'inversion numérique',
	'moyenne',
	'est défini',
	'est applicable',
	'est non applicable',
	'est non défini',
	'taux progressif',
	'durée',
	'texte',
	'résoudre la référence circulaire',
	'une possibilité',
	'privé',
	'logarithme',
]

// Get files from command line arguments
const yamlFiles = process.argv.slice(2)

for (const yamlFile of yamlFiles) {
	// Read YAML file
	console.log('Processing file', yamlFile)
	const yamlInput = await fs.readFile(yamlFile, 'utf8')
	// Load YAML input
	const doc = yaml.parseDocument(yamlInput, { keepSourceTokens: true })
	// Apply modifications
	removeDoubleQuotes(doc)
	renameFormuleToValeur(doc)
	moveNonAuthorizedKeysToMeta(doc)
	// Convert modified data back to YAML
	const yamlOutput = yaml.stringify(doc, { keepSourceTokens: true })
	// Write YAML output
	await fs.writeFile(yamlFile, yamlOutput)
}

console.log(
	"All done! Don't forget to update the version number of publicodes packages in package.json",
)

/**
 * Removes unnecessary double quotes from string values.
 * Transforms "'xxx'" to "xxx" and '"yyy"' to 'yyy'
 */
function removeDoubleQuotes(doc: yaml.Document) {
	yaml.visit(doc, {
		Scalar(_, node) {
			const value = node.value
			if (
				typeof value === 'string' &&
				value.length >= 2 &&
				node.type !== 'PLAIN'
			) {
				const firstChar = value[0]
				const lastChar = value[value.length - 1]
				if (
					(firstChar === "'" && lastChar === "'") ||
					(firstChar === '"' && lastChar === '"')
				) {
					node.value = value.slice(1, -1)
				}
			}
		},
	})
}

/**
 * Renames 'formule' fields to 'valeur'
 */
function renameFormuleToValeur(doc: yaml.Document) {
	yaml.visit(doc, {
		Map(_, map) {
			if (isMap(map)) {
				const formuleItem = map.items.find(
					(item) => (item.key as Scalar).value === 'formule',
				)
				if (formuleItem) {
					// Create new key node
					const valeurKey = new Scalar('valeur')
					// Add the new key-value pair
					map.add({ key: valeurKey, value: formuleItem.value })
					// Remove the old key-value pair
					map.delete('formule')
				}
			}
		},
	})
}

/**
 * Moves non-authorized keys to a `meta` object.
 * Works recursively with rules defined with `avec` keyword.
 */
function moveNonAuthorizedKeysToMeta(doc: yaml.Document) {
	// Process top-level rules first
	if (isMap(doc.contents)) {
		doc.contents.items.forEach((item) => {
			if (isMap(item.value)) {
				processRuleMap(item.value)
			}
		})
	}
}

/**
 * Processes a rule map and moves non-authorized keys to meta
 */
function processRuleMap(map: YAMLOMap) {
	if (!isMap(map)) {
		return
	}

	const keysToMove: { key: Scalar; value: unknown }[] = []
	let existingMeta: YAMLMap | null = null

	// Collect keys that need to be moved
	map.items.forEach((item) => {
		const key = item.key as Scalar
		if (typeof key.value === 'string') {
			if (key.value === 'meta') {
				existingMeta = item.value as YAMLMap
			} else if (!authorizedKeys.includes(key.value)) {
				keysToMove.push({
					key: key,
					value: item.value,
				})
			}
		}
	})

	// If there are keys to move, create or update the meta object
	if (keysToMove.length > 0) {
		const metaMap =
			existingMeta && isMap(existingMeta) ? existingMeta : new YAMLMap()

		// Move the keys to meta
		keysToMove.forEach(({ key, value }) => {
			metaMap.add({ key: key.clone(), value: value })
			// Remove from original map
			map.delete(key.value)
		})

		// Add or update the meta key
		if (existingMeta) {
			// Meta already exists, it should now have the new keys
		} else {
			// Add new meta key
			map.add({ key: new Scalar('meta'), value: metaMap })
		}
	}

	// Process nested rules in 'avec' recursively
	const avecValue = map.get('avec')
	if (avecValue && isMap(avecValue)) {
		avecValue.items.forEach((item) => {
			if (isMap(item.value)) {
				processRuleMap(item.value)
			}
		})
	}
}
