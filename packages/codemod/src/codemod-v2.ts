#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs/promises'
import { extname, join, relative, sep } from 'node:path'
import process from 'node:process'
import yaml, {
	Scalar,
	YAMLMap,
	YAMLOMap,
	YAMLSeq,
	isMap,
	isNode,
	isScalar,
	isSeq,
} from 'yaml'

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
	'privé',
	'logarithme',
]

const publicodesExtension = '.publicodes'

const replacementKeys = ['remplace', 'rend non applicable']

// Explains why replacements now need `exclusif: oui` or a chain
const replacementBlogUrl =
	'https://next.publi.codes/blog/v2-amelioration-remplacements/'

const usage = `Usage: @publicodes/codemod [options] <path>...

  <path> can be a directory (walked recursively) or a file to process

Options:
  -f, --flatten  Move the files contained in the sub-directories of each
                 directory to its root, prefixing their name with the
                 sub-directory path (one/rules.publicodes -> one.rules.publicodes)
  -h, --help     Show this help`

async function findPublicodesFiles(directory: string): Promise<string[]> {
	const entries = await fs.readdir(directory, { withFileTypes: true })
	entries.sort((a, b) => a.name.localeCompare(b.name))
	const files: string[] = []
	for (const entry of entries) {
		const path = join(directory, entry.name)
		if (entry.isDirectory()) {
			files.push(...(await findPublicodesFiles(path)))
		} else if (entry.isFile() && extname(entry.name) === publicodesExtension) {
			files.push(path)
		}
	}
	return files
}

/**
 * Computes the moves needed to flatten `directory`: every file contained in
 * one of its sub-directories is moved to the root, its name being prefixed
 * with the relative path of its directory, separated by dots.
 */
function flattenMoves(
	directory: string,
	files: string[],
): { from: string; to: string }[] {
	return files.flatMap((file) => {
		const relativePath = relative(directory, file)
		if (!relativePath.includes(sep)) {
			return []
		}
		return [
			{
				from: file,
				to: join(directory, relativePath.split(sep).join('.')),
			},
		]
	})
}

/**
 * Recursively removes the empty sub-directories of `directory`, then returns
 * whether `directory` itself is empty. It is left untouched.
 */
async function removeEmptySubdirectories(directory: string): Promise<boolean> {
	let isEmpty = true
	for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
		if (!entry.isDirectory()) {
			isEmpty = false
			continue
		}
		const path = join(directory, entry.name)
		if (await removeEmptySubdirectories(path)) {
			await fs.rmdir(path)
		} else {
			isEmpty = false
		}
	}
	return isEmpty
}

const targets: string[] = []
let flatten = false

for (const arg of process.argv.slice(2)) {
	if (arg === '-h' || arg === '--help') {
		console.log(usage)
		process.exit(0)
	} else if (arg === '-f' || arg === '--flatten') {
		flatten = true
	} else if (arg.startsWith('-') && arg !== '-') {
		console.error(`Codemod: unknown option: ${arg}`)
		console.error(usage)
		process.exit(1)
	} else {
		targets.push(arg)
	}
}

if (targets.length === 0) {
	console.error(usage)
	process.exit(1)
}

const yamlFiles: string[] = []
const moves: { from: string; to: string }[] = []
const flattenedDirectories: string[] = []
let failed = false
let flattenConflict = false

for (const target of targets) {
	const stats = await fs.stat(target).catch(() => null)
	if (stats === null) {
		console.error(`Codemod: no such file or directory: ${target}`)
		failed = true
	} else if (stats.isDirectory()) {
		const files = await findPublicodesFiles(target)
		yamlFiles.push(...files)
		if (flatten) {
			moves.push(...flattenMoves(target, files))
			flattenedDirectories.push(target)
		}
	} else if (stats.isFile()) {
		yamlFiles.push(target)
	}
}

if (yamlFiles.length === 0) {
	console.error('Codemod: no file to process')
	process.exit(1)
}

// Deduplicate and check the moves before touching any file, so that a conflict
// never leaves the files half-processed and half-moved.
const destinationBySource = new Map<string, string>()
const sourceByDestination = new Map<string, string>()
const checkedMoves: { from: string; to: string }[] = []

