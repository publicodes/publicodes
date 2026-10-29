import type * as Ast from '../ast'
import type {
	Ctx,
	EquationView,
	MechanismView,
	OperandView,
	ParameterState,
	RawOperand,
	ValueView,
} from './types'
import { foldLabel } from './copy'
import { mechanismName } from './mechanism-name'
import { pageOf } from './pages'
import { ABSENT } from './value'

/**
 * How a rule's value arrived, when the model does not compute it: given by the
 * caller, written as a default, or missing. `null` when the rule computes.
 */
export function parameterState(
	address: string,
	ctx: Ctx,
): ParameterState | null {
	const rule = ctx.ast[address]
	if (rule === undefined || rule.value_mechanism.kind !== 'not_defined') {
		return null
	}
	if (ctx.context?.[address] !== undefined) return 'fournie'
	if (
		rule.chained_mechanisms.some((mechanism) => mechanism.kind === 'default')
	) {
		return 'par défaut'
	}
	return 'non renseignée'
}

/**
 * Finishes an equation: which lines are printed, what the fold holds back, and
 * how deep the lines sit. Every mechanism goes through here, so no
 * mechanism decides any of it for itself.
 */
/**
 * Les mécanismes qui écrivent leur valeur avec des opérateurs : une somme et un produit
 * compilés arrivent en liste, une chaîne arrive en arbre, et les trois sont des expressions.
 */
const ARITHMETIC: readonly (string | null)[] = [
	'expression',
	'somme',
	'produit',
]

export function finishEquation(
	mechanism: MechanismView,
	ctx: Ctx,
	id: string,
): EquationView {
	// les conditions d'applicabilité ouvrent le calcul : elles disent si la règle s'applique
	// avant de dire ce qu'elle vaut. Le mécanisme de valeur vient ensuite, puis le reste de la
	// chaîne — ce qui change la valeur trouvée se lit après elle.
	const all = [
		...mechanism.modifiers.filter((row) => row.applicability),
		...mechanism.operands,
		...mechanism.modifiers.filter((row) => !row.applicability),
	]
	// un mécanisme sans valeur n'a rien lu : ses lignes n'ont rien fait ni rien subi. Une
	// absence lue, elle, est un résultat d'évaluation — elle garde ce qu'elle a tranché
	const read = mechanism.result.state !== 'absent'
	const rows = read ? all : all.map((r) => ({ ...r, inert: false }))
	const held = rows.filter((row) => row.inert)
	// the reader's choice first; failing one, terms that had no effect are held back —
	// unless the mechanism asks for them, or the page has no context to read them
	// against, or holding them back would leave the fiche with nothing else to show
	const expanded =
		ctx.folds[id] ??
		(mechanism.expandedByDefault === true ||
			ctx.trace === undefined ||
			(held.length > 0 && held.length === rows.length))
	const fold =
		held.length > 0 ?
			{
				id,
				count: held.length,
				label: foldLabel(held.length, expanded),
				expanded,
			}
		:	null
	// ce que le pli cache reste dans l'équation : une ligne retirée du document ne peut pas se
	// fermer, et sa disparition remonterait celles qui la suivent
	const printed = expanded ? rows : rows.filter((row) => !row.inert)
	// le premier terme visible ne porte pas l'opérateur qui le sépare du précédent : il n'y a
	// pas de précédent. Une expression, elle, commence par son signe égal — le label du
	// mécanisme, posé sur son premier terme. Un mot du langage et le `−` d'une négation
	// gardent le leur. Une condition d'applicabilité au-dessus ne compte pas : elle n'est pas
	// un terme de la somme.
	const opening = printed.find((row) => !row.modifier) ?? printed[0]
	const expression = ARITHMETIC.includes(mechanism.keyword)
	return {
		keyword: mechanism.keyword,
		inlineTerm: mechanism.inlineTerm,
		rows: rows.map((row, index) => {
			// ce qui qualifie la ligne : son mot de mécanisme, ou le signe de l'expression
			const bare =
				row === opening && !row.gutterIsMechanism && row.gutter !== '−'
			return {
				...row,
				// toute ligne a une identité : les raws synthétiques n'en portent pas — une constante,
				// une référence — et deux identités vides se confondent au rendu, qui en perd une
				id: row.id === '' ? `${id}-${index}` : row.id,
				folded: !printed.includes(row),
				gutter:
					!bare ? row.gutter
					: expression ? '='
					: '',
				gutterIsMechanism: row.gutterIsMechanism || (bare && expression),
			}
		}),
		size: rows.length,
		result: mechanism.result,
		fold,
		// une feuille vidée de ses lignes n'écrit rien : le lecteur a fermé ce qu'il avait ouvert
		note: null,
		contextId: null,
		header: null,
		depth: ctx.depth,
	}
}

/**
 * The language's word for what a value is worth, when the value is a yes or a no: a flag
 * written `oui` says no more than the figure beside it.
 */
