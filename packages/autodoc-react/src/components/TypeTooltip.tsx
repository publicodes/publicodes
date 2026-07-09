import { formatValue, type Trace, type FormatType } from '@publicodes/autodoc-core'
import {
	useId,
	useRef,
	useCallback,
	type ReactNode,
	type CSSProperties,
} from 'react'
import type * as Ast from '@publicodes/autodoc-core/ast'

const TYPE_LABELS: Record<string, string> = {
	number: 'nombre',
	boolean: 'oui/non',
	text: 'texte',
	date: 'date',
	}

export function formatType(mechanism: Ast.ValueMechanism | Ast.ChainedMechanism): string {
	if (!mechanism.type) return ''
	if ('unit' in mechanism && mechanism.unit) return mechanism.unit
	return TYPE_LABELS[mechanism.type] ?? mechanism.type
}

function toFormatType(
	mechanism: Ast.ValueMechanism | Ast.ChainedMechanism,
): FormatType | null {
	switch (mechanism.type) {
		case 'number':
			return {
				type: 'number',
				unit: 'unit' in mechanism ? mechanism.unit : undefined,
			}
		case 'text':
			return { type: 'text' }
		case 'boolean':
			return { type: 'boolean' }
		case 'date':
			return { type: 'date' }
		default:
			return null
	}
}

interface MechanismBoxProps {
	mechanism: Ast.ValueMechanism | Ast.ChainedMechanism
	children: ReactNode
	trace?: Trace
}

export function MechanismBox({ mechanism, children, trace }: MechanismBoxProps): JSX.Element {
	const id = useId()
	const name = `--tt-${id.replaceAll(':', '-')}`
	const popoverRef = useRef<HTMLDivElement>(null)
	const timerRef = useRef<ReturnType<typeof setTimeout>>()
	const label = formatType(mechanism)
	const spec = toFormatType(mechanism)

	const show = useCallback(() => {
		if (!label) return
		timerRef.current = setTimeout(() => {
			popoverRef.current?.showPopover()
		}, 300)
	}, [label])

	const hide = useCallback(() => {
		clearTimeout(timerRef.current)
		popoverRef.current?.hidePopover()
	}, [])

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
				</div>
			)}
			<div
				className={`publicodes-mechanism publicodes-${mechanism.kind}`}
				style={label ? ({ anchorName: name } as CSSProperties) : undefined}
				onMouseEnter={show}
				onMouseLeave={hide}
			>
				{children}
			</div>
			{trace && spec && (
				<div className="publicodes-trace-value">
					{formatValue(trace[mechanism.id], spec)}
				</div>
			)}
		</>
	)
}
