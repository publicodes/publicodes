<script lang="ts">
    import { RulePage, getDocumentationSiteMap } from '@publicodes/react-ui';
    import { createElement } from 'react';
    import { createRoot, type Root } from 'react-dom/client';
    import { onMount } from 'svelte';

    import Engine from 'publicodes';
    import { objectFlip } from './utils';

    const {
        engine,
        selectedRule,
        onchange
    }: { engine: Engine; selectedRule?: string; onchange?: (selectedRule: string) => void } =
        $props();

    const pathToRules = $derived(getDocumentationSiteMap({ engine, documentationPath: '' }));
    const ruleToPaths = $derived(objectFlip(pathToRules));
    let docElement: HTMLDivElement;

    let activeRule: string | undefined = $state();
    $effect(() => {
        if (activeRule && !(activeRule in engine.getParsedRules())) {
            activeRule = undefined;
        }
    });
    let rulePath = $derived(activeRule ?? selectedRule ?? Object.keys(ruleToPaths)[0]);

    $effect(() => {
        if (activeRule) {
            onchange?.(activeRule);
        }
    });

    function Link({ to, children }) {
        const onClick = (evt) => {
            evt.preventDefault();
            activeRule = pathToRules[to];
        };
        return createElement('a', { onClick }, children);
    }
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

    try {
        onMount(() => {
            reactRoot = createRoot(docElement);
        });
    } catch (e) {
        console.error(e);
    }
</script>

<div bind:this={docElement}></div>
