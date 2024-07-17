<script lang="ts">
    import Tags from './tags.svelte';

    export let url = '';
    export let title = '';
    export let description = '';
    export let tags = '';
</script>

<li class="flex flex-col gap-6 py-6">
    <div class="flex flex-col gap-3">
        <a href={url} class="mt-3 text-2xl tracking-tight text-primary-400 hover:text-primary-600">
            {title}
        </a>
        <p class="text-lg font-normal leading-snug">
            {description}
        </p>
    </div>
    <span class="text-sm font-light">
        <Tags {tags} />
    </span>
</li>
