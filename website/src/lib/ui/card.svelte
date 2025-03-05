<script lang="ts">
	import { ExternalLink } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	type CardProps = {
		img: string;
		url: string;
		title: Snippet;
		children: Snippet;
		role?: string;
	};

	const { img, url, title, children, role }: CardProps = $props();
</script>

<div
	class="relative flex flex-1 flex-col overflow-hidden rounded-sm bg-white outline
    outline-1 outline-primary-300 hover:outline-primary-400"
	{role}
>
	<div class="relative pt-[52.63%]">
		<img
			src={img}
			alt=""
			class="absolute inset-0 h-full w-full object-contain"
		/>
	</div>
	<div class="flex flex-1 flex-col gap-2 border-t border-primary-300 p-5">
		<a
			target="_blank"
			class="after:contents-[''] items-center text-xl text-primary-400 after:absolute
		after:bottom-0 after:left-0 after:right-0 after:top-0 hover:text-primary-600"
			href={url}
		>
			<div class="title">
				{@render title()}
				<ExternalLink size={16}></ExternalLink>
			</div>
		</a>
		<div class="prose flex flex-1 flex-col">{@render children()}</div>
	</div>
</div>

<style>
	.title :global(*) {
		display: inline;
		vertical-align: middle;
	}
</style>
