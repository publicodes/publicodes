import type {
	ChainedValue,
	BinaryOperationExpression,
	ConstantExpression,
	ReferenceExpression,
	CompilerMetadata,
} from '../ast/'

const pos = (): CompilerMetadata['position'] => ({
	file: 'examples.publicodes',
	start: { index: 0, line: 1, column: 1 },
	end: { index: 10, line: 1, column: 10 },
})

const ref = (id: string, name: string): ReferenceExpression => ({
	kind: 'ref',
	parameters: name,
	id,
	type: 'number',
	position: pos(),
})

const num = (id: string, value: number, unit?: string): ConstantExpression => ({
	kind: 'constant',
	parameters: {
		kind: 'number',
		value,
		unit,
	},
	id,
	position: pos(),
})

const txt = (id: string, value: string): ConstantExpression => ({
	kind: 'constant',
	parameters: {
		kind: 'text',
		value,
	},
	id,
	position: pos(),
})

const bul = (id: string, value: boolean): ConstantExpression => ({
	kind: 'constant',
	parameters: {
		kind: 'boolean',
		value,
	},
	id,
	position: pos(),
})

// ── Nested expression helpers ───────────────────────────────────────────────

const bin = <K extends BinaryOperationExpression['kind']>(
	id: string,
	kind: K,
	left: BinaryOperationExpression['parameters']['left'],
	right: BinaryOperationExpression['parameters']['right'],
): BinaryOperationExpression =>
	({
		kind,
		parameters: { left, right },
		id,
		type: 'number',
		position: pos(),
	}) as BinaryOperationExpression

const cmp = (
	id: string,
	kind: 'gt' | 'lt' | 'gteq' | 'lteq' | 'eq' | 'noteq',
	left: BinaryOperationExpression['parameters']['left'],
	right: BinaryOperationExpression['parameters']['right'],
): BinaryOperationExpression & { type: 'boolean' } =>
	({
		kind,
		parameters: { left, right },
		id,
		type: 'boolean',
		position: pos(),
	}) as BinaryOperationExpression & { type: 'boolean' }

// ── Value mechanisms ────────────────────────────────────────────────────────

