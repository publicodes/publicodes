#!/usr/bin/env node

import fs from 'fs/promises'
import yaml, { Scalar, YAMLMap, YAMLSeq, isMap, isSeq } from 'yaml'

// Get folder path from command line arguments
const folderPath = process.argv[2]

// Find all yaml files in folder and subfolders
const yamlFiles = await findYamlFiles(folderPath)

for (const yamlFile of yamlFiles) {
	// Read YAML file
	console.log('Processing file', yamlFile)
	const yamlInput = await fs.readFile(yamlFile, 'utf8')
	// Load YAML input
	const doc = yaml.parseDocument(yamlInput, { keepCstNodes: true })
	// Apply modification
	updateComposante(doc)
	codemod1(doc)
	doc.contents.items.forEach(changeNomToAvec)
	codemod3(doc)
	// Convert modified data back to YAML
	const yamlOutput = yaml.stringify(doc, { keepCstNodes: true })
	// Write YAML output
	await fs.writeFile(yamlFile, yamlOutput)
}

console.log(
	"All done! Don't forget to update the version number of publicodes packages in package.json",
)

function updateComposante(doc) {
	yaml.visit(doc, {
		Map(_, map) {
			if (map.hasIn(['produit', 'composantes'])) {
				return updateComposantes(map, 'produit')
			}
			if (map.hasIn(['barème', 'composantes'])) {
				return updateComposantes(map, 'barème')
			}
		},
	})
}

function codemod1(doc) {
	yaml.visit(doc, {
		Pair(_, pair) {
			const key = pair.key.value
			switch (key) {
				case 'produit':
					return updateProduit(pair)
				case 'unité':
					return updateUnité(pair)
				case 'inversion numérique':
					return updateInversionNumérique(pair)
			}
		},
		Map(_, map) {
			if (map.has('recalcul')) {
				return updateRecalcul(map)
			}
			if (map.has('remplace')) {
				return updateRemplace(map)
			}
			if (map.has('rend non applicable')) {
				return updateRendNonapplicable(map)
			}
		},
	})
}

function updateProduit(node) {
	if (!isMap(node.value)) {
		return
	}
	let assiette = node.value.get('assiette')
	const facteur = node.value.get('facteur')
	const taux = node.value.get('taux')
	const plafond = node.value.get('plafond')
	let seq = new YAMLSeq()
	let newAssiette = assiette
	if (plafond) {
		newAssiette = new YAMLMap()
		newAssiette.add({ key: 'valeur', value: assiette })
		newAssiette.add({ key: 'plafond', value: plafond })
	}
	seq.add(newAssiette)
	facteur && seq.add(facteur)
	taux && seq.add(taux)
	node.value = seq
	return node
}

function updateRecalcul(node) {
	const contexte = node.getIn(['recalcul', 'avec'])
	const valeur = node.getIn(['recalcul', 'règle'])
	node.delete('recalcul')
	node.add({ key: 'valeur', value: valeur })
	node.add({ key: 'contexte', value: contexte })
	return node
}

function updateUnité(node) {
	const unité = node.value
	unité.value = unité.value.replaceAll(' /', '/').replaceAll('/ ', '/')
}

function updateInversionNumérique(node) {
	const inversionNumérique = node.value
	if (!inversionNumérique.has('avec')) {
		return
	}
	node.value = inversionNumérique.get('avec')
}

function updateComposantes(node, mecanismName) {
	const sommeNode = new YAMLSeq()

	node.getIn([mecanismName, 'composantes']).items.forEach((composante) => {
		const argsNode = node.get(mecanismName).clone()
		argsNode.delete('composantes')
		const attributsNode = composante.get('attributs')
		composante.delete('attributs')
		composante.items.forEach((item) => {
			argsNode.add(item, true)
		})
		const termeNode = new YAMLMap()
		termeNode.add({ key: mecanismName, value: argsNode })
		attributsNode?.items.forEach((item) => {
			termeNode.add(item, true)
		})
		sommeNode.add(termeNode)
	})

	const newNode = node.clone()
	newNode.delete(mecanismName)
	newNode.add({ key: 'somme', value: sommeNode })
	return newNode
}

