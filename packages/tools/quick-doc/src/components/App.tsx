import { getDocumentationSiteMap, RulePage } from '@publicodes/react-ui'
import Engine from 'publicodes'
import {
	BrowserRouter,
	Link,
	Navigate,
	Route,
	Routes,
	useParams,
} from 'react-router-dom'
import { useAppState } from '../app-state'
import { Error } from './Error'
import Header from './Header'
import React from 'react'

function RulePageWrapper({ engine }: { engine: Engine }) {
	const { '*': splat } = useParams()
	return (
		<RulePage
			engine={engine}
			documentationPath=""
			rulePath={splat}
			searchBar={true}
			showDevSection={true}
			language="fr"
			renderers={{ Link: Link }}
		/>
	)
}

export default function App() {
	const [state, setCurrentSituation] = useAppState()
	const sitemap = getDocumentationSiteMap({
		documentationPath: '',
		engine: state.engine,
	})
	return (
		<>
			<BrowserRouter>
				<Header setSituation={setCurrentSituation} state={state} />
				<div className="container mx-auto px-4">
					<Error error={state.error} />
					<Routes>
						<Route
							path="/"
							element={<Navigate to={Object.keys(sitemap)[0]} replace />}
						/>
						<Route
							path="/*"
							element={<RulePageWrapper engine={state.engine} />}
						/>
					</Routes>
				</div>
			</BrowserRouter>
		</>
	)
}
