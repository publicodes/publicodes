<script lang="ts">
	import { ChevronRight, MessageCircleHeart, X } from 'lucide-svelte';
	let showSurvey = $state(true);
</script>

{#if showSurvey}
	<aside
		class="flex items-center justify-between bg-secondary-600 px-2
    py-1 text-white"
	>
		<div
			class="container mx-auto flex flex-col items-start gap-3 p-2 text-left
    sm:flex-row sm:items-center sm:justify-center sm:text-left"
		>
			<MessageCircleHeart class="hidden sm:inline" strokeWidth={1.5} size={28} />
			<span
				>Aidez-nous à améliorer Publicodes en <span class="font-semibold">5 minutes chrono !</span
				></span
			>
			<a
				href="https://tally.so/r/3yEBlB"
				target="_blank"
				class="border-1 background flex w-fit cursor-pointer items-center
    whitespace-nowrap rounded-full border border-secondary-600
    bg-white bg-gradient-to-r px-4 py-1.5 font-sans text-sm
        font-semibold leading-none text-secondary-600
        duration-100 ease-in-out hover:bg-secondary-900 hover:text-white [&:hover_svg]:translate-x-1"
				>Participer à l'enquête
				<ChevronRight class="inline transition-transform" strokeWidth={2} size={22} />
			</a>
		</div>
		<button
			onclick={() => (showSurvey = false)}
			class="absolute right-4 flex h-fit w-fit items-center
        rounded-full bg-secondary-700 p-2 text-white
    hover:bg-secondary-900 hover:text-white"
		>
			<X class="m-0 inline" size={16} strokeWidth={2} />
		</button>
	</aside>
{/if}