function updateRendNonapplicable(node) {
	yaml.visit(node.get('rend non applicable'), {
		Pair(_, pair) {
			if (pair.key.value === 'règle') {
				pair.key.value = 'références à'
			}
		},
	})
}
function updateRemplace(node) {
	yaml.visit(node.get('remplace'), {
		Pair(_, pair) {
			if (pair.key.value === 'règle') {
				pair.key.value = 'références à'
			}
		},
		Map(_, map) {
			if (map.has('par')) {
				const valeur = map.get('par')
				map.delete('par')
				const avec = node.get('avec') ?? new YAMLMap()
				const règle = map.get('règle')
				const dans = map.get('dans')
				const saufDans = map.get('sauf dans')

				let replacementNode = règle
				if (dans || saufDans) {
					replacementNode = new YAMLMap()
					replacementNode.add({ key: 'références à', value: règle })
					dans && replacementNode.add({ key: 'dans', value: dans })
					saufDans && replacementNode.add({ key: 'sauf dans', value: saufDans })
				}

				const replacementRuleValue = isMap(valeur) ? valeur : new YAMLMap()
				replacementRuleValue.add({
					key: new Scalar('remplace'),
					value: replacementNode,
				})
				if (!isMap(valeur)) {
					replacementRuleValue.add({ key: new Scalar('valeur'), value: valeur })
				}

				let replacementRuleName = règle.replaceAll(' . ', ' ')
				if (map.get('dans') && !isSeq(map.get('dans'))) {
					replacementRuleName += ' ' + map.get('dans').replaceAll(' . ', ' ')
				}

				avec.add({
					key: new Scalar(replacementRuleName),
					value: replacementRuleValue,
				})
				node.set('avec', avec)
				if (isMap(node.get('remplace'))) {
					node.delete('remplace')
				}
				return yaml.visit.REMOVE
			}
		},
	})
	if (node.get('remplace')?.items?.length === 0) {
		node.delete('remplace')
	}
}

function changeNomToAvec(node) {
	const value = node.value
	if (!isMap(value)) {
		return
	}
	const avec = value.get('avec') ?? new YAMLMap()
	deleteNomRecurse(value)

	function deleteNomRecurse(node, dottedName) {
		yaml.visit(node, {
			Map(_, map) {
				const nom = map.get('nom')
				if (!nom || typeof nom !== 'string') {
					return
				}
				const newDottedName =
					(dottedName ? dottedName + ' . ' : '') + map.get('nom')

				map.delete('nom')
				avec.add({ key: new Scalar(newDottedName), value: map })
				deleteNomRecurse(map, newDottedName)
				return new Scalar(nom)
			},
			Pair(_, pair) {
				if (pair.key.value === 'avec') {
					pair.value.items.forEach((item) => {
						const newDottedName =
							(dottedName ? dottedName + ' . ' : '') + item.key.value

						deleteNomRecurse(item.value, newDottedName)
					})
				}
			},
		})
	}
	if (avec.items.length === 0) {
		return
	}

	value.add({ key: 'avec', value: avec }, true)
}

function codemod3(node) {
	yaml.visit(node, {
		// Remove `valeur` when alone in a map
		Map(_, map) {
			if (map.items.length === 1 && map.has('valeur')) {
				return map.get('valeur', true)
			}
			// Add linebreak before `avec` definitions and put it last
			const avec = map.get('avec')
			if (avec) {
				map.delete('avec')
				avec.items.forEach((item, i) => {
					item.key.spaceBefore = i !== 0 && isMap(item.value)
				})
				avec.items.sort((a, b) => {
					return a.key.value.localeCompare(b.key.value)
				})
				const key = new Scalar('avec')
				key.spaceBefore = true
				map.add({
					key,
					value: avec,
				})
			}
		},
	})
}

// Recursively find all yaml files in folder and subfolders
async function findYamlFiles(folderPathOrFilePath) {
	const stat = await fs.stat(folderPathOrFilePath)
	if (!stat.isDirectory()) {
		if (!folderPathOrFilePath.endsWith('.yaml')) {
			return []
		}
		return [folderPathOrFilePath]
	}
	const files = await fs.readdir(folderPathOrFilePath)
	const yamlFiles = []
	for (const file of files) {
		const filePath = `${folderPathOrFilePath}/${file}`
		yamlFiles.push(...(await findYamlFiles(filePath)))
	}
	return yamlFiles
}
