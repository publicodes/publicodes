import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'

export interface TypeMechanismProps {
	mechanism: Ast.TypeDef
	trace?: Trace
}

export function TypeMechanism(
	_props: TypeMechanismProps,
): JSX.Element | null {
	return null
}
