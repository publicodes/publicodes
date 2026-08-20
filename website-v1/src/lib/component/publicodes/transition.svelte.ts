import screen from '$lib/utils/screen.svelte';
import { fly, slide } from 'svelte/transition';

const duration = 200;

export default function value(fullPage: boolean) {
	const transitionDirection = getTransitionDirection();
	return {
		in: (node: HTMLElement) =>
			transitionDirection === 'vertical'
				? fly(node, { y: 50 * (fullPage ? 1 : -1), duration })
				: fly(node, { x: 400, duration }),
		out: (node: HTMLElement) =>
			transitionDirection === 'vertical'
				? slide(node, { duration })
				: fly(node, { x: 400, duration })
	};
}

export function getTransitionDirection() {
	return screen.currentBreakpoint &&
		['lg', 'sm', 'md'].includes(screen.currentBreakpoint)
		? 'vertical'
		: 'horizontal';
}
