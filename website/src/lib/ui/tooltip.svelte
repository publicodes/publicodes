<script lang="ts">
    import { createTooltip, melt } from '@melt-ui/svelte';
    import type { Snippet } from 'svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';
    import { writable } from 'svelte/store';
    import { fade } from 'svelte/transition';

    type TooltipProps = {
        text: Snippet | string;
        children: Snippet;
    } & HTMLButtonAttributes;

    const { text, children, ...rest }: TooltipProps = $props();
    const dialogOpened = writable(false);

    const {
        elements: { trigger, content, arrow },
        states: { open }
    } = createTooltip({
        positioning: {
            placement: 'top'
        },
        arrowSize: 10,
        open: dialogOpened,
        openDelay: 0,
        closeDelay: 0,
        closeOnPointerDown: false,
        forceVisible: true
    });

    function handleMouseEnter() {
        $dialogOpened = true;
    }
</script>

<button {...rest} use:melt={$trigger} onmouseenter={handleMouseEnter}>
    {@render children()}
</button>
{#if $open}
    <div
        use:melt={$content}
        transition:fade={{ duration: 100 }}
        class="rounded border border-slate-300 bg-white text-sm shadow"
    >
        <div class="relative z-20 bg-white px-4 py-3">
            {#if typeof text === 'string'}
                {text}
            {:else}
                {@render text()}
            {/if}
        </div>
        <div class="border border-slate-300 shadow" use:melt={$arrow}></div>
    </div>
{/if}
