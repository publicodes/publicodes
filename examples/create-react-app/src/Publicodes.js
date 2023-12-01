import { RulePage } from '@publicodes/react-ui'
import Engine from 'publicodes'
import { useEffect, useState } from 'react'
import {
	Link,
	Redirect,
	Route,
	BrowserRouter as Router,
} from 'react-router-dom'
import { parse } from 'yaml'

async function initEngine(setEngine) {
	const response = await fetch('/CO2-douche.publicodes.yaml')
	const rules = await response.text()
	// WARNING ! The parsing from yaml should not be done in the browser,
	// but at compile time
	setEngine(new Engine(parse(rules)))
}
export default function Publicodes() {
	const [engine, setEngine] = useState(null)
	useEffect(() => {
		initEngine(setEngine)
	}, [setEngine])

	if (!engine) {
		return 'Chargement des règles de calculs en cours...'
	}

	return (
		<Router>
			<Redirect from="/" to="/douche" />
			<Route
				path="/:name+"
				render={({ match }) => (
					<RulePage
						engine={engine}
						documentationPath=""
						rulePath={match.params.name}
						renderers={{ Link }}
					/>
				)}
			/>
		</Router>
	)
}
