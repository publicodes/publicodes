<script lang="ts">
    import { createTooltip, melt } from '@melt-ui/svelte';
    import type { Snippet } from 'svelte';
    import { writable } from 'svelte/store';
    import { fade } from 'svelte/transition';
    const { text, children }: TooltipProps = $props();
    const dialogOpened = writable(false);

    type TooltipProps = {
        text: Snippet;
        children: Snippet;
    };

    const {
        elements: { trigger, content, arrow },
        states: { open }
    } = createTooltip({
        positioning: {
            placement: 'top'
        },
        arrowSize: 8,
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

<button use:melt={$trigger} onmouseenter={handleMouseEnter}>
    {@render children()}
</button>
{#if $open}
    <div
        use:melt={$content}
        transition:fade={{ duration: 100 }}
        class="z-10 rounded bg-primary-50 px-4 py-3 text-sm shadow"
    >
        {@render text()}
        <div use:melt={$arrow}></div>
    </div>
{/if}
