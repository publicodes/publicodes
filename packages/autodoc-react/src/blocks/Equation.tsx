import type { EquationView, OperandView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { useAutodocInteraction } from '../components/AutodocInteractionContext'
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
	return (
		<div className="publicodes-equation">
			{view.head && <Row view={view.head} head />}
			{view.rows.map((row, index) => (
				<Row key={index} view={row} />
			))}
			{view.note !== null && (
				<p className="publicodes-detail__note">{view.note}</p>
			)}
		</div>
	)
}

function Row({
	view,
	head = false,
}: {
	view: OperandView
	head?: boolean
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
				(view.key !== null ? ' publicodes-row--unfoldable' : '')
			}
		>
			{indentOf(view.depth)}
			{/* the answer line has no operator column: two cells, its name and its figure */}
			{!head && (
				<>
					<span className="publicodes-row__gutter">
						{view.gutterIsMechanism ?
							<span className="publicodes-row__mechanism">{view.gutter}</span>
						:	view.gutter}
					</span>
					{'\t'}
				</>
			)}
			<span className="publicodes-row__term">
				{view.control === 'term' ?
					control(
						'publicodes-row__control' +
							(view.termIsMechanism ? ' publicodes-row__mechanism' : ''),
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

	// the paper is the block's own background, so it covers the line and the detail
	// both, and the line itself keeps the row's own box. The wrapper is rendered
	// either way: were it to appear only once open, React would replace the row's
	// node on every unfold, and the line would lose its focus and blink.
	return (
		<div
			className={
				'publicodes-block' + (view.detail ? '' : ' publicodes-block--closed')
			}
			data-paper={view.paper}
		>
			{line}
			{view.detail && (
				<div className="publicodes-detail">
					<Equation view={view.detail} />
				</div>
			)}
		</div>
	)
}
