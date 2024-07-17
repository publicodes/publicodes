<script lang="ts">
    import type { Snippet } from 'svelte';

    type CardProps = {
        img: string;
        url: string;
        title: Snippet;
        description: Snippet;
    };

    const { img, url, title, description }: CardProps = $props();
</script>

<li
    class="relative flex flex-1 flex-col rounded-sm bg-white outline outline-1
    outline-primary-300 hover:outline-primary-400"
>
    <img src={img} alt="" class="flex-2 rounded-t object-cover" />
    <div class="flex flex-1 flex-col gap-2 border-t border-primary-300 p-5">
        <a
            target="_blank"
            class="after:contents-[''] text-xl text-primary-400 after:absolute
		after:bottom-0 after:left-0 after:right-0 after:top-0 hover:text-primary-600"
            href={url}
        >
            {title}
        </a>
        <p class="prose font-light leading-snug">{description}</p>
    </div>
</li>

<style>
</style>
