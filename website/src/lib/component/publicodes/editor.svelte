<script lang="ts">
	import { yaml } from '@codemirror/lang-yaml';
	import { tomorrow } from 'thememirror';

	import Tag from '$lib/ui/tag.svelte';
	import screen from '$lib/utils/screen.svelte';
	import {
		ClipboardCopy,
		PanelBottomClose,
		PanelBottomOpen,
		PanelRightClose,
		PanelRightOpen
	} from 'lucide-svelte';
	import { type Snippet } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { fly } from 'svelte/transition';
	import { createEngine } from './create-engine';
	import FlyInOutTransition from './fly-in-out-transition.svelte';
	import getTransition, { getTransitionDirection } from './transition.svelte';

	let {
		code = '',
		title = '',
		selectedRuleInDoc,
		showDoc = false,
		hideDocButton = false,
		onchange,
		size = 'md',
		fullPage = false,
		additionnalButton
	}: {
		code: string;
		title: string;
		selectedRuleInDoc?: string;
		showDoc?: boolean;
		hideDocButton?: boolean;
		onchange?: (code: string, currentlySelected?: string) => void;
		size?: 'md' | 'lg';
		fullPage?: boolean;
		additionnalButton?: Snippet<[iconSize: number]>;
	} = $props();

	let copied = $state(false);

	let iconSize = $derived((size === 'md' ? 20 : 26) - (screen.currentBreakpoint === 'sm' ? 4 : 0));
	let iconStrokeWidth = 1.5;

	function handleCopy() {
		navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 3000);
	}

	const { in: transitionIn, out: transitionOut } = $derived(getTransition(fullPage));
	let { engine, error, warning } = $derived(createEngine(code));
	const selectedRule: string | undefined = $derived.by(() => {
		if (engine && !(selectedRuleInDoc && selectedRuleInDoc in engine.getParsedRules())) {
			return Object.keys(engine.getParsedRules()).at(-1);
		}
		return selectedRuleInDoc;
	});

	const documentationIsBroken = $derived(!engine || !Object.keys(engine.getParsedRules()).length);
	$effect(() => {
		onchange?.(code, showDoc ? selectedRule : undefined);
	});
</script>

<div
	class="editor-container not-prose flex flex-col overflow-hidden
	border border-primary-100 sm:rounded"
	class:mb-4={!fullPage}
