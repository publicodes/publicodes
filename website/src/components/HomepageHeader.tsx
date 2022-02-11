import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import clsx from 'clsx'
import styles from './HomepageHeader.module.css'
import React from 'react'

export default function HomepageHeader() {
	const { siteConfig } = useDocusaurusContext()
	return (
		<header className={clsx('hero hero--primary', styles.heroBanner)}>
			<div className="container">
				<h1 className="hero__title">{siteConfig.title}</h1>
				<p className="hero__subtitle">{siteConfig.tagline}</p>
				<div className={styles.buttons}>
					<Link
						className="button button--secondary button--lg"
						to="/docs/principes-de-base"
					>
						Découvrir le langage
					</Link>
				</div>
			</div>
		</header>
	)
}
