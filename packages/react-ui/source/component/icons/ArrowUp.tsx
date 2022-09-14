interface Props {
	className?: string
}

export const ArrowUp = ({ className }: Props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="#000000"
		className={className}
	>
		<path d="M0 0h24v24H0V0z" fill="none" />
		<path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z" />
	</svg>
)