for (const { from, to } of moves) {
	const knownDestination = destinationBySource.get(from)
	if (knownDestination !== undefined) {
		if (knownDestination === to) {
			// Same file reached twice through duplicated or nested targets
			continue
		}
		console.error(
			`Codemod: cannot flatten: ${from} would be moved to both ${knownDestination} and ${to} (overlapping target directories)`,
		)
		flattenConflict = true
		continue
	}

	const otherSource = sourceByDestination.get(to)
	if (otherSource !== undefined) {
		console.error(
			`Codemod: cannot flatten: ${otherSource} and ${from} would both be moved to ${to}`,
		)
		flattenConflict = true
		continue
	}

	destinationBySource.set(from, to)
	sourceByDestination.set(to, from)
	checkedMoves.push({ from, to })

	if ((await fs.stat(to).catch(() => null)) !== null) {
		console.error(`Codemod: cannot flatten: ${to} already exists`)
		flattenConflict = true
	}
}

if (flattenConflict) {
	process.exit(1)
}

console.log(`Codemod: processing ${yamlFiles.length} file(s)`)

for (const yamlFile of yamlFiles) {
	// Read YAML file
	console.log('Processing file', yamlFile)
	const yamlInput = await fs.readFile(yamlFile, 'utf8')
	// Load YAML input
	const doc = yaml.parseDocument(yamlInput, {
		keepSourceTokens: true,
	})
	// Apply modifications
	renameFormuleToValeur(doc)
	splitReplaceReferences(doc)
	handleReplacementPriorities(doc, yamlFile)
	removeDoubleQuotes(doc)
	processPossibilitesToEnum(doc)
	moveNonAuthorizedKeysToMeta(doc)
	// Convert modified data back to YAML
	const yamlOutput = yaml.stringify(doc, {
		keepSourceTokens: true,
	})
	// Write YAML output
	await fs.writeFile(yamlFile, yamlOutput)
}

for (const { from, to } of checkedMoves) {
	console.log(`Moving file ${from} to ${to}`)
	await fs.rename(from, to)
}

for (const directory of flattenedDirectories) {
	await removeEmptySubdirectories(directory)
}

console.log(
	"All done! Don't forget to update the version number of publicodes packages in package.json",
)

if (failed) {
	process.exit(1)
}

/**
 * Removes unnecessary double quotes from string values.
 * Transforms "'xxx'" to "xxx" and '"yyy"' to 'yyy'
 */
