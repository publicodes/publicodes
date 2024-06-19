<script lang="ts">
    import { yaml } from '@codemirror/lang-yaml';
    import { espresso } from 'thememirror';

    import CodeMirror from 'svelte-codemirror-editor';
    import { fly } from 'svelte/transition';
    import FlyInOutTransition from './FlyInOutTransition.svelte';
    import { createEngine } from './createEngine.svelte';
    import PublicodesDoc from './doc.svelte';

    const {
        code,
        title = 'Publicodes',
        higlightedRule,
        showDocByDefault = false,
        hideDocButton = false
    }: {
        code: string;
        title: string;
        higlightedRule?: string;
        showDocByDefault?: boolean;
        hideDocButton?: boolean;
    } = $props();
    let showDoc = $state(showDocByDefault);
    let currentCode = $state(code);
    let copied = $state(false);
    function handleCopy() {
        navigator.clipboard.writeText(currentCode);
        copied = true;
        setTimeout(() => {
            copied = false;
        }, 3000);
    }

    let { engine, error, warning } = $derived(createEngine(currentCode));
    const currentlyHighlighted = $derived(
        higlightedRule ?? (engine && Object.keys(engine.getParsedRules()).at(-1)) ?? ''
    );
</script>

<div class="editor not-prose flex flex-col overflow-hidden border border-slate-300 sm:rounded-lg">
    <div
        class="bg-primary-50 relative flex items-center overflow-hidden border-b border-slate-300 text-center"
    >
        <button class="border-r" title="Copier" onclick={handleCopy} aria-label="Copier le code">
            📋
        </button>

        {#if copied}
            <div
                in:fly={{ x: -10 }}
                out:fly={{ duration: 75 }}
                class="bg-primary-600 absolute left-12 m-2 rounded-full px-3 py-1 text-sm text-white will-change-transform"
            >
                Code copié !
            </div>
        {/if}
        <span class="text-primary-600 flex-1 p-2 font-bold">
            {title}
        </span>
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
    <div class="editor flex flex-1 max-xl:flex-col">
        <div class="flex flex-1 flex-col">
            <CodeMirror
                bind:value={currentCode}
                lang={yaml()}
                useTab={false}
                lineWrapping
                theme={espresso}
                on:change={() => (showDoc = true)}
                editable={true}
                styles={{
                    '&': {
                        fontSize: '1rem'
                    }
                }}
            />
            <ul class="sticky bottom-0">
                {#each [...warning, ...error] as message}
                    <li class="prose-sm flex whitespace-pre-line bg-yellow-100" in:fly>
                        <span class="bg-primary-50 w-12 border-r"></span>
                        <span class="max-h-40 flex-1 overflow-auto p-2 first-line:font-bold"
                            >{message}</span
                        >
                    </li>
                {/each}
            </ul>
        </div>
        {#if engine}
            <div class="publicodes-documentation" class:showDoc>
                <PublicodesDoc {engine} higlightedRule={higlightedRule ?? currentlyHighlighted} />
            </div>
        {/if}
    </div>
</div>

<style>
    button {
        @apply hover:bg-primary-100 active:bg-primary-200 relative w-12 self-stretch border-slate-300 py-2 text-center transition-colors;
    }
    .editor {
        & :global {
            .cm-editor {
                @apply w-0 flex-grow;
            }
            .cm-content {
                @apply py-4;
            }
            .cm-gutters {
                @apply bg-primary-50 flex w-12;
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
    }

    .publicodes-documentation {
        transition:
            opacity 0.1s,
            transform 0.1s;
        @apply -mb-4;
        @apply flex border-slate-300 max-xl:border-t max-lg:px-4 lg:max-xl:pr-4 xl:border-l;
        &:not(.showDoc) {
            @apply absolute;
            @apply invisible max-h-0 max-w-0 opacity-0 max-xl:-translate-y-10 xl:translate-x-64;
        }
        &.showDoc {
            @apply xl:max-w-fit;
        }

        & :global {
            h1 {
                @apply my-3 text-xl font-bold;
                /* @apply hidden; */
            }

            h2 {
                @apply my-2 text-lg font-bold;
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
            :not(.content) > a {
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
                @apply flex-1 border-slate-300 xl:border-l-0 xl:pr-4 2xl:border-r;
            }
            nav {
                padding-right: 1px;
                @apply overflow-hidden rounded border-r-0 xl:max-2xl:mb-4 xl:max-2xl:rounded-l-none xl:max-2xl:border xl:max-2xl:border-l-0;
            }
            #documentation-rule-root {
                @apply flex-1 xl:flex xl:flex-col-reverse 2xl:flex-row-reverse;
                & > * {
                    @apply h-full max-w-full xl:max-2xl:h-fit;
                }
            }

            /* Removing link to parent inside rule */
            #rules-nav-open-nav-button + span {
                @apply sm:hidden;
            }
            & > * {
                @apply flex flex-1;
            }
        }
    }
</style>
