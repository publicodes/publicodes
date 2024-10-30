import { RulePage } from '@publicodes/react-ui'
import Head from 'next/head'
import Link from 'next/link'
import { styled } from 'styled-components'
import engine from '../engine'

export default function Documentation({ slug }) {
	return (
		<StyledContainer>
			<RulePage
				documentationPath=""
				engine={engine}
				rulePath={slug?.join('/')}
				language="fr"
				renderers={{
					Head,
					Link: ({ to, ...props }) => <Link href={to} {...props} />,
				}}
			/>
		</StyledContainer>
	)
}

export async function getServerSideProps(context) {
	const { slug } = context.params
	return { props: { slug } }
}

export const StyledContainer = styled.div`
	max-width: 1000px;
	margin: 1rem auto;
	padding: 1rem;
`
