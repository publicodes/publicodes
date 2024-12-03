<script lang="ts">
	import type { IconProps } from 'lucide-svelte';
	import type { ComponentType, Snippet, SvelteComponent } from 'svelte';

	const {
		light = false,
		type = 'primary',
		icon: Icon,
		children,
		...rest
	}: {
		light?: boolean;
		type?: 'primary' | 'secondary';
		icon?: ComponentType<SvelteComponent<IconProps>>;
		children: Snippet;
	} = $props();

	const iconStrokeWidth = 1.75;
</script>

{#if type === 'primary'}
	<span
		{...rest}
		class="border-1 flex cursor-pointer justify-center whitespace-nowrap
	rounded border border-primary-400 px-3 py-1 font-sans text-lg font-regular text-white
		duration-100 ease-in-out hover:bg-primary-600 md:px-4 md:py-2 md:text-xl"
		class:background={!light}
	>
		{#if Icon}
			<Icon strokeWidth={iconStrokeWidth} />
		{/if}
		{@render children()}
	</span>
{:else}
	<span
		{...rest}
		class="border-1 flex cursor-pointer items-center justify-center gap-2
	whitespace-nowrap rounded border border-primary-400 bg-white px-3 py-1 font-sans
		text-lg font-regular text-primary-400 transition
		duration-100 ease-in-out hover:bg-primary-400
		hover:bg-opacity-5 md:px-4 md:py-2 md:text-xl"
	>
		{#if Icon}
			<Icon strokeWidth={iconStrokeWidth} />
		{/if}
		{@render children()}
	</span>
{/if}

<style>
	.background {
		@apply bg-primary-400 hover:bg-opacity-75;
	}
</style>
