<script lang="ts">
	import { Newspaper, Rss } from 'lucide-svelte';

	import PostCard from './post-card.svelte';
	import Seo from '$lib/component/seo.svelte';

	const { data } = $props();
	const featuredPosts = data.blogPosts.filter((post) => post.metadata.featured);

	// TODO: factorize icon size et width with other components
	const iconSize = 36;
	const iconStrokeWidth = 1;
</script>

<Seo
	title="Accueil"
	subTitle="Blog"
	description="Découvrez les derniers articles du blog de Publicodes" />

<div class="flex w-full flex-col">
	<section class="flex w-full flex-col items-center gap-16 bg-primary-50">
		<div
			class="not-prose flex w-full max-w-3xl flex-col justify-center
			gap-10 px-6 py-20 lg:max-w-5xl lg:py-24 xl:max-w-7xl">
			<div class="flex gap-4">
				<Rss
					class="hidden md:block"
					size={iconSize}
					strokeWidth={iconStrokeWidth} />
				<h2 class="m-0 text-3xl font-normal md:text-4xl">
					Les derniers articles
				</h2>
			</div>
			<ul class="grid gap-5 lg:grid-cols-2">
				{#each featuredPosts as { path, metadata: { title, description, date, tags } }}
					<PostCard url={path} {title} {description} {date} {tags} />
				{/each}
			</ul>
		</div>
	</section>
	<section class="flex w-full flex-col items-center gap-16">
		<div
			class="not-prose flex w-full flex-col justify-center px-6
			py-20 md:max-w-3xl md:py-24 lg:max-w-5xl xl:max-w-7xl">
			<div class="flex gap-4">
				<Newspaper
					class="hidden md:block"
					size={iconSize}
					strokeWidth={iconStrokeWidth} />
				<h2 class="m-0 text-3xl font-normal md:text-4xl">Tous les articles</h2>
			</div>
			<ul class="grid gap-5 pt-10 lg:grid-cols-2">
				{#each data.blogPosts as { path, metadata: { title, description, tags, date } }}
					<PostCard url={path} {title} {date} {description} {tags} />
				{/each}
			</ul>
		</div>
	</section>
</div>