const booleanWordOf = (value: ValueView): string | null =>
	typeof value.value !== 'boolean' && typeof value.value !== 'number' ? null
	: value.value ? 'oui'
	: 'non'

/**
 * Finishes a row: what its gutter says, where its control sits, and what opens under
 * it. One place for every row of the page, whether it comes from a written expression or
 * from a mechanism's operand.
 */
export function finishRow(
	raw: RawOperand,
	ctx: Ctx,
	operator: string | null,
	keyword: string | null,
): OperandView {
	// a term that only repeats the value is not printed twice — neither in its own words
	// nor in the language's words for what it is worth. A mechanism with no written form
	// goes by its name instead of leaving the middle column empty
	const term =
		(
			raw.term !== null &&
			raw.term !== raw.value.text &&
			raw.term !== booleanWordOf(raw.value)
		) ?
			raw.term
		:	raw.named
	const key = raw.address ?? raw.id
	// what a row opens is one gutter further in, and is projected by whoever holds the
	// node: a rule here, a mechanism where its operand was read
	const inner = { ...ctx, depth: ctx.depth + 1 }
	const explanation =
		raw.address !== null ? ctx.projectExplanation(raw.address, inner) : null
	const fiche = explanation ?? raw.detail
	const label = raw.name ?? term
	// a mechanism with no written form goes by its name, and its line is what explains it
	const byName = term !== null && term === raw.named
	// une référence s'ouvre pour montrer ce qu'elle est — sauf une constante brute, dont la
	// valeur est déjà sur la ligne et qui n'a rien à expliquer. Un paramètre, lui, s'ouvre :
	// sa fiche dit d'où vient la valeur et ce que le lecteur peut y changer. Un mécanisme ne
	// s'ouvre que là où il imprime des lignes.
	const node = raw.address !== null ? ctx.ast[raw.address] : undefined
	const mechanism = node?.value_mechanism
	// le compilateur écrit une constante comme une expression sans opérateur
	const constant =
		mechanism !== undefined &&
		mechanism.kind === 'expr' &&
		mechanism.parameters.kind === 'constant' &&
		(node?.chained_mechanisms.length ?? 0) === 0
	const opens =
		(raw.address !== null && !constant) || (fiche !== null && fiche.size > 0)
	// la règle qu'une ligne référence décide elle-même d'une branche : aucun opérateur ne
	// l'écrit, et sa valeur est un choix parmi d'autres
	const chosen =
		raw.address !== null &&
		ctx.ast[raw.address]?.value_mechanism.kind === 'variations'
	// sans évaluation, une ligne qui n'a rien à dire d'elle-même s'ouvre d'emblée : ni forme
	// écrite — elle porte le nom de son mécanisme — ni valeur, ce qu'elle ouvre étant un choix
	const unfolded =
		ctx.expanded.has(key ?? '') ||
		(ctx.trace === undefined && (byName || chosen))
	const detail = opens && key !== null && unfolded ? fiche : null
	return {
		gutter: keyword ?? operator ?? '',
		id: raw.id ?? raw.address ?? '',
		gutterIsMechanism: keyword !== null,
		key: opens ? key : null,
		depth: ctx.depth,
		termIsMechanism: byName,
		control:
			!opens ? null
			: label !== null ? 'term'
			: 'value',
		label,
		value: raw.value,
		address: raw.address,
		// the way to the rule's own page, when it has one: offered on the line itself, whether
		// the line is open or not, since it leads somewhere rather than opening something
		page: raw.address === null ? null : pageOf(ctx, raw.address),
		description: raw.description,
		parameterNote: null,
		detail,
		open: detail !== null,
		fold: detail?.fold ?? null,
		inert: false,
		folded: false,
		modifier: false,
		applicability: false,
	}
}

/**
 * The operand a mechanism's child contributes to its equation. The child's own
 * equation says what it is worth and what it opens onto; this decides how its line
 * reads.
 */
export function projectOperand(
	child: Ast.ChainedValue,
	ctx: Ctx,
	operator: string | null,
	keyword: string | null,
): OperandView {
	const equation = ctx.projectNode(child, { ...ctx, depth: ctx.depth + 1 })
	const value = equation?.result ?? ABSENT
	// a bare reference keeps its name and its address, so the row leads to it rather
	// than unfolding an equation that holds a single line
	const single =
		equation?.keyword === 'expression' && equation.rows.length === 1 ?
			equation.rows[0]
		:	null
	const named = mechanismName(child.value_mechanism)
	return finishRow(
		{
			id: single === null ? child.value_mechanism.id : null,
			name: single?.label ?? null,
			address: single?.address ?? null,
			description: single?.description ?? null,
			term: single?.label ?? equation?.inlineTerm ?? null,
			named,
			value,
			detail: single === null ? equation : null,
		},
		ctx,
		operator,
		keyword,
	)
}
