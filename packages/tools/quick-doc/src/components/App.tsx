import {
	getDocumentationSiteMap,
	RulePage,
	SupportedRenderers,
} from '@publicodes/react-ui'
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
import RuleForm from './RuleForm'

function RulePageWrapper({ engine }: { engine: Engine }) {
	const { '*': splat } = useParams()
	return (
		<RulePage
			engine={engine}
			documentationPath="/doc"
			rulePath={splat as string}
			searchBar={true}
			showDevSection={true}
			language="fr"
			renderers={{ Link: Link as SupportedRenderers['Link'] }}
		/>
	)
}

function RuleFormWrapper({ engine }: { engine: Engine }) {
	const { '*': splat } = useParams()
	const rule = getDocumentationSiteMap({ engine, documentationPath: '' })[
		'/' + splat
	]
	return <RuleForm engine={engine} targetRule={rule} />
}
export default function App() {
	const [activeSituation, setActiveSituation] = useState('')
	const { engine, error } = useEngine(activeSituation)
	const sitemap = getDocumentationSiteMap({
		documentationPath: '/doc',
		engine,
	})

	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route
						path="/:docOrForm/*"
						element={
							<Header
								setSituation={setActiveSituation}
								activeSituation={activeSituation}
							/>
						}
					/>
				</Routes>

				<div className="container mx-auto px-4">
					<Error error={error} />
					<Routes>
						<Route
							path="/"
							element={<Navigate to={`${Object.keys(sitemap)[0]}`} replace />}
						/>
						<Route
							path="/doc/*"
							element={<RulePageWrapper engine={engine} />}
						/>
						<Route
							path="/form/*"
							element={<RuleFormWrapper engine={engine} />}
						/>
					</Routes>
				</div>
			</BrowserRouter>
		</>
	)
}
