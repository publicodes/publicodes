import Layout from '@theme/Layout'
import BrowserOnly from '@docusaurus/BrowserOnly'
import React, { lazy, Suspense } from 'react'
import styles from './studio.module.css'
const LazyStudio = lazy(() => import('../components/Studio'))

export default function () {
	return (
		<Layout title="Bac à sable">
			<BrowserOnly fallback={<div>Bac à sable Publicodes</div>}>
				{() => (
					<Suspense
						fallback={
							<div className={styles.wrapper}>
								<div className={styles.div1}></div>
								<div className={styles.div2}></div>
								<div className={styles.div3}></div>

								<p>Chargement de l'éditeur en cours...</p>
							</div>
						}
					>
						<LazyStudio />
					</Suspense>
				)}
			</BrowserOnly>
		</Layout>
	)
}
