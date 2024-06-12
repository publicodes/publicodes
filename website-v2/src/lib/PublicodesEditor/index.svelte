<script lang="ts">
    import { yaml } from '@codemirror/lang-yaml';
    import { RulePage, getDocumentationSiteMap } from '@publicodes/react-ui';
    import { createElement } from 'react';
    import { createRoot, type Root } from 'react-dom/client';
    import { onMount } from 'svelte';
    import { espresso } from 'thememirror';
    import { parse } from 'yaml';

    import Engine from 'publicodes';
    import CodeMirror from 'svelte-codemirror-editor';
    import { objectFlip } from './utils';

    const {
        code,
        title = 'Publicodes',
        higlightedRule
    }: { code: string; title: string; higlightedRule: string } = $props();
    let value = $state(code);
    let docElement: HTMLDivElement;
    let showDoc = $state(false);

    try {
        let engine = $derived(new Engine(parse(value)));
        const pathToRules = $derived(getDocumentationSiteMap({ engine, documentationPath: '' }));
        const ruleToPaths = $derived(objectFlip(pathToRules));
        let activeRule: string | undefined = $state();
        $effect(() => {
            if (activeRule && !(activeRule in engine.getParsedRules())) {
                activeRule = undefined;
            }
        });
        let rulePath = $derived(activeRule ?? higlightedRule ?? Object.keys(ruleToPaths)[0]);

        // let rulePath = $state(ruleToPaths[activeRule]);

        function Link({ to, children }) {
            const onClick = (evt) => {
                evt.preventDefault();
                console.log(to);
                activeRule = pathToRules[to];
            };
            return createElement('a', { onClick }, children);
        }
        console.log(activeRule);
        const documentationProps = $derived({
            engine,
            searchBar: false,
            documentationPath: '',

            showDevSection: false,
            rulePath,
            renderers: {
                Link
            }
            // other props left as an exercice to the reader
        });
        let reactRoot: Root | undefined = $state();
        $effect(() => {
            if (!reactRoot) return;
            reactRoot.render(createElement(RulePage, documentationProps));
        });
        onMount(() => {
            reactRoot = createRoot(docElement);
        });
    } catch (e) {
        console.error(e);
    }
</script>

<div class="editor overflow-hidden border border-slate-300 max-sm:-mx-6 sm:rounded-lg">
    <div
        class="text-bold relative w-full border-b border-slate-300 bg-sky-50 p-3 text-center font-bold text-sky-600"
    >
        <span>
            {title}
        </span>
        <button
            class="absolute bottom-0 right-0 top-0 flex h-full items-center border-l border-slate-300 p-4 hover:bg-sky-100"
            on:click={() => (showDoc = !showDoc)}
            aria-label={showDoc ? 'Fermer la documentation' : 'Ouvrir la documentation'}
            ><span>
                {#if showDoc}
                    ❌
                {:else}
                    📚
                {/if}
            </span>
        </button>
    </div>
    <div class="editor min-h-full xl:flex">
        <div class="min-h-full flex-1">
            <CodeMirror
                bind:value
                lang={yaml()}
                theme={espresso}
                on:change={() => (showDoc = true)}
                editable={true}
                styles={{
                    '&': {
                        fontSize: '1rem'
                    }
                }}
            />
        </div>
        <div class="publicodes-documentation" bind:this={docElement} class:showDoc></div>
    </div>
</div>

<style>
    .publicodes-documentation:not(.showDoc) {
        @apply invisible -top-full max-h-0 max-w-0 opacity-0 max-xl:-translate-y-20 xl:translate-x-64;
    }
    .editor {
        & :global(.cm-editor) {
            @apply h-full w-0 flex-grow;
        }
        & :global(.cm-content) {
            @apply h-full py-4;
        }
        & :global(.cm-gutters) {
            @apply bg-sky-50;
        }

        & :global(.codemirror-wrapper) {
            @apply flex h-full;
        }
    }
    .publicodes-documentation {
        @apply transition-all;
        @apply -mb-4;
        @apply min-h-full flex-1 border-slate-300 max-xl:border-t max-lg:px-4 lg:max-xl:pr-4 xl:border-l;

        &.showDoc {
            @apply xl:max-w-fit;
        }

        & :global(h1) {
            @apply my-3 text-xl font-bold;
            /* @apply hidden; */
        }

        & :global(h2) {
            @apply my-2 text-lg font-bold;
        }
        & :global(p) {
            @apply my-3;
        }
        & :global(li) {
            @apply my-0;
        }
        & :global(button) {
            @apply cursor-pointer rounded border bg-slate-50 px-2 py-1 text-sm hover:bg-slate-100;
        }
        & :global(a) {
            @apply cursor-pointer font-sans hover:underline;
        }

        /* Custom styling of rules list menu + layout */
        & :global(:not(.content) > a) {
            @apply text-sky-600 underline hover:text-sky-700;
        }
        & :global(.content > a) {
            @apply block flex-1;
        }
        & :global(.content) {
            @apply w-full hover:bg-slate-100;
        }
        & :global(.active .content) {
            @apply bg-slate-100 font-bold text-sky-600;
        }
        & :global(#documentation-rule-root) {
            @apply h-full xl:flex xl:flex-col-reverse 2xl:flex-row-reverse;
            @apply xl:max-2xl:items-end;

            & :global(article) {
                @apply h-full border-slate-300 xl:border-l-0 xl:pr-4 2xl:border-r;
            }
            & :global(nav) {
                padding-right: 1px;
                /* @apply hidden; */
                @apply rounded border-r-0 xl:max-2xl:mb-4 xl:max-2xl:w-full xl:max-2xl:border-l xl:max-2xl:border-t;
            }
        }

        & :global(#documentation-rule-root > *) {
            @apply max-w-full;
        }

        /* Removing link to parent inside rule */
        & :global(#rules-nav-open-nav-button + span) {
            @apply sm:hidden;
        }
    }
</style>
