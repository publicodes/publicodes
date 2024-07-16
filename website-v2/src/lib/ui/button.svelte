<script lang="ts">
    import type { Snippet } from 'svelte';

    const {
        light = false,
        type = 'primary',
        icon,
        children,
        ...rest
    }: {
        light?: boolean;
        type?: 'primary' | 'secondary';
        icon?: Snippet;
        children: Snippet;
    } = $props();
</script>

{#if type === 'primary'}
    <span
        {...rest}
        class="border-1 flex cursor-pointer justify-center rounded
	border border-primary-400 px-4 py-2 font-sans text-xl font-regular
		text-white duration-100 ease-in-out hover:bg-primary-600"
        class:background={!light}
    >
        {@render children()}
    </span>
{:else}
    <span
        {...rest}
        class="border-1 flex cursor-pointer items-center justify-center gap-2
	rounded border border-primary-400 bg-white px-4 py-2 font-sans text-xl
		font-regular text-primary-400 transition
		duration-100 ease-in-out hover:bg-slate-300 hover:bg-opacity-15"
    >
        {@render children()}
    </span>
{/if}

<style>
    .background {
        @apply bg-primary-400 hover:bg-opacity-75;
    }
</style>
