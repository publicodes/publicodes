import { getDocumentationSiteMap, RulePage } from '@publicodes/react-ui'
import Engine from 'publicodes'
import { useState } from 'react'
import {
	BrowserRouter,
	Link,
	Navigate,
	Route,
	Routes,
	useParams,
} from 'react-router-dom'
import { useEngine } from '../engine'
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
	const [activeSituation, setActiveSituation] = useState('')
	const { engine, error } = useEngine(activeSituation)
	const sitemap = getDocumentationSiteMap({
		documentationPath: '',
		engine,
	})

	return (
		<>
			<BrowserRouter>
				<Header
					setSituation={setActiveSituation}
					activeSituation={activeSituation}
				/>
				<div className="container mx-auto px-4">
					<Error error={error} />
					<Routes>
						<Route
							path="/"
							element={<Navigate to={Object.keys(sitemap)[0]} replace />}
						/>
						<Route path="/*" element={<RulePageWrapper engine={engine} />} />
					</Routes>
				</div>
			</BrowserRouter>
		</>
	)
}
