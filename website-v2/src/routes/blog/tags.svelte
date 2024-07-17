<script lang="ts">
    export let tags: string;

    const splitedTags = tags.split(',').map((tag) => tag.trim());

    const tagsColors: Record<string, string> = {
        'open-data': 'bg-primary-400',
        tech: 'bg-publicodes-green',
        modelisation: 'bg-publicodes-orange'
    };
</script>

<ul class="flex gap-2">
    {#each splitedTags as tag}
        {@const bgColor = tagsColors[tag] ?? 'bg-slate-500'}
        <li class={'h-fit break-keep rounded-sm bg-opacity-10 px-2 py-1 text-slate-700 ' + bgColor}>
            {tag}
        </li>
    {/each}
</ul>
