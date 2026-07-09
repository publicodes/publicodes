import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'

export interface TypeMechanismProps {
	mecanism: Ast.TypeMechanism
	trace?: Trace
}

export function TypeMechanism({
	mecanism,
}: TypeMechanismProps): JSX.Element | null {
	return null
}
