<script lang="ts">
	import 'dayjs/locale/fr';

	import favicon from '$lib/assets/favicon-32x32.png';
	import Logo from '$lib/assets/logo.svg';
	import PublicodesEditor from '$lib/component/publicodes/editor.svelte';
	import Callout from '$lib/ui/callout.svelte';
	import { dayjs } from 'svelte-time';

	import { afterNavigate } from '$app/navigation';
	import { insertDocsearch } from '$lib/search/insert-docsearch';
	import NavTab from '$lib/ui/nav-tab.svelte';
	import { MenuIcon } from 'lucide-svelte';
	import { onMount } from 'svelte';

	import {
		setLastBlogPostDate,
		showBlogPostIndicator
	} from '$lib/model/new-blog-post-indicator.svelte';
	import { fly } from 'svelte/transition';
	import '../app.css';

	/* eslint-disable @typescript-eslint/no-explicit-any */
	(globalThis as any).PublicodesEditor = PublicodesEditor;
	(globalThis as any).Callout = Callout;
	/* eslint-enable @typescript-eslint/no-explicit-any */

	const { children, data } = $props();

	// Set the locale time to French
	dayjs.locale('fr');

	let showMobileMenu = $state(false);

	afterNavigate(() => {
		showMobileMenu = false;
	});
	setLastBlogPostDate(data.lastBlogPostDate);
	onMount(() => {
		insertDocsearch('div#search');
	});
</script>

<svelte:head>
	<title>Publicodes ⋅ Langage pour expert·es et développeur·euses</title>

	<meta
		name="description"
		content="Publicodes permet de modéliser des domaines métiers complexes,
		en les décomposant en règles élémentaires simples qui soient
		lisibles par tout le monde." />
	<link rel="icon" type="image/png" href={favicon} />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@docsearch/css@3" />
</svelte:head>

