<script>
	const { light = false, ...rest } = $props();
</script>

<a
	{...rest}
	class="text-md border-1 mt-8 inline-block rounded-lg border border-blue-100 px-4 py-2 text-white shadow-md transition duration-300 ease-in-out hover:shadow-lg"
	class:background={!light}
>
	<slot></slot>
</a>

<style>
	.background {
		@apply bg-blue-600 hover:bg-blue-700;
	}
</style>
