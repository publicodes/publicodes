import type { EquationView, OperandView } from '@publicodes/autodoc-core'
import { useEffect, useState, type ReactElement } from 'react'
import { useAutodocInteraction } from '../components/AutodocInteractionContext'
import { AutodocEvaluationTraceProvider } from '../components/AutodocEvaluationTraceContext'
import { FoldControl } from './FoldControl'
import { RulePageLink } from './RulePageLink'
import { Value } from './Value'

/**
 * What a reader copies keeps the shape of the computation: a tab per level of
 * indentation, then a tab between the cells. A grid ignores whitespace-only text
 * nodes, so what the eye sees does not change.
 */
const indentOf = (depth: number): string => '\n' + '\t'.repeat(depth)

/**
 * The computation as rows, the answer line included. Each row prints what its view
 * says and nothing else: the projection has decided what it reads, what opens it,
 * and what opens under it.
 */
export function Equation({ view }: { view: EquationView }): ReactElement {
	// the lines of the value mechanism end where the chain begins: the last of them carries a
	// plain filet, and the lines under it are what the chain adds rather than its terms
	const firstChained = view.rows.findIndex((row) => row.modifier)
	const lastValue = firstChained > 0 ? firstChained - 1 : -1
	const lines = (
		<>
			{view.head && <Row view={view.head} head />}
			{view.rows.map((row, index) => (
				<Row
					key={row.id}
					view={row}
					lastValue={index === lastValue && !row.modifier}
				/>
			))}
			{view.note !== null && (
				<p className="publicodes-detail__note">{view.note}</p>
			)}
		</>
	)
	// a `contexte` mechanism pushes a stack of its own, and its lines are read under it:
	// what a reader opens from inside them stays in that context
	return (
		<div className="publicodes-equation">
			{view.contextId === null ?
				lines
			:	<AutodocEvaluationTraceProvider contextId={view.contextId}>
					{lines}
				</AutodocEvaluationTraceProvider>
			}
		</div>
	)
}

/**
 * Le repli d'une fiche dure le temps de son mouvement : assez pour qu'on le voie, pas plus.
 * La même durée est écrite dans la règle `publicodes-detail` de la feuille de style.
 */
const FOLD_MS = 200

function Row({
	view,
	head = false,
	lastValue = false,
}: {
	view: OperandView
	head?: boolean
	lastValue?: boolean
}): ReactElement {
	const { toggleRow } = useAutodocInteraction()
	// la fiche reste montée le temps de se replier : React ne peut pas animer un nœud qu'il
	// retire, et le papier doit se refermer sous la ligne qui l'a ouvert
	const [kept, setKept] = useState(view.detail)
	const open = view.detail !== null
	useEffect(() => {
		if (open) {
			setKept(view.detail)
			return
		}
		const timer = setTimeout(() => setKept(null), FOLD_MS)
		return () => clearTimeout(timer)
	}, [open, view.detail])
	const sheet = open ? view.detail : kept
	// une fiche qui nomme sa colonne est une table : son mot se lit sur la ligne qui l'ouvre,
	// pas sur une ligne à elle, et ses entrées se rangent dans les colonnes de la règle
	const table = sheet?.header ?? null
	const label = view.label ?? ''
	const control = (className: string) => (
		<button
			type="button"
			className={className}
			title={view.description ?? undefined}
			aria-expanded={view.open}
			onClick={() => view.key !== null && toggleRow(view.key)}
		>
			{label}
		</button>
	)
	const line = (
		<div
			className={
				'publicodes-row' +
				(head ? ' publicodes-row--head' : '') +
				(view.inert ? ' publicodes-row--inert' : '') +
				(view.folded ? ' publicodes-row--folded' : '') +
				(view.open ? ' publicodes-row--open' : '') +
				(view.key !== null ? ' publicodes-row--unfoldable' : '') +
				(lastValue ? ' publicodes-row--last-value' : '')
			}
		>
			{indentOf(view.depth)}
			{/* the operator column: one label, whether the line carries an operator or a
			    mechanism's word. A sign is set at the notation's size, a word at the
			    label's, so the two read as what they are */}
			{!head && (
				<>
					<span className="publicodes-row__gutter">
						{view.gutter !== '' && (
							<span
								className={
									'publicodes-row__label' +
									(view.gutterIsMechanism ? ' publicodes-row__label--word' : '')
								}
							>
								{view.gutter}
							</span>
						)}
					</span>
					{'\t'}
				</>
			)}
			<span className="publicodes-row__term">
				{view.control === 'term' ?
					control(
						'publicodes-row__control' +
							(view.termIsMechanism ?
								' publicodes-row__label publicodes-row__label--word'
							:	''),
					)
				:	view.label}
				{view.page && (
					<RulePageLink address={view.page.address} name={view.page.name} />
				)}
			</span>
			{'\t'}
			{table !== null ?
				// le mot de la table est la valeur de cette ligne-là : une seule cellule
				<span className="publicodes-value">
					<span className="publicodes-row__label publicodes-row__label--word">
						{table}
					</span>
				</span>
			: view.control === 'value' ?
				// the figure itself is the control, so it must be printed inside it
				<button
					type="button"
					className="publicodes-row__control publicodes-value"
					aria-expanded={view.open}
					onClick={() => view.key !== null && toggleRow(view.key)}
				>
					<Value
						value={view.value}
						parameter={view.parameter}
						note={view.parameterNote}
					/>
				</button>
			:	<Value
					value={view.value}
					parameter={view.parameter}
					note={view.parameterNote}
				/>
			}
			{view.fold && <FoldControl fold={view.fold} />}
		</div>
	)

	// the answer line is not written on a sheet of its own
	if (head) return line

	// a line that opens nothing is no block: the block exists for the sheet a line opens,
	// and is the only thing that carries a paper. The wrapper stays anonymous rather than
	// appearing on the first unfold — React would replace the line's node, and the reader
	// would lose the focus and the place they had it in.
	return (
		<div
			className={sheet ? 'publicodes-block' : undefined}
			data-paper={sheet ? view.paper : undefined}
		>
			{line}
			{sheet && (
				<div
					className="publicodes-detail"
					data-open={open}
					data-table={table === null ? undefined : 'true'}
				>
					<Equation view={sheet} />
				</div>
			)}
		</div>
	)
}