<div
	class="fixed top-0 z-20 w-screen border-b border-primary-200 bg-white text-cyan-950">
	<div
		class="flex h-16 w-full items-center gap-8 px-6 py-2 lg:container md:px-8 lg:mx-auto lg:justify-between">
		<div class="inline-flex flex-1 items-center gap-8">
			<a
				class="inline-flex shrink-0 items-center gap-2 text-xl font-light hover:text-primary-400"
				href="/">
				<img src={Logo} class="h-7" alt="Logo de publicodes" />
				Publicodes
			</a>
			<div class="hidden sm:block">
				{@render Menu()}
			</div>
		</div>
		<div id="search" class="flex justify-center"></div>
		<!-- <div -->
		<!-- 	class="self-stretch border-b border-primary-100 sm:border-r sm:max-lg:hidden"> -->
		<!-- </div> -->
		<ul
			class="flex flex-row items-start justify-center gap-3
			max-lg:hidden sm:items-center">
			<NavTab
				href="https://matrix.to/#/#publicodes:matrix.org"
				title="Discuter avec la communauté">
				<svg
					class="h-6 w-6 fill-current opacity-75 hover:opacity-100"
					height="32"
					version="1.1"
					viewBox="0 0 27.9 32"
					xmlns="http://www.w3.org/2000/svg">
					<g transform="translate(-.095 .005)">
						<path d="m27.1 31.2v-30.5h-2.19v-0.732h3.04v32h-3.04v-0.732z" />
						<path
							d="m8.23 10.4v1.54h0.044c0.385-0.564 0.893-1.03 1.49-1.37 0.58-0.323 1.25-0.485 1.99-0.485 0.72 0 1.38 0.14 1.97 0.42 0.595 0.279 1.05 0.771 1.36 1.48 0.338-0.5 0.796-0.941 1.38-1.32 0.58-0.383 1.27-0.574 2.06-0.574 0.602 0 1.16 0.074 1.67 0.22 0.514 0.148 0.954 0.383 1.32 0.707 0.366 0.323 0.653 0.746 0.859 1.27 0.205 0.522 0.308 1.15 0.308 1.89v7.63h-3.13v-6.46c0-0.383-0.015-0.743-0.044-1.08-0.0209-0.307-0.103-0.607-0.242-0.882-0.133-0.251-0.336-0.458-0.584-0.596-0.257-0.146-0.606-0.22-1.05-0.22-0.44 0-0.796 0.085-1.07 0.253-0.272 0.17-0.485 0.39-0.639 0.662-0.159 0.287-0.264 0.602-0.308 0.927-0.052 0.347-0.078 0.697-0.078 1.05v6.35h-3.13v-6.4c0-0.338-7e-3 -0.673-0.021-1-0.0114-0.314-0.0749-0.623-0.188-0.916-0.108-0.277-0.3-0.512-0.55-0.673-0.258-0.168-0.636-0.253-1.14-0.253-0.198 0.0083-0.394 0.042-0.584 0.1-0.258 0.0745-0.498 0.202-0.705 0.374-0.228 0.184-0.422 0.449-0.584 0.794-0.161 0.346-0.242 0.798-0.242 1.36v6.62h-3.13v-11.4z" />
						<path d="m0.936 0.732v30.5h2.19v0.732h-3.04v-32h3.03v0.732z" />
					</g>
				</svg>
			</NavTab>
			<NavTab
				href="https://github.com/publicodes/publicodes"
				title="Voir le code source"
				><svg
					class="h-6 w-6 fill-current opacity-75 hover:opacity-100"
					height="17.79"
					width="18.236"
					viewBox="0 0 18.236 17.79">
					<g transform="translate(8 -5.365)">
						<path
							d="M17.013,9.906a9.078,9.078,0,0,0-3.318-3.318A8.918,8.918,0,0,0,9.118,5.365,8.919,8.919,0,0,0,4.541,6.588,9.077,9.077,0,0,0,1.223,9.906,8.919,8.919,0,0,0,0,14.483a8.861,8.861,0,0,0,1.739,5.36,8.93,8.93,0,0,0,4.493,3.294.531.531,0,0,0,.475-.083.464.464,0,0,0,.154-.356q0-.036-.006-.641T6.85,21l-.273.047a3.484,3.484,0,0,1-.659.042,5.02,5.02,0,0,1-.825-.083,1.844,1.844,0,0,1-.8-.356,1.506,1.506,0,0,1-.522-.73l-.119-.273a2.966,2.966,0,0,0-.374-.605,1.432,1.432,0,0,0-.516-.451l-.083-.06a.871.871,0,0,1-.154-.143.651.651,0,0,1-.107-.166q-.036-.083.059-.137a.77.77,0,0,1,.344-.053l.237.035a1.733,1.733,0,0,1,.588.285,1.916,1.916,0,0,1,.576.617,2.093,2.093,0,0,0,.659.742,1.4,1.4,0,0,0,.778.255,3.376,3.376,0,0,0,.677-.059,2.362,2.362,0,0,0,.534-.178,1.924,1.924,0,0,1,.582-1.223,8.129,8.129,0,0,1-1.217-.214,4.845,4.845,0,0,1-1.116-.463,3.2,3.2,0,0,1-.956-.8,3.822,3.822,0,0,1-.623-1.247A5.928,5.928,0,0,1,3.3,14.007a3.463,3.463,0,0,1,.938-2.446A3.192,3.192,0,0,1,4.321,9.14a1.664,1.664,0,0,1,1.021.16,7.138,7.138,0,0,1,.991.457q.315.19.5.321a8.574,8.574,0,0,1,4.559,0l.451-.285a6.389,6.389,0,0,1,1.092-.522,1.556,1.556,0,0,1,.962-.13A3.161,3.161,0,0,1,14,11.562a3.463,3.463,0,0,1,.938,2.446,5.994,5.994,0,0,1-.243,1.787,3.674,3.674,0,0,1-.629,1.247,3.319,3.319,0,0,1-.962.789,4.855,4.855,0,0,1-1.116.463,8.121,8.121,0,0,1-1.217.214,2.115,2.115,0,0,1,.617,1.686v2.5a.473.473,0,0,0,.149.356.516.516,0,0,0,.469.083A8.929,8.929,0,0,0,16.5,19.842a8.863,8.863,0,0,0,1.739-5.36A8.926,8.926,0,0,0,17.013,9.906Z"
							transform="translate(-8 0)"></path>
					</g>
				</svg>
			</NavTab>
			<NavTab
				href="https://bsky.app/profile/publicodes.bsky.social"
				title="Suivre sur Bluesky">
				<svg
					class="h-6 w-6 fill-current opacity-75 hover:opacity-100"
					viewBox="0 0 568 501">
					<path
						d="M123.121 33.6637C188.241 82.5526 258.281 181.681 284 234.873C309.719 181.681 379.759 82.5526 444.879 33.6637C491.866 -1.61183 568 -28.9064 568 57.9464C568 75.2916 558.055 203.659 552.222 224.501C531.947 296.954 458.067 315.434 392.347 304.249C507.222 323.8 536.444 388.56 473.333 453.32C353.473 576.312 301.061 422.461 287.631 383.039C285.169 375.812 284.017 372.431 284 375.306C283.983 372.431 282.831 375.812 280.369 383.039C266.939 422.461 214.527 576.312 94.6667 453.32C31.5556 388.56 60.7778 323.8 175.653 304.249C109.933 315.434 36.0535 296.954 15.7778 224.501C9.94525 203.659 0 75.2916 0 57.9464C0 -28.9064 76.1345 -1.61183 123.121 33.6637Z"
						transform="translate(0 -0.001)"></path>
				</svg>
			</NavTab>
		</ul>
		<button
			class="text-primary-400 hover:text-primary-600 sm:hidden"
			onclick={() => (showMobileMenu = true)}>
			<MenuIcon size={24} />
		</button>
	</div>
