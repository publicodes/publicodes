declare module '*.css' {
	const content: string
	export default content
}

declare module '@publicodes/autodoc-core/styles/autodoc.css'

declare namespace React {
	interface HTMLAttributes<T> {
		popover?: string
	}
}
