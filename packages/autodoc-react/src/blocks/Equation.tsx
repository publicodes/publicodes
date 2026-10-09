import type { EquationView, OperandView } from '@publicodes/autodoc-core'
import { useState, type ReactElement, type ReactNode } from 'react'
import { RuleLink } from './RuleLink'
import { Value } from './Value'
import type { Env } from './types'

/**
 * The computation as rows. One row per operand, its operator in the gutter; a
 * mechanism's keyword is not a row of its own, because the operators and the
 * `si` / `alors` / `sinon` words already say what operation is going on.
 *
 * Terms that had no effect are folded away. A reference unfolds into a fiche:
 * the same layout one gutter further in, on a paper of its own.
 */
export function Equation({
	equation,
	env,
	head,
	depth = 0,
	tail,
}: {
	equation: EquationView
	env: Env
	head?: string
	depth?: number
	/** The controls a fiche adds at the end of this equation, on the fold's line. */
	tail?: ReactNode
}): ReactElement {
	const [showInert, setShowInert] = useState(env.trace === undefined)
	// An expression is a row like any other: its written form is the row, and
	// its operands are what the row opens, rather than rows spliced in here.
	const own = equation.operands
	const inertRows = own.filter((operand) => operand.inert)
	const inertModifiers = equation.modifiers.filter((modifier) => modifier.inert)
	const inertCount = inertRows.length + inertModifiers.length
	const rows = showInert ? own : own.filter((operand) => !operand.inert)

	return (
		<div className="publicodes-equation">
			{head && (
				<div className="publicodes-row publicodes-row--head">
					<span className="publicodes-row__term">{head}</span>
					<Value value={equation.result} />
				</div>
			)}
			{rows.map((operand, index) => (
				<Row key={index} operand={operand} env={env} depth={depth} />
			))}
			{equation.modifiers
				.filter((modifier) => showInert || !modifier.inert)
				.map((modifier, index) => (
					// a modifier is a row like any other: what it applies is written
					// there, and that is what unfolds
					<Row
						key={index}
						operand={modifier.condition}
						env={env}
						depth={depth}
					/>
				))}
			{(inertCount > 0 || tail !== undefined) && (
				<div className="publicodes-foot">
					{inertCount > 0 && (
						<div className="publicodes-fold">
							<button
								type="button"
								aria-expanded={showInert}
								onClick={() => setShowInert(!showInert)}
							>
								{showInert ?
									'Masquer les termes sans effet'
								:	`Afficher ${inertCount} terme${inertCount > 1 ? 's' : ''} sans effet`}
							</button>
						</div>
					)}
					{tail}
				</div>
			)}
		</div>
	)
}

function Row({
	operand,
	env,
	depth,
}: {
	operand: OperandView
	env: Env
	depth: number
}): ReactElement {
	// A reference's detail is the referenced rule's, which the host tracks; a
	// mechanism's own equation has no rule behind it and belongs to the row.
	const [nested, setNested] = useState(false)
	const address = operand.address
	const name = operand.name
	// a term that is only its own value is not printed twice
	const term = operand.term === operand.value.text ? null : operand.term
	const rule =
		address !== null && env.expanded.has(address) ? env.project(address) : null
	const equation = rule?.equation ?? (address === null ? operand.equation : null)
	const open = rule !== null || (address === null && nested)
	const paper = depth % 2 === 0 ? 'white' : 'shade'
	const content =
		(operand.equation?.operands.length ?? 0) +
		(operand.equation?.modifiers.length ?? 0)
	const canOpen = address !== null || content > 0
	const toggle = () =>
		address !== null ? env.toggleExpanded(address) : setNested(!nested)
	// the text of the row is what opens it: its term, or its value when the term
	// is the value
	const label = address !== null && name !== null ? name : term
	const controlInValue = canOpen && label === null

	const control = (
		<button
			type="button"
			className={
				address !== null ? 'publicodes-link' : 'publicodes-row__control'
			}
			aria-expanded={open}
			onClick={toggle}
		>
			{label}
		</button>
	)

	// the two actions a fiche offers sit at the end of its equation, on the line
	// the fold is on
	const tools =
		address !== null ? (
			<div className="publicodes-detail__tools">
				<RuleLink address={address}>Page de la règle</RuleLink>
				<button
					type="button"
					className="publicodes-detail__close"
					aria-label={`Replier ${name} `}
					onClick={toggle}
				>
					Replier
				</button>
			</div>
		) : undefined

	const row = (
		<div
			className={
				'publicodes-row' +
				(operand.inert ? ' publicodes-row--inert' : '') +
				(open ? ' publicodes-row--open' : '')
			}
		>
			<span className="publicodes-row__gutter">
				{operand.keyword ?? operand.operator ?? ''}
			</span>
			<span className="publicodes-row__term">
				{canOpen && !controlInValue ?
					control
				:	term}
			</span>
			{controlInValue ?
				<button
					type="button"
					className="publicodes-row__control publicodes-value"
					aria-expanded={open}
					onClick={toggle}
				>
					<Value value={operand.value} />
				</button>
			:	<Value value={operand.value} />
			}
		</div>
	)

	// the paper is the block's own background, so it covers the line and the
	// detail both, and the line itself keeps the row's own box
	if (!open) return row

	const filled =
		(equation?.operands.length ?? 0) + (equation?.modifiers.length ?? 0) > 0

	return (
		<div className="publicodes-block" data-paper={paper}>
			{row}
			<div className="publicodes-detail">
				{filled && equation ?
					<Equation
						equation={equation}
						env={env}
						depth={depth + 1}
						tail={tools}
					/>
				:	<>
						<p className="publicodes-detail__note">
							Cette règle n’a pas de calcul propre : sa valeur vient du
							contexte.
						</p>
						{tools}
					</>
				}
			</div>
		</div>
	)
}
