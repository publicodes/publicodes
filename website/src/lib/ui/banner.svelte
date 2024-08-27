<script lang="ts">
    import type { Component } from 'lucide-svelte';

    type Props = {
        icon: typeof Component;
        title: string;
        background: string;
        items: { subtitle: string; content: string }[];
    };

    const { icon: Icon, title, background, items }: Props = $props();
</script>

<section class={'flex w-full justify-center py-20 md:py-32 ' + background}>
    <div class="flex max-w-3xl flex-col gap-10 px-6 md:max-w-5xl xl:max-w-7xl">
        <div class="flex items-center gap-4">
            <Icon class="hidden sm:block" size={36} strokeWidth={1}></Icon>
            <h2 class="m-0 text-3xl font-normal md:text-4xl">{title}</h2>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {#each items as { subtitle, content }}
                <div class="prose prose-lg">
                    <h3 class="italic">{subtitle}</h3>
                    <p class="leading-snug">{content}</p>
                </div>
            {/each}
        </div>
    </div>
</section>
