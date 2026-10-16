import type { EquationView, OperandView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { useAutodocInteraction } from '../components/AutodocInteractionContext'
import { AutodocEvaluationTraceProvider } from '../components/AutodocEvaluationTraceContext'
import { ContextTable } from './ContextTable'
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
	// the first annotation is where the expression ends: it opens the group, and the lines
	// under it are read as what the value above is worth rather than as its own terms. An
	// annotation the sheet opens on separates nothing, and carries no filet of its own.
	const first = view.rows.findIndex((row) => row.modifier)
	const firstModifier = first > 0 ? first : -1
	const lines = (
		<>
			{view.head && <Row view={view.head} head />}
			{view.rows.map((row, index) => (
				<Row key={index} view={row} firstModifier={index === firstModifier} />
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

function Row({
	view,
	head = false,
	firstModifier = false,
}: {
	view: OperandView
	head?: boolean
	firstModifier?: boolean
}): ReactElement {
	const { toggleRow } = useAutodocInteraction()
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
				(view.open ? ' publicodes-row--open' : '') +
				(view.key !== null ? ' publicodes-row--unfoldable' : '') +
				(firstModifier ? ' publicodes-row--first-modifier' : '')
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
			{view.control === 'value' ?
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

	// what a `contexte` binds is not a line with an explanation under it: the table is the
	// line, and its word takes the operator column, so the header is read with the word
	if (view.detail !== null && view.detail.context !== null) {
		return (
			<div className="publicodes-block" data-paper={view.paper}>
				<ContextTable label={view.gutter} entries={view.detail.context} />
			</div>
		)
	}

	// a line that opens nothing is no block: the block exists for the sheet a line opens,
	// and is the only thing that carries a paper. The wrapper stays anonymous rather than
	// appearing on the first unfold — React would replace the line's node, and the reader
	// would lose the focus and the place they had it in.
	return (
		<div
			className={view.detail ? 'publicodes-block' : undefined}
			data-paper={view.detail ? view.paper : undefined}
		>
			{line}
			{view.detail && (
				<div className="publicodes-detail">
					{view.detail.context === null ?
						<Equation view={view.detail} />
					:	<ContextTable entries={view.detail.context} />}
				</div>
			)}
		</div>
	)
}