</div>

{#if showMobileMenu}
	<div
		role="dialog"
		class="fixed right-0 top-0 z-40 h-full border-l
        border-primary-300 bg-white will-change-transform sm:hidden"
		transition:fly={{ x: 100 }}>
		{@render Menu()}
	</div>
	<div
		class="fixed inset-0 z-20 sm:hidden"
		aria-hidden="true"
		onclick={() => (showMobileMenu = false)}>
	</div>
{/if}

<div
	class="flex h-full flex-col pt-16"
	class:blur-sm={showMobileMenu}
	class:opacity-50={showMobileMenu}>
	<div class="flex-1">
		{@render children()}
	</div>
	{@render Footer()}
</div>

{#snippet Menu()}
	<nav class="flex flex-col justify-between gap-6 p-6 sm:flex-row sm:p-0">
		<ul
			class="flex flex-col items-start justify-center gap-3 sm:flex-row sm:items-center">
			<NavTab href="/docs">Docs</NavTab>
			<NavTab href="/bibliotheque">Bibliothèque</NavTab>
			<NavTab href="/realisations">Réalisations</NavTab>
			<NavTab href="/studio">Studio</NavTab>

			<NavTab class="relative" href="/blog">
				Blog
				{#if showBlogPostIndicator()}
					<span
						aria-label="Nouvel article"
						class="absolute -right-1.5 top-0 flex h-1.5 w-1.5">
						<span
							class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-300 opacity-75"
						></span>
						<span
							class="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-400"
						></span>
					</span>
				{/if}
			</NavTab>
		</ul>
	</nav>
{/snippet}

{#snippet Footer()}
	<footer
		class="flex w-full flex-col items-center border-t border-primary-200 py-10">
		<div
			class="flex w-full flex-col items-start gap-8 px-6 md:container md:flex-row md:justify-between">
			<div class="flex flex-col gap-2">
				<span class="inline-flex items-center gap-2 text-2xl font-light">
					<img src={Logo} class="h-7" alt="Logo de publicodes" />
					Publicodes
				</span>
				<p class="text-lg font-normal text-dark">
					Collaboratif, accessible et ouvert.
				</p>
			</div>
			<div class="flex flex-row gap-16">
				<div class="flex flex-col gap-2">
					<p class="font-light text-slate-500">Ressources</p>
					<ul class="flex flex-col gap-1 font-light">
						<!-- <li>
                        <a href="/docs">À propos</a>
                    </li> -->
						<li>
							<a href="/docs">Documentation</a>
						</li>
						<li>
							<a href="/bibliotheque">Bibliothèque</a>
						</li>
						<li>
							<a href="/realisations">Réalisations</a>
						</li>
						<li>
							<a
								target="_blank"
								href="https://dashboard.simpleanalytics.com/publi.codes"
								aria-label="Statistiques de consultation, nouvelle fenêtre"
								>Statistiques</a>
						</li>
						<!-- <li>
                        <a href="/docs">FAQ</a>
                    </li> -->
					</ul>
				</div>
				<div class="flex flex-col gap-2">
					<p class="font-light text-slate-500">Communauté</p>
					<ul class="flex flex-col gap-1 font-light">
						<li>
							<a href="https://matrix.to/#/#publicodes:matrix.org">Matrix</a>
						</li>
						<li>
							<a href="https://github.com/publicodes/publicodes" target="_blank"
								>GitHub</a>
						</li>
						<li>
							<a href="/blog">Blog</a>
						</li>
						<li>
							<a href="https://bsky.app/profile/publicodes.bsky.social"
								>Bluesky</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</footer>
	<!-- Simple analytics -->
	<script
		async
		defer
		src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
	<script
		async
		data-collect="outbound"
		src="https://scripts.simpleanalyticscdn.com/auto-events.js"></script>
	<noscript
		><img
			src="https://queue.simpleanalyticscdn.com/noscript.gif"
			alt=""
			referrerpolicy="no-referrer-when-downgrade" /></noscript>
{/snippet}

<style>
	footer a {
		@apply text-sm hover:text-primary-400;
	}
</style>
