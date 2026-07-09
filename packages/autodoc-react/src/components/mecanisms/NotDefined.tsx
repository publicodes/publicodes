import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'

export interface NotDefinedProps {
	mecanism: Ast.NotDefined
	trace?: Trace
}

export function NotDefined(_props: NotDefinedProps): JSX.Element {
	return <em>valeur non définie</em>
}
