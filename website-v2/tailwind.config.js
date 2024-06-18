export default {
    content: ['./src/**/*.{html,js,svelte,ts,md}'],
    theme: {
        fontFamily: {
            sans: ['Segoe UI', 'sans-serif'],
            serif: ['Petrona', 'serif']
        },
        extend: {
            typography: {
                DEFAULT: {
                    css: {
                        blockquote: {
                            'font-style': 'normal',
                            'border-left': 'none',
                            'padding-left': '0',
                            'border-radius': '1rem',
                            padding: '0.5rem',
                            'background-color': 'whitesmoke',
                            p: {
                                margin: '0.5rem'
                            },
                            'p:first-of-type::before': {
                                content: 'none'
                            },
                            'p:first-of-type::after': {
                                content: 'none'
                            }
                        }
                    }
                }
            }
        }
    },
    plugins: [require('@tailwindcss/typography')]
};
