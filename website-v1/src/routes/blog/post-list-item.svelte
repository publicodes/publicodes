<script lang="ts">
	import Time from 'svelte-time/Time.svelte';
	import Tags from './tags.svelte';
	type Props = {
		url: string;
		title: string;
		description: string;
		tags: string;
		date: string;
	};
	const { url, title, description, tags, date }: Props = $props();
</script>

<li class="flex flex-col gap-6 py-6">
	<div class="mt-3 flex flex-col gap-3">
		<div class="text-sm font-light">
			<Time class="text-slate-600" format="DD MMMM YYYY" timestamp={date} />
		</div>
		<a
			href={url}
			class="text-xl font-light tracking-tight text-primary-400 hover:text-primary-600 md:text-2xl">
			{title}
		</a>

		<p class="prose font-light leading-snug">
			{description}
		</p>
	</div>
	<span class="text-sm font-light">
		<Tags {tags} />
	</span>
</li>