>
	<div
		class="editor-header relative flex shrink-0 items-center overflow-hidden
		border-b border-primary-200 bg-primary-50 text-center"
	>
		<button
			class="flex items-center justify-center border-r border-primary-200 text-primary-500"
			title="Copier"
			onclick={handleCopy}
			aria-label="Copier le code"
		>
			<ClipboardCopy strokeWidth={iconStrokeWidth} size={iconSize} />
		</button>

		{#if copied}
			<div
				in:fly={{ x: -10 }}
				out:fly={{ duration: 75 }}
				class="absolute left-16 will-change-transform"
			>
				<Tag {size}>Code copié !</Tag>
			</div>
		{/if}
		<span
			class="flex-1 font-mono font-regular text-primary-500 xl:p-2 xl:text-lg {size === 'lg'
				? 'lg:text-lg xl:text-xl'
				: 'max-md:text-sm'}"
			class:p-3={size === 'lg'}
		>
			{title}
		</span>
		{#if additionnalButton}
			{@render additionnalButton(iconSize)}
		{/if}
		{#if !hideDocButton}
			<button
				transition:fly
				class="border-l border-primary-200 text-primary-500"
				onclick={() => (showDoc = !showDoc)}
				aria-label={showDoc ? 'Fermer la documentation' : 'Ouvrir la documentation'}
				class:saturate-0={documentationIsBroken}
				disabled={documentationIsBroken}
				class:text-slate-400={documentationIsBroken}
			>
				<FlyInOutTransition condition={showDoc && !documentationIsBroken}>
					{#snippet ifTrue()}
						{#if getTransitionDirection() === 'horizontal'}
							<PanelRightClose strokeWidth={iconStrokeWidth} size={iconSize} />
						{:else}
							<PanelBottomClose strokeWidth={iconStrokeWidth} size={iconSize} />
						{/if}
					{/snippet}
					{#snippet ifFalse()}
						{#if getTransitionDirection() === 'horizontal'}
							<PanelRightOpen strokeWidth={iconStrokeWidth} size={iconSize} />
						{:else}
							<PanelBottomOpen strokeWidth={iconStrokeWidth} size={iconSize} />
						{/if}
					{/snippet}
				</FlyInOutTransition>
			</button>
		{/if}
	</div>
	<div class="editor flex flex-1 flex-col xl:flex-row">
		<div
			class="z-10 flex flex-1 flex-col overflow-auto bg-white max-xl:border-b"
			style="margin-bottom: -1px"
		>
			<CodeMirror
				bind:value={code}
				lang={yaml()}
				useTab
				lineWrapping
				theme={tomorrow}
				editable={true}
				class={size}
				styles={{
					'&': {
						fontSize: 'inherit'
					}
				}}
			/>
			<ul class="sticky bottom-0">
				{#each [...warning, ...error] as message}
					<li class="flex whitespace-pre-line bg-yellow-100" in:fly>
						<span class="w-14 border-r bg-primary-50"></span>
						<span class="max-h-40 flex-1 overflow-auto p-2 first-line:font-regular">{message}</span>
					</li>
				{/each}
			</ul>
		</div>
		{#await import('./doc.svelte') then doc}
			{#if engine && selectedRule && showDoc}
				<div
					class="publicodes-documentation"
					style="margin-top: 1px"
					in:transitionIn
					out:transitionOut
				>
					<doc.default
						{engine}
						{selectedRule}
						onchange={(selectedRule) => {
							onchange?.(code, selectedRule);
						}}
					></doc.default>
				</div>
			{/if}
		{/await}
	</div>
</div>

<style>
	/* TODO use something else */
	@media (min-width: 1280px) {
		.publicodes-documentation {
			max-width: 55%;
		}
	}
	.publicodes-documentation {
		@apply bg-slate-50;

		transition:
			opacity 0.1s,
			transform 0.1s;

		/* @apply -mb-4; */
		@apply flex max-xl:flex-col max-lg:px-4 xl:border-l;
		@apply overflow-auto xl:w-fit;

		/* &:not(.showDoc) {
            @apply absolute;
            @apply invisible opacity-0 max-xl:translate-y-10 xl:translate-x-64;
        } */

		& :global {
			h1 {
				@apply my-2 text-xl font-regular;
				/* @apply hidden; */
			}

			h2 {
				@apply -mx-4 border-t p-4 font-regular;
			}
			h3 {
				@apply pb-2 pt-4 font-regular;
			}

			p {
				@apply my-3 font-light;
			}
			li {
				@apply my-0;
			}
			button[aria-label] {
				@apply mx-2 cursor-pointer rounded border border-primary-100 bg-primary-50 px-1 py-1 text-xs hover:border-primary-200 hover:bg-primary-100;
			}
			button:not([aria-label]) {
				@apply cursor-pointer p-1 font-sans hover:underline;
			}

			/* Custom styling of rules list menu + layout */
			:not(.content, h1) > a {
				@apply text-primary-400 hover:text-opacity-75;
			}
			.content > a {
				@apply min-w-10 flex-1 p-2 pl-0 pr-4;
			}
			.content {
				@apply flex p-0 hover:text-primary-400;
			}
			.content.active {
				@apply bg-slate-50 font-regular text-primary-400;
			}

			.content::before {
				margin-left: 0.5rem !important;
				margin-right: 0.5rem !important;
				@apply mx-2 scale-75;
			}
			.content > button[aria-label] {
				@apply h-full rounded border-0 text-center opacity-90 will-change-transform;
				margin: 0 !important;
				padding: 0 !important;
				background: none !important;
				opacity: 0.5;
			}

			article {
				@apply w-full flex-1 pt-2 lg:pr-4 xl:border-l-0 2xl:border-r;
			}
			div[tabindex] {
				@apply h-full bg-white;
			}
			nav {
				@apply h-full overflow-hidden border-r-0 p-2 lg:max-xl:border-r xl:max-2xl:border-t 2xl:max-w-64;
			}
			#documentation-rule-root {
				@apply flex-1 items-stretch overflow-y-auto overflow-x-hidden xl:flex xl:h-full xl:flex-col-reverse xl:max-2xl:items-start 2xl:flex-row-reverse;

				& > * {
					@apply max-w-full xl:max-2xl:w-full;
				}

				@media (min-width: 1024px) {
					& > div {
						z-index: 1 !important;
					}
				}
			}

			#rules-nav-open-nav-button ~ span {
				@apply text-sm;
			}
			#rules-nav-open-nav-button button {
				@apply m-0 mr-4 whitespace-nowrap px-2 py-1;
			}
		}
	}

	.editor-header {
		& :global(button) {
			@apply relative w-14 self-stretch py-2 text-center transition-colors;
			@apply lg:text-xl;
			&:not(:disabled) {
				@apply hover:bg-primary-100 active:bg-primary-200;
			}
		}
	}
	.editor {
		max-height: calc(100%);
		@apply font-mono text-sm;
	}
	.editor :global {
		.cm-editor {
			@apply flex w-0 flex-1;
		}
		.cm-content {
			@apply font-mono font-light;
		}
		.cm-gutters {
			@apply flex min-w-14 bg-primary-50 bg-opacity-30 font-mono;
		}
		.cm-activeLineGutter {
			@apply mt-0 bg-primary-50;
		}
		.cm-gutter {
			&:first-child {
				@apply flex-1;
			}
			&:last-child {
				@apply w-4;
			}
		}
		.codemirror-wrapper {
			@apply flex flex-1 text-sm md:text-base;
			&.lg {
				@apply text-base md:text-lg;
			}
			&.sm {
				@apply text-xs md:text-sm;
			}
		}
		.cm-activeLine {
			@apply bg-transparent;
		}
		.ͼ2 .cm-selectionBackground {
			@apply bg-primary-50;
		}
	}
</style>
