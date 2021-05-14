import Layout from '@theme/Layout'
import BrowserOnly from '@docusaurus/BrowserOnly'
import React, { lazy, Suspense } from 'react'

const LazyStudio = lazy(() => import('../components/Studio'))

export default function () {
	return (
		<Layout title="Bac à sable">
			<BrowserOnly fallback={<div>Bac à sable Publicodes</div>}>
				{() => (
					<Suspense fallback={<div>Chargement en cours...</div>}>
						<LazyStudio />
					</Suspense>
				)}
			</BrowserOnly>
		</Layout>
	)
}
