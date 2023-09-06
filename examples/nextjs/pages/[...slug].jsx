import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { RulePage } from 'publicodes-react'
import engine from '../engine'
// import engine from '../engine';

export default function Documentation() {
	const router = useRouter()
	if (!router.query.slug) return null
	return (
		<>
			<h1>YOP {router.query.slug?.join('/')}</h1>

			<RulePage
				documentationPath="/documentation"
				engine={engine}
				rulePath={router.query.slug?.join('/')}
				language="fr"
				renderers={{
					Head,
					Link: ({ to, children }) => (
						<Link href={to}>
							<a>{children}</a>
						</Link>
					),
				}}
			/>
		</>
	)
}
