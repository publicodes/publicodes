import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { RulePage } from 'publicodes-react'
import engine from '../engine'

export default function Documentation() {
	const router = useRouter()
	if (!router.query.slug) return null
	return (
		<RulePage
			documentationPath="/"
			engine={engine}
			rulePath={router.query.slug?.join('/')}
			language="fr"
			renderers={{
				Head,
				Link: ({ to, children }) => <Link href={to}>{children}</Link>,
			}}
		/>
	)
}
