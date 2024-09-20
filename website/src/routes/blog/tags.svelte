<script lang="ts">
	import Tag from '$lib/ui/tag.svelte';

	export let tags: string;

	const splitedTags = tags.split(',').map((tag) => tag.trim());

	const tagsColors: Record<string, string> = {
		'open-data': 'bg-primary-400',
		tech: 'bg-publicodes-green',
		modelisation: 'bg-publicodes-orange',
		communauté: 'bg-purple-400'
	};
</script>

<ul class="flex gap-2">
    {#each splitedTags as tag}
        {@const bgColor = (tagsColors[tag] ?? 'bg-slate-400') + ' bg-opacity-10'}
        <li>
            <Tag {bgColor}>
                {tag}
            </Tag>
        </li>
    {/each}
</ul>
