<script lang="ts">
    import type { IconProps } from 'lucide-svelte';
    import type { ComponentType, SvelteComponent } from 'svelte';

    export let icon: ComponentType<SvelteComponent<IconProps>>;
    export let title: string;
    export let background: string;
    export let items: { subtitle: string; content: string }[];
</script>

<section class={'not-prose flex w-full justify-center py-16 ' + background}>
    <div class="flex max-w-7xl flex-col gap-10">
        <div class="flex items-center gap-4">
            <svelte:component this={icon} size={36} strokeWidth={1} />
            <h2 class="m-0 text-4xl font-normal">{title}</h2>
        </div>
        <div class="flex gap-4">
            {#each items as { subtitle, content }}
                <div class="flex flex-1 flex-col gap-2">
                    <h3 class="text-xl italic">{subtitle}</h3>
                    <p class="text-lg font-normal leading-snug">{content}</p>
                </div>
            {/each}
        </div>
    </div>
</section>
