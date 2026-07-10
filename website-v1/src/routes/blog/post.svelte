<script lang="ts">
	import Time from 'svelte-time/Time.svelte';

	export let title = '';
	export let date = '';
</script>

<article>
	<div class="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:pt-24 lg:px-8">
		<div class="text-center">
			<h1
				class="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
				{title}
			</h1>
			<p class="mx-auto mt-3 max-w-xl text-xl text-gray-900">
				<Time timestamp={date}></Time>
			</p>
		</div>
	</div>

	<section class="w-full bg-white px-4 pb-16">
		<div class="prose mx-auto max-w-6xl text-gray-900">
			<slot />
		</div>
	</section>
</article>
