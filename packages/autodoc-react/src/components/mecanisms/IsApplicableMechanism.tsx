import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'

export interface IsApplicableMechanismProps {
	mecanism: Ast.IsApplicableMechanism
	trace?: Trace
}

export function IsApplicableMechanism(_props: IsApplicableMechanismProps): JSX.Element {
	return <span className="publicodes-mecanism__label">est applicable</span>
}
