<script lang="ts">
	import Tag from '$lib/ui/tag.svelte';

	export let tags: string;

	const splitedTags = tags
		.split(',')
		.map((tag) => tag.trim())
		.sort((a, b) => a.localeCompare(b));

	const tagsColors: Record<string, string> = {
		'open-data': 'bg-primary-400',
		tech: 'bg-publicodes-green',
		modelisation: 'bg-publicodes-orange',
		communauté: 'bg-publicodes-green',
		V2: 'bg-yellow-500',
		nouveautés: 'bg-secondary-500',
		langage: 'bg-primary-400'
	};
</script>

<ul class="flex gap-2">
	{#each splitedTags as tag}
		{@const className = tagsColors[tag] + ' bg-opacity-15'}
		<li>
			<Tag class={className}>
				{tag}
			</Tag>
		</li>
	{/each}
</ul>
