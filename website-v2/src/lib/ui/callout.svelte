<script context="module" lang="ts">
    const callouts = {
        info: {
            title: 'Info',
            borderColor: 'border-primary-500',
            textColor: 'text-primary-700',
            bgColor: 'bg-primary-50',
            hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 8h.01M12 12v4"/><circle cx="12" cy="12" r="10"/></svg>`
        },
        tip: {
            title: 'Tip',
            borderColor: 'border-green-500',
            textColor: 'text-green-700',
            bgColor: 'bg-green-50',
            hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m8 12 2.7 2.7L16 9.3"/><circle cx="12" cy="12" r="10"/></svg>`
        },
        warning: {
            title: 'Attention',
            borderColor: 'border-yellow-500',
            textColor: 'text-yellow-700',
            bgColor: 'bg-yellow-50',
            hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 9v4m0 4h.01M8.681 4.082C9.351 2.797 10.621 2 12 2s2.649.797 3.319 2.082l6.203 11.904a4.28 4.28 0 0 1-.046 4.019C20.793 21.241 19.549 22 18.203 22H5.797c-1.346 0-2.59-.759-3.273-1.995a4.28 4.28 0 0 1-.046-4.019L8.681 4.082Z"/></svg>`
        },
        danger: {
            title: 'Danger',
            borderColor: 'border-red-500',
            textColor: 'text-red-700',
            bgColor: 'bg-red-50',
            hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 12s-5.6 4.6-3.6 8c1.6 2.6 5.7 2.7 7.2 0 2-3.7-3.6-8-3.6-8Z"/><path d="M13.004 2 8.5 9 6.001 6s-4.268 7.206-1.629 11.8c3.016 5.5 11.964 5.7 15.08 0C23.876 10 13.004 2 13.004 2Z"/></svg>`
        },
        caution: {
            title: 'Important',
            borderColor: 'border-secondary-500',
            textColor: 'text-secondary-700',
            bgColor: 'bg-secondary-50',
            hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12.5 7.5h.01m-.01 4v4m-7.926.685L2 21l6.136-1.949c1.307.606 2.791.949 4.364.949 5.243 0 9.5-3.809 9.5-8.5S17.743 3 12.5 3 3 6.809 3 11.5c0 1.731.579 3.341 1.574 4.685"/></svg>`
        }
    } as const;
</script>

<script lang="ts">
    import type { Snippet } from 'svelte';

    const {
        type,
        title,
        children
    }: { type: 'tip' | 'info' | 'caution' | 'warning'; title?: string; children: Snippet } =
        $props();
</script>

<aside
    class="mb-6 flex flex-col rounded-r border-l-4 p-4 {callouts[type].borderColor} {callouts[type]
        .bgColor}"
>
    <header class="flex items-center gap-2 {callouts[type].textColor}">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html callouts[type].hint}
        <strong>
            {title ?? callouts[type].title}
        </strong>
    </header>
    <div class="-mb-4 -mt-2">
        {@render children()}
    </div>
</aside>

<style>
    aside > header * {
        color: inherit !important;
    }
</style>
