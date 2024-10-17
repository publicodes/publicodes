import screen from '$lib/utils/screen.svelte';
import { fly, slide } from 'svelte/transition';

const duration = 200;

function getTransition() {
    const transitionDirection = getTransitionDirection();
    return {
        in: (node: HTMLElement) =>
            transitionDirection === 'vertical'
                ? fly(node, { y: -50, duration })
                : fly(node, { x: 400, duration }),
        out: (node: HTMLElement) =>
            transitionDirection === 'vertical'
                ? slide(node, { duration })
                : fly(node, { x: 400, duration })
    };
}

const transition = $derived(getTransition());

export default function value() {
    return transition;
}

export function getTransitionDirection() {
    return screen.currentBreakpoint && ['lg', 'sm', 'md'].includes(screen.currentBreakpoint)
        ? 'vertical'
        : 'horizontal';
}