function removeDoubleQuotes(doc: yaml.Document) {
	yaml.visit(doc, {
		Scalar(_, node) {
			const value = node.value
			if (typeof value !== 'string') {
				return
			}
			const firstChar = value[0]
			const lastChar = value[value.length - 1]
			if (
				(firstChar === "'" && lastChar === "'") ||
				(firstChar === '"' && lastChar === '"')
			) {
				node.value = value.slice(1, -1)
			}
			// change type: 'QUOTE_SINGLE' to type: DOUBLE_QUOTE and type: 'QUOTE_DOUBLE' to type: SINGLE_QUOTE
			if (node.type === 'QUOTE_SINGLE') {
				node.type = 'QUOTE_DOUBLE'
			} else if (node.type === 'QUOTE_DOUBLE') {
				node.type = 'QUOTE_SINGLE'
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

/**
 * Processes `une possibilité` fields and transforms them into enum `type`.
 */
function processPossibilitesToEnum(doc: yaml.Document) {
	yaml.visit(doc, {
		Map(_, map) {
			if (isMap(map)) {
				const unePossibiliteItem = map.items.find(
					(item) => (item.key as Scalar).value === 'une possibilité',
				)
				if (unePossibiliteItem) {
					// Create new key node
					const typeKey = new Scalar('type')
					// Add quotes to the possibilities
					if (isSeq(unePossibiliteItem.value)) {
						unePossibiliteItem.value.items.forEach((item) => {
							if (isScalar(item)) {
								item.type = 'QUOTE_SINGLE'
							}
						})
					}
					// Add the new key-value pair
					map.add({ key: typeKey, value: unePossibiliteItem })
					// Remove the old key-value pair
					map.delete('une possibilité')
				}
			}
		},
	})
}

/**
 * Splits the `remplace` and `rend non applicable` entries that reference
 * several rules, because `références à` only accepts a single rule in v2.
 *
 * Each entry is replaced by one entry per referenced rule, the other keys
 * (`dans`, `sauf dans`, `exclusif`) being duplicated.
 */
function splitReplaceReferences(doc: yaml.Document) {
	yaml.visit(doc, {
		Map(_, map) {
			if (!isMap(map)) {
				return
			}
			for (const replacementItem of map.items) {
				const key = replacementItem.key
				if (
					!isScalar(key) ||
					typeof key.value !== 'string' ||
					!replacementKeys.includes(key.value)
				) {
					continue
				}
				if (isSeq(replacementItem.value)) {
					replacementItem.value.items =
						replacementItem.value.items.flatMap(splitReferencesItem)
				} else {
					const items = splitReferencesItem(replacementItem.value)
					if (items.length > 1) {
						// `remplace:` was a single entry with a list of
						// references: it becomes a list of entries
						const seq = new YAMLSeq()
						seq.items = items
						replacementItem.value = seq
					} else {
						replacementItem.value = items[0]
					}
				}
			}
		},
	})
}

/**
 * Returns the entries replacing `item`: one per rule referenced by its
 * `références à` list, or `item` itself when it doesn't reference a list.
 */
function splitReferencesItem(item: unknown): unknown[] {
	if (!isMap(item)) {
		return [item]
	}
	const referencesItem = item.items.find(
		({ key }) => isScalar(key) && key.value === 'références à',
	)
	if (referencesItem === undefined || !isSeq(referencesItem.value)) {
		return [item]
	}
	const references = referencesItem.value.items
	if (references.length <= 1) {
		// A list of one reference is invalid in v2 too
		referencesItem.value = references[0] ?? null
		return [item]
	}
	return references.map((reference) => {
		const itemCopy = item.clone() as YAMLMap
		const referencesItemCopy = itemCopy.items.find(
			({ key }) => isScalar(key) && key.value === 'références à',
		)
		if (referencesItemCopy !== undefined) {
			referencesItemCopy.value =
				isNode(reference) ? reference.clone() : reference
		}
		return itemCopy
	})
}

/** A `remplace` or `rend non applicable` entry of a rule. */
type ReplacementEntry = {
	rule: string
	mechanism: string
	target: string
	priority: number | undefined
	map: YAMLMap | null
	scalar: Scalar | null
}

/**
 * Turns the `priorité` based replacements into the chained replacements of
 * v2, where `priorité` does not exist anymore: the entry with the highest
 * priority replaces the target rule, the next one replaces that entry's rule,
 * and so on. Chaining only happens when the order is unambiguous, i.e. when every rule replacing a given rule defines a distinct `priorité`.
 */
function handleReplacementPriorities(doc: yaml.Document, file: string) {
	const replacements = collectReplacementEntries(doc)

	for (const entry of replacements) {
		if (findMapItem(entry.map, 'priorité') !== undefined) {
			entry.map?.delete('priorité')
		}
		if (entry.mechanism !== 'remplace' && entry.priority !== undefined) {
			warn(
				file,
				`"${entry.rule}": "priorité" removed from "${entry.mechanism}" ` +
					`(unsupported), check the order — ${replacementBlogUrl}`,
			)
		}
	}

	// Rules replacing a given rule, in declaration order, before any change
	const replacersByTarget = new Map<string, string[]>()
	for (const entry of replacements) {
		if (entry.mechanism !== 'remplace') {
			continue
		}
		const replacers = replacersByTarget.get(entry.target) ?? []
		if (!replacers.includes(entry.rule)) {
			replacers.push(entry.rule)
		}
		replacersByTarget.set(entry.target, replacers)
	}

	for (const [target, replacers] of replacersByTarget) {
		const entries = replacements.filter(
			(entry) => entry.mechanism === 'remplace' && entry.target === target,
		)
		if (new Set(entries.map((entry) => entry.rule)).size !== entries.length) {
			warn(
				file,
				`"${target}" replaced twice by "${entries[0].rule}", merge the entries`,
			)
			continue
		}
		if (replacers.length < 2) {
			continue
		}

		const priorities = entries.map((entry) => entry.priority)
		const replacerList = replacers.join(', ')

		if (priorities.some((priority) => priority === undefined)) {
			warn(
				file,
				`"${target}" replaced by ${replacerList} without distinct ` +
					`"priorité" (v1 order: priority, then alphabetical): ` +
					`add "exclusif: oui" or chain manually — ${replacementBlogUrl}`,
			)
			continue
		}
		if (new Set(priorities).size !== priorities.length) {
			warn(
				file,
				`"${target}" replaced by ${replacerList} with equal priorities ` +
					`(v1 order: alphabetical): add "exclusif: oui" or chain ` +
					`manually — ${replacementBlogUrl}`,
			)
			continue
		}

		// In v1, the highest `priorité` wins when several replacements are
		// applicable. In v2, the last replacement of the chain wins, so the
		// chain goes from the lowest priority up to the highest one.
		const sorted = [...entries].sort(
			(a, b) => (a.priority ?? 0) - (b.priority ?? 0),
		)
		sorted.forEach((entry, index) => {
			if (index === 0) {
				return
			}
			const replaced = sorted[index - 1].rule
			setEntryTarget(entry, replaced)
			const others = (replacersByTarget.get(replaced) ?? []).filter(
				(rule) => rule !== entry.rule,
			)
			if (others.length > 0) {
				warn(
					file,
					`"${entry.rule}" now replaces "${replaced}", already replaced by ` +
						`${others.join(', ')}, check the chaining — ${replacementBlogUrl}`,
				)
			}
		})
		console.log(
			`Codemod: "${target}" chained (lowest to highest priority): ` +
				sorted.map((entry) => entry.rule).join(' -> '),
		)
	}
}

/** Returns the pair of `map` whose key is `key`, if any. */
function findMapItem(map: YAMLMap | null, key: string) {
	return map?.items.find(
		({ key: itemKey }) => isScalar(itemKey) && itemKey.value === key,
	)
}

/** Changes the rule replaced by `entry`. */
function setEntryTarget(entry: ReplacementEntry, target: string) {
	const referencesItem = findMapItem(entry.map, 'références à')
	if (referencesItem !== undefined) {
		referencesItem.value = new Scalar(target)
	} else if (entry.scalar !== null) {
		entry.scalar.value = target
	}
}

/** Logs a warning about the given file. */
function warn(file: string, message: string) {
	console.warn(`Codemod warning (${file}): ${message}`)
}

/** Collects the `remplace` and `rend non applicable` entries of every rule. */
function collectReplacementEntries(doc: yaml.Document): ReplacementEntry[] {
	const entries: ReplacementEntry[] = []
	if (isMap(doc.contents)) {
		collectRulesReplacements(doc.contents, '', entries)
	}
	return entries
}

/** Collects the replacements of `rules`, whose names are prefixed by `prefix`. */
function collectRulesReplacements(
	rules: YAMLMap,
	prefix: string,
	entries: ReplacementEntry[],
) {
	for (const item of rules.items) {
		if (!isScalar(item.key) || typeof item.key.value !== 'string') {
			continue
		}
		collectRuleReplacements(
			item.value,
			prefix ? `${prefix} . ${item.key.value}` : item.key.value,
			entries,
		)
	}
}

/** Collects the replacements of a rule, and of the rules nested in its `avec`. */
function collectRuleReplacements(
	rule: unknown,
	name: string,
	entries: ReplacementEntry[],
) {
	if (!isMap(rule)) {
		return
	}

	// `priorité` may also be defined next to the mechanism, in which case it
	// applies to every entry of the rule that doesn't define its own.
	const rulePriorityItem = findMapItem(rule, 'priorité')
	const rulePriority = readPriority(rulePriorityItem?.value)
	let hasReplacement = false

	for (const mechanism of replacementKeys) {
		const mechanismItem = findMapItem(rule, mechanism)
		if (mechanismItem === undefined) {
			continue
		}
		const items =
			isSeq(mechanismItem.value) ?
				mechanismItem.value.items
			:	[mechanismItem.value]
		for (const item of items) {
			const entry = parseReplacementEntry(item, name, mechanism, rulePriority)
			if (entry !== null) {
				entries.push(entry)
				hasReplacement = true
			}
		}
	}

	// `priorité` is not a rule attribute in v2: it must not be moved to `meta`
	if (hasReplacement) {
		rule.delete('priorité')
	}

	const nestedRules = findMapItem(rule, 'avec')?.value
	if (isMap(nestedRules)) {
		collectRulesReplacements(nestedRules, name, entries)
	}
}

/** Reads a `priorité` value, or `undefined` if it is not a number. */
function readPriority(value: unknown): number | undefined {
	if (!isScalar(value)) {
		return undefined
	}
	const priority = Number(value.value)
	return Number.isFinite(priority) ? priority : undefined
}

/** Reads a `remplace` / `rend non applicable` entry, or `null` if unusable. */
function parseReplacementEntry(
	item: unknown,
	rule: string,
	mechanism: string,
	rulePriority: number | undefined,
): ReplacementEntry | null {
	const entry = (target: string, priority: number | undefined) => ({
		rule,
		mechanism,
		target,
		priority: priority ?? rulePriority,
		map: isMap(item) ? item : null,
		scalar: isScalar(item) ? item : null,
	})

	if (isScalar(item)) {
		return typeof item.value === 'string' ? entry(item.value, undefined) : null
	}
	if (!isMap(item)) {
		return null
	}
	const target = findMapItem(item, 'références à')?.value
	if (!isScalar(target) || typeof target.value !== 'string') {
		return null
	}
	return entry(target.value, readPriority(findMapItem(item, 'priorité')?.value))
}
