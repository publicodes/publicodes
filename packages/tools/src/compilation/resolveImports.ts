import Engine, { Logger, Rule, RuleNode, utils } from 'publicodes'
import {
	RuleName,
	getAllRefsInNode,
	RawRules,
	ImportMacro,
	RuleImportWithOverridenAttrs,
	IMPORT_KEYWORD,
	getDoubleDefError,
	DEFAULT_BUILD_DIR,
} from '../commons'
import { existsSync, readFileSync } from 'fs'
import { dirname, join, basename } from 'path'

/**
 * @param {string} packageName - The package name.
 *
 * @returns {string} The path to the package model in the node_modules folder.
 *
 * @note It tries to find the model in the `publicodes-build` folder first otherwise it looks for the model at the root of the package.
 */
function getPackageModelPath(packageName: string): string {
	if (packageName.startsWith('@')) {
		const [scope, name] = packageName.split('/')
		const publicodesBuildPath = `./node_modules/${scope}/${name}/${DEFAULT_BUILD_DIR}/${name}.model.json`
		return existsSync(publicodesBuildPath) ? publicodesBuildPath : (
				`./node_modules/${scope}/${name}/${name}.model.json`
			)
	}
	const publicodesBuildPath = `./node_modules/${packageName}/${DEFAULT_BUILD_DIR}/${packageName}.model.json`
	return existsSync(publicodesBuildPath) ? publicodesBuildPath : (
			`./node_modules/${packageName}/${packageName}.model.json`
		)
}

// Stores engines initialized with the rules from package
const enginesCache: Record<string, Engine> = {}

/**
 * Returns an instance of the publicodes engine initialized with the rules from the given file.
 *
 * @param filePath - The path to the file containing the rules in a JSON format.
 * @param opts - Options.
 *
 * @throws {Error} If the package is not found.
 * @throws {Error} If the package name is missing in the macro.
 */
function getEngine(
	filePath: string,
	{ depuis }: ImportMacro,
	logger: Logger,
	verbose: boolean,
): Engine {
	const packageName = depuis?.nom
	const fileDirPath = dirname(filePath)

	if (packageName === undefined) {
		throw new Error(
			`[ Erreur dans la macro 'importer!' ]
Le nom du package est manquant dans la macro 'importer!' dans le fichier: ${basename(filePath)}.

[ Solution ]
Ajoutez le nom du package dans la macro 'importer!'.

[ Exemple ]
importer!:
  depuis:
    nom: package-name
  les règles:
    - ruleA
    - ruleB
    ...
`,
		)
	}

	const modelPath =
		depuis.source !== undefined ?
			join(fileDirPath, depuis.source)
		:	getPackageModelPath(packageName)

	if (!enginesCache[modelPath]) {
		try {
			const model = JSON.parse(readFileSync(modelPath, 'utf-8'))
			const engine = new Engine(model, {
				logger: {
					log: (_) => {},
					warn: (_) => {},
					error: (s) => logger.error(s),
				},
			})

			if (verbose) {
				logger.log(`📦 ${packageName} loaded`)
			}
			enginesCache[modelPath] = engine
		} catch (e) {
			throw new Error(`[ Erreur dans la macro 'importer!' ]
Le package '${packageName}' n'a pas pu être trouvé. (Le fichier '${modelPath}' est introuvable).

[ Solution ]
- Assurez-vous que le package existe et qu'il est correctement installé dans vos 'node_modules'.
- Assurez-vous que le fichier '${packageName}.model.json' existe à la racine du package. Sinon,
précisez le chemin du fichier dans la macro 'importer!' grâce à l'attribut 'source'.

[ Exemple ]
importer!:
  depuis:
    nom: package-name
    source: ../custom-package/path/package-name.model.json
      `)
		}
	}

	return enginesCache[modelPath]
}

function getDependencies(
	engine: Engine,
	rule: RuleNode,
	acc: [string, Rule][] = [],
): [string, Rule][] {
	const refsIn = getAllRefsInNode({
		...rule,
		// Remove the parents as it is not needed to get the dependencies of.
		explanation: { ...rule.explanation, parents: [] },
	})

	const deps = Array.from(refsIn ?? []).filter((depRuleName) => {
		return (
			!depRuleName.endsWith('$SITUATION') &&
			!acc.find(([accRuleName, _]) => accRuleName === depRuleName)
		)
	})

	if (deps.length === 0) {
		return acc
	}

	// FIXME:
	// @ts-ignore
	acc.push(...deps.map((depName) => [depName, engine.getRule(depName).rawNode]))
	deps.forEach((depName) => {
		acc = getDependencies(engine, engine.getRule(depName), acc)
	})

	return acc
}

type RuleToImport = {
	ruleName: RuleName
	attrs: object
}

/**
 * Returns the rule name and its attributes.
 *
 * @param ruleToImport - An item of the `les règles` array
 * @returns The rule name and its attributes ([string, object][])
 *
 * For example, for the following `importer!` rule:
 *
 * ```
 * importer!:
 *	 depuis:
 *	 	nom: 'package-name'
 *	 les règles:
 *			- ruleA
 *			- ruleB:
 *			  attr1: value1
 * ```
 *
 * We have:
 * - getRuleToImportInfos('ruleA')
 *   -> { ruleName: 'ruleA', attrs: {} }
 * - getRuleToImportInfos({'ruleB': null, attr1: value1})
 *   -> { ruleName: 'ruleB', attrs: {attr1: value1} }
 */
