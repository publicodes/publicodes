import { ChainedValue } from '@publicodes/autodoc-react'
import tjmAutodoc from '../../model.publicodes.json'
let doc = tjmAutodoc as Record<string, any>

export function TJMExamplePage() {
	return (
		<>
			<h1>TJMExamplePage</h1>
			<p>
				Une somme : <code>revenus . salaire + revenus . indépendant</code>
			</p>
			{Object.entries(doc).map(([key, value]) => (
				<div className="demo-block">
					<strong>{key}</strong>
					<ChainedValue key={key} node={value} />
				</div>
			))}
		</>
	)
}
