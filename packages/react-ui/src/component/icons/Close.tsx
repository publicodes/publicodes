interface Props {
	className?: string
}

export const Close = ({ className }: Props) => (
	<svg
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="currentcolor"
		className={className}
	>
		<path
			d="M9.04286 8L13 11.9571V13H11.9571L8 9.04286L4.04286 13H3V11.9571L6.95714 8L3 4.04286V3H4.04286L8 6.95714L11.9571 3H13V4.04286L9.04286 8Z"
			fill="currentcolor"
		/>
	</svg>
)
