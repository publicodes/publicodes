<script lang="ts">
	import { page } from '$app/stores';
	import PublicodesEditor from '$lib/component/publicodes/editor.svelte';
	import Tag from '$lib/ui/tag.svelte';
	import { Link } from 'lucide-svelte';
	import { utils } from 'publicodes';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	const defaultCode = `
# Bienvenue dans le bac à sable du langage publicode !
# Pour apprendre le langage :
# => https://publi.codes/docs/tutoriel
`;

	let initialCode: string = $state('');
	function updateUrl(code: string, selectedRule?: string) {
		const url = new URL(window.location.href);

		url.pathname = '/studio';
		if (selectedRule) {
			url.pathname += '/' + utils.encodeRuleName(selectedRule);
		}

		if (code !== defaultCode) {
			url.hash = encodeURIComponent(code);
		}
		window.history.replaceState({}, '', url.toString());
	}

	onMount(() => {
		const codeFromUrl =
			new URLSearchParams(window.location.search).get('code') ??
			decodeURIComponent(window.location.hash.substring(1));
		if (codeFromUrl) {
			initialCode = codeFromUrl;
		} else {
			initialCode = defaultCode;
		}
	});

	const selectedRuleInDoc =
		utils.decodeRuleName($page.params.rules) || undefined;

	let copied = $state(false);
	function handleCopyLink() {
		navigator.clipboard.writeText(window.location.href);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 3000);
	}
</script>

<div class="">
	<div class="publicodes-container flex h-[94vh] flex-1 flex-col">
		{#if initialCode}
			<PublicodesEditor
				code={initialCode}
				onchange={updateUrl}
				showDoc={!!selectedRuleInDoc || initialCode === defaultCode}
				title={'Studio'}
				fullPage={true}
				{selectedRuleInDoc}>
				{#snippet additionnalButton(iconSize: number)}
					{#if copied}
						<div
							in:fly={{ x: 10 }}
							out:fly={{ duration: 75 }}
							class="absolute right-32 will-change-transform">
							<Tag>Lien copié !</Tag>
						</div>
					{/if}
					<button
						class="flex items-center justify-center border-l
						border-primary-200 text-primary-500"
						title="Lien de partage"
						onclick={handleCopyLink}
						aria-label="Copier le lien de partage">
						<Link strokeWidth={1.5} size={iconSize} />
					</button>
				{/snippet}
			</PublicodesEditor>
		{/if}
	</div>
</div>

<style>
	.publicodes-container > :global(:first-child) {
		@apply flex-1 rounded-none border-none;
	}
</style>
