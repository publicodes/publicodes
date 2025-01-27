import { RulePage } from '@publicodes/react-ui'
import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useParams,
} from 'react-router-dom'
import { engine, onEngineUpdate } from '../engine'
import { sitemap } from '../sitemap'
import { onSituationUpdate, situations } from '../situations'
import Header from './Header'
import { Error } from './Error'

function RulePageWrapper() {
  let { '*': splat } = useParams()
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
  const [, forceUpdate] = useState({})
  useEffect(() => {
    // Subscribe to engine updates
    return onEngineUpdate(() => forceUpdate({}))
  }, [])
  const [activeSituation, setActiveSituation] = useState('')

  useEffect(() => {
    return onSituationUpdate(() => {
      engine.setSituation(situations[activeSituation] ?? {})
      setActiveSituation(activeSituation in situations ? activeSituation : '')
      forceUpdate({})
    })
  }, [activeSituation])

  function handleSituationChange(situation: string) {
    setActiveSituation(situation)
    engine.setSituation(situations[situation] ?? {})
  }

  return (
    <>
      <BrowserRouter>
        <Header
          setSituation={handleSituationChange}
          activeSituation={activeSituation}
        />
        <div className="container mx-auto px-4">
          <Error />
          <Routes>
            <Route
              path="/"
              element={<Navigate to={Object.keys(sitemap)[0]} replace />}
            />
            <Route path="/*" element={<RulePageWrapper />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  )
}
