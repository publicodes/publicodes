<script lang="ts">
    import type { IconProps } from 'lucide-svelte';
    import type { ComponentType, SvelteComponent } from 'svelte';

    export let icon: ComponentType<SvelteComponent<IconProps>>;
    export let title: string;
    export let background: string;
    export let items: { subtitle: string; content: string }[];
</script>

<section class={'not-prose flex w-full justify-center py-16 ' + background}>
    <div class="flex max-w-3xl flex-col gap-10 px-6 md:max-w-5xl xl:max-w-7xl">
        <div class="flex items-center gap-4">
            <svelte:component this={icon} class="hidden md:block" size={36} strokeWidth={1} />
            <h2 class="m-0 text-3xl font-normal md:text-4xl">{title}</h2>
        </div>
        <div class="flex flex-col gap-8 lg:flex-row lg:gap-4">
            {#each items as { subtitle, content }}
                <div class="flex flex-1 flex-col gap-2">
                    <h3 class="text-xl italic">{subtitle}</h3>
                    <p class="font-normal leading-snug md:text-lg">{content}</p>
                </div>
            {/each}
        </div>
    </div>
</section>
