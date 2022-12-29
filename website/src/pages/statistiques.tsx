import { useColorMode } from '@docusaurus/theme-common'
import Layout from '@theme/Layout'
import React from 'react'

export default function Statistiques() {
	return (
		<Layout title="Statistiques">
			<main style={{ marginTop: '40px' }}>
				<h1>Statistiques de consultation</h1>
				<IFrame />
				<OptOutForm />
			</main>
		</Layout>
	)
}

function IFrame() {
	const { isDarkTheme } = useColorMode()

	return (
		<>
			<iframe
				plausible-embed=""
				src={`/embeded-plausible/share/publi.codes?auth=EA2slHSJ5y9FMHp5RC9ip&embed=true&theme=${
					isDarkTheme ? 'dark' : 'light'
				}&background=transparent`}
				scrolling="no"
				loading="lazy"
				frameBorder="0"
				style={{ width: '1px', height: '1600px', minWidth: '100%' }}
			></iframe>
			<script async src="/embeded-plausible/js/embed.host.js"></script>
		</>
	)
}

function OptOutForm() {
	const optedOut =
		typeof window !== 'undefined' && localStorage.plausible_ignore === 'true'
	function optOutTracking(evt) {
		if (evt.target.checked) {
			localStorage.plausible_ignore = true
		} else {
			localStorage.clear()
		}
	}

	return (
		<div>
			<p>
				Nous suivons nos statistiques de consultation de manière anonyme sans
				utiliser de cookies. Vous pouvez vous soustraire de ce suivi en cochant
				la case ci-dessous :
			</p>
			<label>
				<input
					type="checkbox"
					onChange={optOutTracking}
					defaultChecked={optedOut}
				/>{' '}
				Je ne souhaite pas participer au suivi d’audience
			</label>
		</div>
	)
}
