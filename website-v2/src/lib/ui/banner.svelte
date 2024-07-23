<script lang="ts">
    import type { IconProps } from 'lucide-svelte';
    import type { ComponentType, SvelteComponent } from 'svelte';

    export let icon: ComponentType<SvelteComponent<IconProps>>;
    export let title: string;
    export let background: string;
    export let items: { subtitle: string; content: string }[];
</script>

<section class={' flex w-full justify-center py-16 ' + background}>
    <div class="flex max-w-3xl flex-col gap-10 px-6 md:max-w-5xl xl:max-w-7xl">
        <div class="flex items-center gap-4">
            <svelte:component this={icon} class="hidden md:block" size={36} strokeWidth={1} />
            <h2 class="m-0 text-3xl font-normal md:text-4xl">{title}</h2>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {#each items as { subtitle, content }}
                <div class="prose prose-lg">
                    <h3>{subtitle}</h3>
                    <p class="leading-snug">{content}</p>
                </div>
            {/each}
        </div>
    </div>
</section>
