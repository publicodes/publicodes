import type { ReactElement, ReactNode } from 'react'

/** The author's own text, with the emphasis they wrote. */
const inline = (text: string): ReactNode[] =>
	text
		.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
		.filter(Boolean)
		.map((part, index) =>
			part.startsWith('**') ?
				<strong key={index}>{part.slice(2, -2)}</strong>
			: part.startsWith('*') ?
				<em key={index}>{part.slice(1, -1)}</em>
			:	part,
		)

export const paragraphs = (text: string): ReactElement[] =>
	text
		.split(/\n{2,}/)
		.map((block) => block.trim())
		.filter(Boolean)
		.map((block, index) => <p key={index}>{inline(block)}</p>)

export const firstParagraph = (text: string | null): ReactNode => {
	if (!text) return null
	const [first] = text.split(/\n{2,}/)
	return inline(first.trim())
}
