import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts,md}'],
	theme: {
		fontFamily: {
			serif: ['Petrona', 'serif'],
			sans: ['Chivo', 'sans-serif'],
			mono: ['Chivo Mono', 'monospace']
		},
		extend: {
			borderRadius: {
				DEFAULT: '0.175rem'
			},
			colors: {
				dark: '#000238',
				'publicodes-orange': '#D15129',
				'publicodes-green': '#23A430',
				primary: {
					50: '#eaf1fa',
					100: '#c9dcf3',
					200: '#bbd3f0',
					300: '#94bae8',
					400: '#2975D1',
					500: '#1b3150',
					600: '#1F4C8A',
					700: '#1F4C8A'
					// 50: '#f0f9fe',
					// 100: '#ddf0fc',
					// 200: '#c3e5fa',
					// 300: '#99d7f7',
					// 400: '#69c0f1',
					// 500: '#46a4eb',
					// 600: '#3188df',
					// 700: '#2975d1',
					// 800: '#275da6',
					// 900: '#244f84',
					// 950: '#1b3150'
				},
				secondary: {
					50: '#fcf5fe',
					100: '#f8e9fe',
					200: '#f1d3fb',
					300: '#e9b0f7',
					400: '#dd80f2',
					500: '#ca50e5',
					600: '#ad2fc6',
					700: '#9424a7',
					800: '#7a2088',
					900: '#661f70',
					950: '#42084a'
				}
			},
			fontWeight: {
				normal: 100,
				light: 300,
				regular: 400,
				medium: 500,
				semibold: 600,
				bold: 700
			},
			typography: (theme) => ({
				DEFAULT: {
					css: {
						li: {
							fontWeight: theme('fontWeight.light')
						},
						p: {
							fontWeight: theme('fontWeight.light'),
							lineHeight: '1.5'
						},
						strong: {
							fontWeight: theme('fontWeight.regular')
						},
						code: {
							'&::before': {
								content: 'none !important'
							},
							'&::after': {
								content: 'none !important'
							},
							border: '1px solid',
							borderRadius: '0.25rem',
							borderColor: theme('colors.slate.200'),
							backgroundColor: theme('colors.slate.100'),
							padding: '0.125rem 0.25rem',
							// color: theme('colors.dark'),
							fontWeight: theme('fontWeight.regular')
						},
						pre: {
							'& code': {
								backgroundColor: 'transparent',
								border: 'none',
								padding: 0
							},
							borderRounding: '0.175rem'
						},
						blockquote: {
							backgroundColor: theme('colors.slate.100'),
							padding: '0.5rem 1rem',
							fontStyle: 'normal',
							'p:first-of-type::before': {
								content: 'none'
							},
							'p:first-of-type::after': {
								content: 'none'
							}
						},
						a: {
							fontWeight: theme('fontWeight.light'),
							color: theme('colors.primary.400'),
							textDecoration: 'none',
							'&:hover': {
								color: theme('colors.primary.500'),
								textDecoration: 'underline'
							}
						},
						h1: {
							fontWeight: theme('fontWeight.normal'),
							color: theme('colors.dark')
						},
						h2: {
							fontWeight: theme('fontWeight.normal'),
							color: theme('colors.dark')
						},
						h3: {
							fontWeight: theme('fontWeight.normal'),
							color: theme('colors.dark')
						},
						h4: {
							fontWeight: theme('fontWeight.normal')
						},
						h5: {
							fontWeight: theme('fontWeight.normal')
						}
					}
				}
			})
		}
	},
	plugins: [typography]
};
