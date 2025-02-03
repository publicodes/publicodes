import { join, resolve } from 'path'
import { describe, it, expect } from 'vitest'
import { getModelFromSource } from '../../src/compilation/getModelFromSource'

const testDataDir = resolve('./test/compilation/data/')

const updatedDescription = `> ℹ️ Cette règle provient du modèle \`my-external-package\`.`

describe('getModelFromSource › rules import', () => {
	it('should import a rule from a package', () => {
		expect(
			getModelFromSource(join(testDataDir, 'import-simple.publicodes')),
		).toEqual({
			'my-external-package': null,
			'my-external-package . root': null,
			'my-external-package . root . a': {
				formule: 10,
				description: updatedDescription,
			},
		})
	})

	it('should import a rule from a package with its needed dependency', () => {
		expect(
			getModelFromSource(join(testDataDir, 'import-deps.publicodes')),
		).toEqual({
			'my-external-package': null,
			'my-external-package . root': null,
			'my-external-package . root . b': {
				formule: 'root . c * 2',
				description: updatedDescription,
			},
			'my-external-package . root . c': {
				formule: 20,
				description: updatedDescription,
			},
		})
	})

	it('should import a rule from a package with all its needed dependencies', () => {
		expect(
			getModelFromSource(join(testDataDir, 'import-multiple-deps.publicodes')),
		).toEqual({
			'my-external-package': null,
			'my-external-package . root': {
				formule: 'a * b',
				description: updatedDescription,
			},
			'my-external-package . root . a': {
				formule: 10,
				description: updatedDescription,
			},
			'my-external-package . root . b': {
				formule: 'root . c * 2',
				description: updatedDescription,
			},
			'my-external-package . root . c': {
				formule: 20,
				description: updatedDescription,
			},
		})
	})

	it('should import a rule from a package with all updated attributes', () => {
		expect(
			getModelFromSource(join(testDataDir, 'import-updated-attrs.publicodes')),
		).toEqual({
			'my-external-package': null,
			'my-external-package . root': null,
			'my-external-package . root . a': {
				formule: 10,
				titre: "Ajout d'un titre",
				description: updatedDescription,
			},
			'my-external-package . root . c': {
				formule: 20,
				description: `
${updatedDescription}


Ajout d'une description`,
			},
			'my-external-package . root 2': {
				formule: 20,
				résumé: "Modification d'un résumé",
				description: updatedDescription,
			},
			'my-external-package . e': {
				formule: 10,
				question: null,
				description: updatedDescription,
				résumé: 'Lorem ipsum',
			},
		})
	})

	it('should import a rule from a package with all updated attributes even in imported rule deps', () => {
		expect(
			getModelFromSource(
				join(testDataDir, 'import-updated-attrs-from-deps.publicodes'),
			),
		).toEqual({
			'my-external-package': null,
			'my-external-package . root': null,
			'my-external-package . root . b': {
				formule: 'root . c * 2',
				description: updatedDescription,
			},
			'my-external-package . root . c': {
				formule: 20,
				titre: "Ajout d'un titre",
				description: updatedDescription,
			},
		})
	})

	it('should import a rule from a package with all dependencies from a complex formula', () => {
		expect(
			getModelFromSource(join(testDataDir, 'import-complex-deps.publicodes')),
		).toEqual({
			'my-external-package': null,
			'my-external-package . complex': {
				formule: {
					somme: ['d', 'root'],
				},
				description: updatedDescription,
			},
			'my-external-package . root': {
				formule: 'a * b',
				description: updatedDescription,
			},
			'my-external-package . root . a': {
				formule: 10,
				description: updatedDescription,
			},
			'my-external-package . root . b': {
				formule: 'root . c * 2',
				description: updatedDescription,
			},
			'my-external-package . root . c': {
				formule: 20,
				description: updatedDescription,
			},
			'my-external-package . root 2': {
				formule: 20,
				résumé: 'Résumé root 2',
				description: updatedDescription,
			},
			'my-external-package . d': {
				formule: {
					variations: [{ si: 'root 2 > 10', alors: 10 }, { sinon: 'root 2' }],
				},
				description: updatedDescription,
			},
		})
	})

	it('should throw an error when trying to import an unknown rule', () => {
		expect(() => {
			getModelFromSource(join(testDataDir, 'import-unknown.publicodes'))
		}).toThrow(
			`[ Erreur dans la macro 'importer!' ]
La règle 'root . unknown' n'existe pas dans 'my-external-package'.

[ Solution ]
- Vérifiez que le nom de la règle est correct.
- Assurez-vous que la règle 'root . unknown' existe dans 'my-external-package'.`,
		)
	})

	it('should throw an error if there is no package name specified', () => {
		const path = join(testDataDir, 'import-no-name.publicodes')
		expect(() => {
			getModelFromSource(path)
		}).toThrow(
			`[ Erreur dans la macro 'importer!' ]
Le nom du package est manquant dans la macro 'importer!' dans le fichier: import-no-name.publicodes.

[ Solution ]
Ajoutez le nom du package dans la macro 'importer!'.

[ Exemple ]
importer!:
  depuis:
    nom: package-name
  les règles:
    - ruleA
    - ruleB
    ...`,
		)
	})

	it('should throw an error if there is a conflict between to imported rules', () => {
		expect(() => {
			getModelFromSource(join(testDataDir, 'import-doublon.publicodes'))
		}).toThrow(
			"La règle 'root . a' est définie deux fois dans my-external-package",
		)
	})

	it('should throw an error if there is conflict between an imported rule and a base rule', () => {
		const baseName = 'rules-doublon.publicodes'
		expect(() => {
			getModelFromSource(join(testDataDir, baseName))
		}).toThrow(
			`[${baseName}] La règle 'my-external-package . root . c' est déjà définie`,
		)
	})

	it('should throw an error if there is conflict between an imported rule and a base rule with a custom namespace', () => {
		const baseName = 'rules-doublon-with-namespace.publicodes'
		expect(() => {
			getModelFromSource(join(testDataDir, baseName))
		}).toThrow(`[${baseName}] La règle 'pkg . root . c' est déjà définie`)
	})

	it('should import a rule from a package with all dependencies from a complex formula in a custom namespace', () => {
		expect(
			getModelFromSource(
				join(testDataDir, 'import-complex-deps-with-namespace.publicodes'),
			),
		).toEqual({
			pkg: null,
			'pkg . complex': {
				formule: {
					somme: ['d', 'root'],
				},
				description: updatedDescription,
			},
			'pkg . root': {
				formule: 'a * b',
				description: updatedDescription,
			},
			'pkg . root . a': {
				formule: 10,
				description: updatedDescription,
			},
			'pkg . root . b': {
				formule: 'root . c * 2',
				description: updatedDescription,
			},
			'pkg . root . c': {
				formule: 20,
				description: updatedDescription,
			},
			'pkg . root 2': {
				formule: 20,
				résumé: 'Résumé root 2',
				description: updatedDescription,
			},
			'pkg . d': {
				formule: {
					variations: [{ si: 'root 2 > 10', alors: 10 }, { sinon: 'root 2' }],
				},
				description: updatedDescription,
			},
		})
	})

	it('should correctly import rules with [avec] mechanism', () => {
		expect(
			getModelFromSource(join(testDataDir, 'import-avec-mechanism.publicodes')),
		).toEqual({
			'my-external-package': null,
			'my-external-package . rule with avec': {
				formule: 'F1 + F2 + F3',
				description: updatedDescription,
			},
			'my-external-package . rule with avec . F1': {
				valeur: '1',
				description: updatedDescription,
			},
			'my-external-package . rule with avec . F2': {
				valeur: '2',
				description: updatedDescription,
			},
			'my-external-package . rule with avec . F3': {
				valeur: '3',
				description: updatedDescription,
			},
		})
	})

	it('should not add namespace if it is already present in the model', () => {
		expect(
			getModelFromSource(join(testDataDir, 'namespace-conflicts')),
		).toEqual({
			pkg: {
				titre: 'Already existing namespace',
			},
			'pkg . root': null,
			'pkg . root . b': {
				formule: 'root . c * 2',
				description: updatedDescription,
			},
			'pkg . root . c': {
				formule: 20,
				description: updatedDescription,
			},
			rule: {
				formule: 'pkg . root . b * 2',
			},
		})
	})

	it('should parse with glob pattern', () => {
		expect(
			getModelFromSource(
				join(testDataDir, 'namespace-conflicts/**/*.publicodes'),
			),
		).toEqual({
			pkg: {
				titre: 'Already existing namespace',
			},
			'pkg . root': null,
			'pkg . root . b': {
				formule: 'root . c * 2',
				description: updatedDescription,
			},
			'pkg . root . c': {
				formule: 20,
				description: updatedDescription,
			},
			rule: {
				formule: 'pkg . root . b * 2',
			},
		})
	})
})