/** `revenu × 0.3` */
export const exprMechanismStub = {
	value_mechanism: {
		kind: 'expr' as const,
		parameters: bin(
			'expr-mul',
			'mul',
			ref('ref-revenu', 'revenu'),
			num('cst-0.3', 0.3),
		),
		id: 'expr-mul-outer',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [],
} satisfies ChainedValue

/** `assiette` (simple value wrapping) */
export const valueMechanismStub = {
	value_mechanism: {
		kind: 'value' as const,
		parameters: {
			value_mechanism: {
				kind: 'expr' as const,
				parameters: ref('ref-assiette', 'assiette'),
				id: 'expr-assiette',
				type: 'number' as const,
				position: pos(),
			},
			chained_mechanisms: [],
		},
		id: 'value-assiette',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [],
} satisfies ChainedValue

/** `est applicable` */
export const isApplicableMechanismStub = {
	value_mechanism: {
		kind: 'is_applicable' as const,
		parameters: {
			value_mechanism: {
				kind: 'expr' as const,
				parameters: ref('ref-condition', 'condition'),
				id: 'expr-condition',
				type: 'boolean' as const,
				position: pos(),
			},
			chained_mechanisms: [],
		},
		id: 'is-applicable',
		type: 'boolean' as const,
		position: pos(),
	},
	chained_mechanisms: [],
} satisfies ChainedValue

/** `revenus . salaire + revenus . indépendant` */
export const sumMechanismStub = {
	value_mechanism: {
		kind: 'sum' as const,
		parameters: [
			{
				value_mechanism: {
					kind: 'expr' as const,
					parameters: ref('ref-salaire', 'revenus . salaire'),
					id: 'expr-salaire',
					type: 'number' as const,
					position: pos(),
				},
				chained_mechanisms: [],
			},
			{
				value_mechanism: {
					kind: 'expr' as const,
					parameters: ref('ref-indep', 'revenus . indépendant'),
					id: 'expr-indep',
					type: 'number' as const,
					position: pos(),
				},
				chained_mechanisms: [],
			},
		],
		id: 'sum-revenus',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [],
} satisfies ChainedValue

/** `assiette × taux` */
export const productMechanismStub = {
	value_mechanism: {
		kind: 'product' as const,
		parameters: [
			{
				value_mechanism: {
					kind: 'expr' as const,
					parameters: ref('ref-assiette-prod', 'assiette'),
					id: 'expr-assiette-prod',
					type: 'number' as const,
					position: pos(),
				},
				chained_mechanisms: [],
			},
			{
				value_mechanism: {
					kind: 'expr' as const,
					parameters: ref('ref-taux', 'taux'),
					id: 'expr-taux',
					type: 'number' as const,
					position: pos(),
				},
				chained_mechanisms: [],
			},
		],
		id: 'product',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [],
} satisfies ChainedValue

/** `toutes ces conditions : A ∧ B` */
export const allOfMechanismStub = {
	value_mechanism: {
		kind: 'all_of' as const,
		parameters: [
			{
				value_mechanism: {
					kind: 'expr' as const,
					parameters: ref('ref-condA', 'condition A'),
					id: 'expr-condA',
					type: 'boolean' as const,
					position: pos(),
				},
				chained_mechanisms: [],
			},
			{
				value_mechanism: {
					kind: 'expr' as const,
					parameters: ref('ref-condB', 'condition B'),
					id: 'expr-condB',
					type: 'boolean' as const,
					position: pos(),
				},
				chained_mechanisms: [],
			},
		],
		id: 'all-of',
		type: 'boolean' as const,
		position: pos(),
	},
	chained_mechanisms: [],
} satisfies ChainedValue

/** `parmi : a, b` */
export const oneOfMechanismStub = {
	value_mechanism: {
		kind: 'one_of' as const,
		parameters: [
			{
				value_mechanism: {
					kind: 'expr' as const,
					parameters: txt('cst-a', 'a'),
					id: 'expr-a',
					type: 'text' as const,
					position: pos(),
				},
				chained_mechanisms: [],
			},
			{
				value_mechanism: {
					kind: 'expr' as const,
					parameters: txt('cst-b', 'b'),
					id: 'expr-b',
					type: 'text' as const,
					position: pos(),
				},
				chained_mechanisms: [],
			},
		],
		id: 'one-of',
		type: 'text' as const,
		position: pos(),
	},
	chained_mechanisms: [],
} satisfies ChainedValue

/** `le minimum de : A, B` */
export const minOfMechanismStub = {
	value_mechanism: {
		kind: 'min_of' as const,
		parameters: [
			{
				value_mechanism: {
					kind: 'expr' as const,
					parameters: ref('ref-plafondA', 'plafond A'),
					id: 'expr-plafondA',
					type: 'number' as const,
					position: pos(),
				},
				chained_mechanisms: [],
			},
			{
				value_mechanism: {
					kind: 'expr' as const,
					parameters: ref('ref-plafondB', 'plafond B'),
					id: 'expr-plafondB',
					type: 'number' as const,
					position: pos(),
				},
				chained_mechanisms: [],
			},
		],
		id: 'min-of',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [],
} satisfies ChainedValue

/** `le maximum de : A, B` */
export const maxOfMechanismStub = {
	value_mechanism: {
		kind: 'max_of' as const,
		parameters: [
			{
				value_mechanism: {
					kind: 'expr' as const,
					parameters: ref('ref-baremeA', 'barème A'),
					id: 'expr-baremeA',
					type: 'number' as const,
					position: pos(),
				},
				chained_mechanisms: [],
			},
			{
				value_mechanism: {
					kind: 'expr' as const,
					parameters: ref('ref-baremeB', 'barème B'),
					id: 'expr-baremeB',
					type: 'number' as const,
					position: pos(),
				},
				chained_mechanisms: [],
			},
		],
		id: 'max-of',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [],
} satisfies ChainedValue

/** Paramètre non défini */
export const notDefinedMechanismStub = {
	value_mechanism: {
		kind: 'not_defined' as const,
		id: 'not-defined',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [],
} satisfies ChainedValue

/** Barème progressif : ≤ 10k → 0%, ≤ 25k → 11%, sinon → 30% */
export const variationsMechanismStub = {
	value_mechanism: {
		kind: 'variations' as const,
		parameters: {
			conditions: [
				{
					if: {
						value_mechanism: {
							kind: 'expr' as const,
							parameters: cmp(
								'expr-lteq-10k',
								'lteq',
								ref('ref-revenu-1', 'revenu'),
								num('cst-10k', 10000),
							),
							id: 'expr-lteq-10k-outer',
							type: 'boolean' as const,
							position: pos(),
						},
						chained_mechanisms: [],
					},
					then: {
						value_mechanism: {
							kind: 'expr' as const,
							parameters: num('cst-0', 0),
							id: 'expr-0',
							type: 'number' as const,
							position: pos(),
						},
						chained_mechanisms: [],
					},
				},
				{
					if: {
						value_mechanism: {
							kind: 'expr' as const,
							parameters: cmp(
								'expr-lteq-25k',
								'lteq',
								ref('ref-revenu-2', 'revenu'),
								num('cst-25k', 25000),
							),
							id: 'expr-lteq-25k-outer',
							type: 'boolean' as const,
							position: pos(),
						},
						chained_mechanisms: [],
					},
					then: {
						value_mechanism: {
							kind: 'expr' as const,
							parameters: num('cst-11pct', 0.11),
							id: 'expr-11pct',
							type: 'number' as const,
							position: pos(),
						},
						chained_mechanisms: [],
					},
				},
			],
			else: {
				value_mechanism: {
					kind: 'expr' as const,
					parameters: num('cst-30pct', 0.3),
					id: 'expr-30pct',
					type: 'number' as const,
					position: pos(),
				},
				chained_mechanisms: [],
			},
		},
		id: 'variations-bareme',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [],
} satisfies ChainedValue

// ── Chained mechanisms ──────────────────────────────────────────────────────

const chainedValue = (m: ChainedValue['value_mechanism']): ChainedValue => ({
	value_mechanism: m,
	chained_mechanisms: [],
})

/** `est applicable si : éligible` */
export const applicableIfMechanismStub = {
	value_mechanism: {
		kind: 'expr' as const,
		parameters: ref('ref-montant', 'montant'),
		id: 'expr-montant',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [
		{
			kind: 'applicable_if' as const,
			parameters: chainedValue({
				kind: 'expr' as const,
				parameters: ref('ref-eligible', 'éligible'),
				id: 'expr-eligible',
				type: 'boolean' as const,
				position: pos(),
			}),
			id: 'app-if',
			type: 'number' as const,
			position: pos(),
		},
	],
} satisfies ChainedValue

/** `n'est pas applicable si : plafond dépassé` */
export const notApplicableIfMechanismStub = {
	value_mechanism: {
		kind: 'expr' as const,
		parameters: ref('ref-reduc', 'réduction'),
		id: 'expr-reduc',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [
		{
			kind: 'not_applicable_if' as const,
			parameters: chainedValue({
				kind: 'expr' as const,
				parameters: ref('ref-plafond', 'plafond dépassé'),
				id: 'expr-plafond',
				type: 'boolean' as const,
				position: pos(),
			}),
			id: 'not-app-if',
			type: 'number' as const,
			position: pos(),
		},
	],
} satisfies ChainedValue

/** `dans : département = "75"` */
export const contextMechanismStub = {
	value_mechanism: {
		kind: 'expr' as const,
		parameters: ref('ref-taux-reg', 'taux régional'),
		id: 'expr-taux-reg',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [
		{
			kind: 'context' as const,
			parameters: {
				département: chainedValue({
					kind: 'expr' as const,
					parameters: txt('cst-75', '75'),
					id: 'expr-75',
					type: 'text' as const,
					position: pos(),
				}),
			},
			id: 'context-dep',
			type: 'number' as const,
			position: pos(),
		},
	],
} satisfies ChainedValue

/** `par défaut : 1000€` */
export const defaultMechanismStub = {
	value_mechanism: {
		kind: 'expr' as const,
		parameters: ref('ref-base', 'base'),
		id: 'expr-base',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [
		{
			kind: 'default' as const,
			parameters: chainedValue({
				kind: 'expr' as const,
				parameters: num('cst-1000', 1000),
				id: 'expr-1000',
				type: 'number' as const,
				position: pos(),
			}),
			id: 'default',
			type: 'number' as const,
			position: pos(),
		},
	],
} satisfies ChainedValue

/** `plafonné à : 10k€` */
export const ceilingMechanismStub = {
	value_mechanism: {
		kind: 'expr' as const,
		parameters: ref('ref-brut', 'montant brut'),
		id: 'expr-brut',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [
		{
			kind: 'ceiling' as const,
			parameters: chainedValue({
				kind: 'expr' as const,
				parameters: num('cst-10ke', 10000),
				id: 'expr-10ke',
				type: 'number' as const,
				position: pos(),
			}),
			id: 'ceiling',
			type: 'number' as const,
			position: pos(),
		},
	],
} satisfies ChainedValue

/** `plancher à : 0€` */
export const floorMechanismStub = {
	value_mechanism: {
		kind: 'expr' as const,
		parameters: ref('ref-imposable', 'revenu imposable'),
		id: 'expr-imposable',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [
		{
			kind: 'floor' as const,
			parameters: chainedValue({
				kind: 'expr' as const,
				parameters: num('cst-0f', 0),
				id: 'expr-0-floor',
				type: 'number' as const,
				position: pos(),
			}),
			id: 'floor',
			type: 'number' as const,
			position: pos(),
		},
	],
} satisfies ChainedValue

/** `arrondi au supérieur à 2 décimales` */
export const roundUpMechanismStub = {
	value_mechanism: {
		kind: 'expr' as const,
		parameters: ref('ref-resultat-up', 'résultat'),
		id: 'expr-resultat-up',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [
		{
			kind: 'round_up' as const,
			parameters: chainedValue({
				kind: 'expr' as const,
				parameters: num('cst-001', 0.01),
				id: 'expr-001',
				type: 'number' as const,
				position: pos(),
			}),
			id: 'round-up',
			type: 'number' as const,
			position: pos(),
		},
	],
} satisfies ChainedValue

/** `arrondi à l'inférieur à l'unité` */
export const roundDownMechanismStub = {
	value_mechanism: {
		kind: 'expr' as const,
		parameters: ref('ref-resultat-down', 'résultat'),
		id: 'expr-resultat-down',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [
		{
			kind: 'round_down' as const,
			parameters: chainedValue({
				kind: 'expr' as const,
				parameters: num('cst-1d', 1),
				id: 'expr-1-down',
				type: 'number' as const,
				position: pos(),
			}),
			id: 'round-down',
			type: 'number' as const,
			position: pos(),
		},
	],
} satisfies ChainedValue

/** `arrondi au plus proche à l'unité` */
export const roundNearestMechanismStub = {
	value_mechanism: {
		kind: 'expr' as const,
		parameters: ref('ref-resultat-nearest', 'résultat'),
		id: 'expr-resultat-nearest',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [
		{
			kind: 'round_nearest' as const,
			parameters: chainedValue({
				kind: 'expr' as const,
				parameters: num('cst-1n', 1),
				id: 'expr-1-nearest',
				type: 'number' as const,
				position: pos(),
			}),
			id: 'round-nearest',
			type: 'number' as const,
			position: pos(),
		},
	],
} satisfies ChainedValue

/** `type : nombre` */
export const typeMechanismStub = {
	value_mechanism: {
		kind: 'expr' as const,
		parameters: ref('ref-montant-type', 'montant'),
		id: 'expr-montant-type',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [
		{
			kind: 'type_def' as const,
			parameters: { value: 'number' as const },
			id: 'type-number',
			type: 'number' as const,
			position: pos(),
		},
	],
} satisfies ChainedValue

// ── Expression stubs ────────────────────────────────────────────────────────

/** `42€` */
export const constantNumberExpressionStub = num('cst-42e', 42, '€')

/** `"texte libre"` */
export const constantTextExpressionStub = txt('cst-texte', 'texte libre')

/** `oui` */
export const constantBooleanExpressionStub = bul('cst-true', true)

/** `"15 janvier 2024"` */
export const constantDateExpressionStub = {
	kind: 'constant' as const,
	parameters: {
		kind: 'date' as const,
		value: '2024-01-15',
	},
	id: 'cst-date',
	position: pos(),
} satisfies ConstantExpression

/** `base` */
export const referenceExpressionStub = ref('ref-base', 'base')

/** `revenu × taux × (1 - abattement)` */
export const nestedBinaryExpressionStub = bin(
	'nested-mul',
	'mul',
	ref('ref-revenu-nested', 'revenu'),
	bin(
		'nested-mul-2',
		'mul',
		ref('ref-taux-nested', 'taux'),
		bin(
			'nested-sub',
			'sub',
			num('cst-1-nested', 1),
			ref('ref-abattement', 'abattement'),
		),
	),
)

/** `revenu × (taux + 1)` — des parenthèses sont nécessaires */
export const parensExpressionStub = {
	value_mechanism: {
		kind: 'expr' as const,
		parameters: bin(
			'parens-mul',
			'mul',
			ref('ref-revenu-parens', 'revenu'),
			bin(
				'parens-add',
				'add',
				ref('ref-taux-parens', 'taux'),
				num('cst-1-parens', 1),
			),
		),
		id: 'expr-parens',
		type: 'number' as const,
		position: pos(),
	},
	chained_mechanisms: [],
} satisfies ChainedValue
