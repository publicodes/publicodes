import {
	formatValue,
	type Trace,
	type FormatType,
} from '@publicodes/autodoc-core'
import {
	useId,
	useRef,
	useCallback,
	type ReactNode,
	type CSSProperties,
	type MouseEvent,
	useContext,
} from 'react'
import type * as Ast from '@publicodes/autodoc-core/ast'
import { AutodocEvaluationTraceContext } from './AutodocEvaluationTraceContext'

const TYPE_LABELS: Record<string, string> = {
	number: 'nombre',
	boolean: 'oui/non',
	text: 'texte',
	date: 'date',
}

export function formatType(
	mechanism: Ast.ValueMechanism | Ast.ChainedMechanism,
): string {
	if (!mechanism.type) return ''
	if ('unit' in mechanism && mechanism.unit) return mechanism.unit
	return TYPE_LABELS[mechanism.type] ?? mechanism.type
}

interface MechanismBoxProps {
	mechanism: Ast.ValueMechanism | Ast.ChainedMechanism
	children: ReactNode
	trace?: Trace
}

export function MechanismBox({
	mechanism,
	children,
	trace,
}: MechanismBoxProps): JSX.Element {
	const id = useId()
	const name = `--tt-${id.replaceAll(':', '-')}`
	const boxRef = useRef<HTMLDivElement>(null)
	const popoverRef = useRef<HTMLDivElement>(null)
	const timerRef = useRef<ReturnType<typeof setTimeout>>()
	const label = formatType(mechanism)

	const show = useCallback(
		(e: MouseEvent) => {
			if (!label) return
			const target = e.target as Element
			if (target.closest('.publicodes-mechanism') !== boxRef.current) return
			if (timerRef.current || popoverRef.current?.matches(':popover-open'))
				return
			timerRef.current = setTimeout(() => {
				timerRef.current = undefined
				popoverRef.current?.showPopover()
			}, 300)
		},
		[label],
	)

	const hide = useCallback((e: MouseEvent) => {
		const related = e.relatedTarget as Node | null
		if (related && boxRef.current?.contains(related)) return
		clearTimeout(timerRef.current)
		timerRef.current = undefined
		popoverRef.current?.hidePopover()
	}, [])

	const { contextStackId } = useContext(AutodocEvaluationTraceContext)

	return (
		<>
			{label && (
				<div
					id={id}
					ref={popoverRef}
					popover="hint"
					className="publicodes-type-tooltip"
					style={{ positionAnchor: name } as CSSProperties}
				>
					{label}
					{trace &&
						mechanism.id in trace &&
						contextStackId in trace[mechanism.id] && (
							<div className="publicodes-trace-value">
								{formatValue(trace[mechanism.id][contextStackId], mechanism)}
							</div>
						)}
				</div>
			)}
			<div
				ref={boxRef}
				className={`publicodes-mechanism publicodes-${mechanism.kind}`}
				style={label ? ({ anchorName: name } as CSSProperties) : undefined}
				onMouseOver={show}
				onMouseOut={hide}
			>
				{children}
			</div>
		</>
	)
}
