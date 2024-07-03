import typography from '@tailwindcss/typography';

export default {
    content: ['./src/**/*.{html,js,svelte,ts,md}'],
    theme: {
        fontFamily: {
            sans: ['Segoe UI', 'sans-serif'],
            serif: ['Petrona', 'serif']
        },
        extend: {
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        code: {
                            '&::before': {
                                content: 'none !important'
                            },
                            '&::after': {
                                content: 'none !important'
                            },
                            color: theme('colors.primary.950')
                        },
                        pre: {
                            '& code': {
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: 0
                            }
                        },
                        blockquote: {
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
            }),
            colors: {
                primary: {
                    50: '#f0f9fe',
                    100: '#ddf0fc',
                    200: '#c3e5fa',
                    300: '#99d7f7',
                    400: '#69c0f1',
                    500: '#46a4eb',
                    600: '#3188df',
                    700: '#2975d1',
                    800: '#275da6',
                    900: '#244f84',
                    950: '#1b3150'
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
            }
        }
    },
    plugins: [typography]
};
