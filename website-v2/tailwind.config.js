export default {
	content: ['./src/**/*.{html,js,svelte,ts,md}'],
	theme: {
		fontFamily: {
			sans: ['Segoe UI', 'sans-serif'],
			serif: ['Petrona', 'serif']
		},
		extend: {}
	},
	plugins: [require('@tailwindcss/typography')]
};
