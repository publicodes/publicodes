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
	useContext,
} from 'react'
import type * as Ast from '@publicodes/autodoc-core/ast'
import { AutodocContext } from './AutodocContext'

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
	const popoverRef = useRef<HTMLDivElement>(null)
	const timerRef = useRef<ReturnType<typeof setTimeout>>()
	const label = formatType(mechanism)

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

	const { contextStackId } = useContext(AutodocContext)

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
				className={`publicodes-mechanism publicodes-${mechanism.kind}`}
				style={label ? ({ anchorName: name } as CSSProperties) : undefined}
				onMouseEnter={show}
				onMouseLeave={hide}
			>
				{children}
			</div>
		</>
	)
}
