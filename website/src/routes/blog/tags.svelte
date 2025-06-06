<script lang="ts">
	import Tag from '$lib/ui/tag.svelte'

	export let tags: string

	const splitedTags = tags.split(',').map((tag) => tag.trim())

	const tagsColors: Record<string, string> = {
		'open-data': 'bg-primary-400',
		tech: 'bg-publicodes-green',
		modelisation: 'bg-publicodes-orange',
		communauté: 'bg-publicodes-green',
		v2: 'bg-publicodes-orange',
		nouveautés: 'bg-secondary-500',
		langage: 'bg-primary-400'
	}
</script>

<ul class="flex gap-2">
	{#each splitedTags as tag}
		{@const className = tagsColors[tag] + ' bg-opacity-10'}
		<li>
			<Tag class={className}>
				{tag}
			</Tag>
		</li>
	{/each}
</ul>
