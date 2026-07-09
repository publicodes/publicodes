import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'

export interface IsNotApplicableMechanismProps {
	mecanism: Ast.IsNotApplicableMechanism
	trace?: Trace
}

export function IsNotApplicableMechanism(_props: IsNotApplicableMechanismProps): JSX.Element {
	return <span className="publicodes-mecanism__label">n'est pas applicable</span>
}
