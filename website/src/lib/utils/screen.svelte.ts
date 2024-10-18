import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);
type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
const screen: { currentBreakpoint: Breakpoint | undefined } = $state({
    currentBreakpoint: undefined
});
if (typeof window !== 'undefined') {
    (
        [
            // [window.matchMedia(`(max-width: ${fullConfig.theme.screens.sm})`), 'xs'],
            [window.matchMedia(`(max-width: ${fullConfig.theme.screens.md})`), 'sm'],
            [
                window.matchMedia(
                    `(min-width: ${fullConfig.theme.screens.md}) and (max-width: ${fullConfig.theme.screens.lg})`
                ),
                'md'
            ],
            [
                window.matchMedia(
                    `(min-width: ${fullConfig.theme.screens.lg}) and (max-width: ${fullConfig.theme.screens.xl})`
                ),
                'lg'
            ],
            [
                window.matchMedia(
                    `(min-width: ${fullConfig.theme.screens.xl}) and (max-width: ${fullConfig.theme.screens['2xl']})`
                ),
                'xl'
            ],
            [window.matchMedia(`(min-width: ${fullConfig.theme.screens['2xl']})`), '2xl']
        ] as const
    ).forEach(([matchMedia, breakpoint]) => {
        if (matchMedia.matches) {
            screen.currentBreakpoint = breakpoint;
        }
        matchMedia.addEventListener('change', () => {
            if (matchMedia.matches) {
                screen.currentBreakpoint = breakpoint;
            }
        });
    });
}

export default screen;
