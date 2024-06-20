<script lang="ts">
    import { yaml } from '@codemirror/lang-yaml';
    import { espresso } from 'thememirror';

    import Tag from '$lib/ui/tag.svelte';
    import type { Snippet } from 'svelte';
    import CodeMirror from 'svelte-codemirror-editor';
    import { fly } from 'svelte/transition';
    import { createEngine } from './create-engine';
    import FlyInOutTransition from './fly-in-out-transition.svelte';

    let {
        code = '',
        title = 'Publicodes',
        selectedRuleInDoc,
        showDocByDefault = false,
        hideDocButton = false,
        onchange,
        fontSize = 'MD',
        additionnalButton
    }: {
        code: string;
        title: string;
        selectedRuleInDoc?: string;
        showDocByDefault?: boolean;
        hideDocButton?: boolean;
        onchange?: (code: string, currentlySelected?: string) => void;
        fontSize?: 'LG' | 'MD';
        additionnalButton?: Snippet;
    } = $props();

    let showDoc = $state(showDocByDefault);
    let copied = $state(false);

    function handleCopy() {
        navigator.clipboard.writeText(code);
        copied = true;
        setTimeout(() => {
            copied = false;
        }, 3000);
    }

    let { engine, error, warning } = $derived(createEngine(code));
    const selectedRule: string | undefined = $derived.by(() => {
        if (engine && !(selectedRuleInDoc && selectedRuleInDoc in engine.getParsedRules())) {
            return Object.keys(engine.getParsedRules()).at(-1);
        }
        return selectedRuleInDoc;
    });

    $effect(() => {
        onchange?.(code, showDoc ? selectedRule : undefined);
    });
</script>

<div
    class="editor-container not-prose flex flex-col overflow-hidden border border-slate-300 sm:rounded-lg"
>
    <div
        class="bg-primary-50 editor-header relative flex shrink-0 items-center overflow-hidden border-b border-slate-300 text-center"
    >
        <button class="border-r" title="Copier" onclick={handleCopy} aria-label="Copier le code">
            📋
        </button>

        {#if copied}
            <div
                in:fly={{ x: -10 }}
                out:fly={{ duration: 75 }}
                class="absolute left-16 will-change-transform"
            >
                <Tag>Code copié !</Tag>
            </div>
        {/if}
        <span class="text-primary-600 flex-1 p-3 font-bold">
            {title}
        </span>
        {#if additionnalButton}
            {@render additionnalButton()}
        {/if}
        {#if !hideDocButton && engine}
            <button
                transition:fly
                class="border-l"
                onclick={() => (showDoc = !showDoc)}
                aria-label={showDoc ? 'Fermer la documentation' : 'Ouvrir la documentation'}
            >
                <FlyInOutTransition condition={showDoc}>
                    {#snippet ifTrue()}❌{/snippet}
                    {#snippet ifFalse()}📚{/snippet}
                </FlyInOutTransition>
            </button>
        {/if}
    </div>
    <div class="editor flex flex-1 flex-col xl:flex-row">
        <div class="flex flex-1 flex-col overflow-auto">
            <CodeMirror
                bind:value={code}
                lang={yaml()}
                useTab
                lineWrapping
                theme={espresso}
                editable={true}
                styles={{
                    '&': {
                        fontSize:
                            fontSize === 'LG' ? '1.1rem' : fontSize === 'MD' ? '0.9rem' : '0.8rem'
                    }
                }}
            />
            <ul class="sticky bottom-0">
                {#each [...warning, ...error] as message}
                    <li class="flex whitespace-pre-line bg-yellow-100" in:fly>
                        <span class="bg-primary-50 w-14 border-r"></span>
                        <span class="max-h-40 flex-1 overflow-auto p-2 first-line:font-bold"
                            >{message}</span
                        >
                    </li>
                {/each}
            </ul>
        </div>
        {#await import('./doc.svelte') then c}
            {#if engine && selectedRule}
                <div class="publicodes-documentation" class:showDoc>
                    <svelte:component
                        this={c.default}
                        {engine}
                        {selectedRule}
                        onchange={(selectedRule) => {
                            onchange?.(code, selectedRule);
                        }}
                    />
                </div>
            {/if}
        {/await}
    </div>
</div>

<style>
    .publicodes-documentation {
        transition:
            opacity 0.1s,
            transform 0.1s;

        @apply xl:max-w-1/2 overflow-auto xl:w-fit;
        /* @apply -mb-4; */
        @apply flex border-slate-300 max-xl:border-t max-lg:px-4 lg:max-xl:pr-4 xl:border-l;

        &:not(.showDoc) {
            @apply absolute;
            @apply invisible opacity-0 max-xl:translate-y-10 xl:translate-x-64;
        }

        & :global {
            h1 {
                @apply my-2 text-xl font-bold;
                /* @apply hidden; */
            }

            h2 {
                @apply -mx-4 border-t border-slate-300 p-4 font-bold;
            }
            p {
                @apply my-3;
            }
            li {
                @apply my-0;
            }
            button {
                @apply cursor-pointer border bg-slate-50 px-2 py-1 text-sm hover:bg-slate-100;
            }
            a {
                @apply cursor-pointer font-sans hover:underline;
            }

            /* Custom styling of rules list menu + layout */
            :not(.content, h1) > a {
                @apply text-primary-600 hover:text-primary-700 underline;
            }
            .content > a {
                @apply flex-1 p-2 pl-0 pr-8;
            }
            .content {
                @apply flex w-full p-0 hover:bg-slate-100;
            }
            .active .content {
                @apply text-primary-600 bg-slate-100 font-bold;
            }
            .content::before {
                margin: 1rem !important;
            }
            .content > button {
                @apply h-full border-0 text-center opacity-90;
                margin: 0 !important;

                width: 2.5rem;
                background: none !important;
                opacity: 0.5;
            }

            article {
                @apply w-full flex-1 border-slate-300 pt-2 xl:border-l-0 xl:pr-4 2xl:border-r;
            }
            nav {
                padding-right: 1px;
                @apply overflow-hidden rounded border-r-0 xl:max-2xl:rounded-l-none xl:max-2xl:border xl:max-2xl:border-l-0;
            }
            #documentation-rule-root {
                @apply flex-1 items-stretch overflow-y-auto overflow-x-hidden xl:flex xl:flex-col-reverse xl:max-2xl:items-start 2xl:flex-row-reverse;
                & > * {
                    @apply max-w-full;
                }
            }

            #rules-nav-open-nav-button ~ span {
                @apply text-sm;
            }
            #rules-nav-open-nav-button button {
                @apply whitespace-nowrap;
            }
        }
    }

    @tailwind utilities;
    @layer utilities {
        .max-w-1\/2 {
            max-width: 50%;
        }
    }

    .editor-header {
        & :global(button) {
            @apply hover:bg-primary-100 active:bg-primary-200 relative w-14 self-stretch border-slate-300 py-2 text-center transition-colors;
            @apply lg:text-xl;
        }
    }
    .editor {
        max-height: calc(100% - 49px);
    }
    .editor :global {
        .cm-editor {
            @apply flex w-0 flex-1;
        }
        .cm-gutters {
            @apply bg-primary-50 flex min-w-14;
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
            @apply flex flex-1;
        }
        .cm-activeLine {
            @apply bg-transparent;
        }
        .ͼ2 .cm-selectionBackground {
            @apply bg-primary-100;
        }
    }
</style>