function getRuleToImportInfos(
	ruleToImport: RuleName | RuleImportWithOverridenAttrs,
): RuleToImport {
	if (typeof ruleToImport == 'object') {
		const ruleName = Object.keys(ruleToImport)[0]
		return { ruleName, attrs: ruleToImport[ruleName] }
	}
	return { ruleName: ruleToImport, attrs: {} }
}

function addSourceModelInfomation(
	importInfos: ImportMacro,
	importedRule: Rule,
): Rule {
	const { nom, url } = importInfos.depuis
	const linkToSourceModel =
		url ?
			`> ℹ️ Cette règle provient du modèle [\`${nom}\`](${url}).`
		:	`> ℹ️ Cette règle provient du modèle \`${nom}\`.`

	return {
		...importedRule,
		description:
			importedRule.description ?
				`
${linkToSourceModel}


${importedRule.description}`
			:	linkToSourceModel,
	}
}

function appearsMoreThanOnce(
	rulesToImport: RuleToImport[],
	ruleName: RuleName,
): boolean {
	return (
		rulesToImport.filter(({ ruleName: name }) => name === ruleName).length > 1
	)
}

function accFind(
	acc: [string, Rule][],
	ruleName: RuleName,
): [string, Rule] | undefined {
	return acc.find(([accRuleName, _]) => accRuleName === ruleName)
}

function getNamespace({ dans, depuis: { nom } }: ImportMacro): string {
	if (dans) {
		return dans
	}
	return nom.startsWith('@') ? nom.split('/')[1] : nom
}

/**
 * Resolves the `importer!` macro inside a publicode file if any.
 *
 * @param filePath - The path of the publicode file.
 * @param rules - The rules of the publicode file.
 * @param verbose - If true, logs the imported packages.
 *
 * @returns The rules of the publicode file with the imported rules.
 *
 * @throws {Error} If the rule to import does not exist.
 * @throws {Error} If there is double definition of a rule.
 * @throws {Error} If the imported rule's publicode raw node "nom" attribute is different from the resolveImport script ruleName.
 */
export function resolveImports(
	filePath: string,
	rules: RawRules,
	logger: Logger,
	verbose = false,
): { completeRules: RawRules; neededNamespaces: Set<string> } {
	const neededNamespaces = new Set<string>()
	const resolvedRules = Object.entries(rules).reduce(
		(acc, [name, value]) => {
			if (name === IMPORT_KEYWORD) {
				const importMacro = value as ImportMacro
				const engine = getEngine(filePath, importMacro, logger, verbose)
				const rulesToImport: RuleToImport[] =
					importMacro['les règles']?.map(getRuleToImportInfos)
				const namespace = getNamespace(importMacro)

				neededNamespaces.add(namespace)
				rulesToImport?.forEach(({ ruleName, attrs }) => {
					if (appearsMoreThanOnce(rulesToImport, ruleName)) {
						throw new Error(
							`[ Erreur dans la macro 'importer!' ]
La règle '${ruleName}' est définie deux fois dans ${importMacro.depuis.nom}

[ Solution ]
Supprimez une des deux définitions de la règle '${ruleName}' dans la macro 'importer!'`,
						)
					}
					if (accFind(acc, ruleName)) {
						return acc
					}

					try {
						const rule = engine.getRule(ruleName)
						const getUpdatedRule = (
							ruleName: RuleName,
							rule: Rule,
						): [string, Rule] => {
							const ruleWithUpdatedDescription = addSourceModelInfomation(
								importMacro,
								rule,
							)
							// Rules defined in a [avec] mechanism are already resolved in the
							// engine (as we use [getRule]) so we don't want to duplicate them.
							if (ruleWithUpdatedDescription['avec'] !== undefined) {
								delete ruleWithUpdatedDescription['avec']
							}

							utils
								.ruleParents(ruleName)
								.forEach((rule) =>
									neededNamespaces.add(`${namespace} . ${rule}`),
								)
							return [`${namespace} . ${ruleName}`, ruleWithUpdatedDescription]
						}

						const ruleWithOverridenAttributes = { ...rule.rawNode, ...attrs }

						acc.push(getUpdatedRule(ruleName, ruleWithOverridenAttributes))
						const ruleDeps = getDependencies(engine, rule)
							.filter(([ruleDepName, _]) => {
								// Avoid to overwrite the updatedRawNode
								return (
									!accFind(acc, ruleDepName) &&
									// The dependency is part of the rule to import so we don't want
									// to handle it now
									!rulesToImport.find(({ ruleName: ruleToImportName }) => {
										const theDepIsARuleToImport =
											ruleName !== ruleToImportName &&
											ruleToImportName === ruleDepName
										return theDepIsARuleToImport
									})
								)
							})
							.map(([ruleName, ruleNode]) => {
								return getUpdatedRule(ruleName, ruleNode)
							})
						// FIXME:
						// @ts-ignore
						acc.push(...ruleDeps)
					} catch (e) {
						throw new Error(`[ Erreur dans la macro 'importer!' ]
La règle '${ruleName}' n'existe pas dans '${importMacro.depuis.nom}'.

[ Solution ]
- Vérifiez que le nom de la règle est correct.
- Assurez-vous que la règle '${ruleName}' existe dans '${importMacro.depuis.nom}'.`)
					}
				})
			} else {
				const doubleDefinition = accFind(acc, name)
				if (doubleDefinition) {
					throw getDoubleDefError(filePath, name, doubleDefinition[1], value)
				}
				acc.push([name, value as Rule])
			}
			return acc
		},
		[] as Array<[string, Rule]>,
	)
	return { completeRules: Object.fromEntries(resolvedRules), neededNamespaces }
}
