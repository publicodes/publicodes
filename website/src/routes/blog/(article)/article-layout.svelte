<script>
    import { ArrowLeft } from 'lucide-svelte';
    import Time from 'svelte-time/Time.svelte';

    export let title;
    export let author;
    export let date;
</script>

<article class="lg:py-18 flex justify-center px-6 py-14">
    <div class="flex flex-col lg:grid lg:grid-cols-5">
        <div
            class="col-span-1 mb-12 inline-flex max-h-4 justify-start lg:sticky lg:top-32 lg:justify-start"
        >
            <a
                href="/blog"
                class="flex items-center gap-2 text-lg text-primary-400 hover:text-primary-600"
            >
                <ArrowLeft size={24} strokeWidth={1.5} />
                Retourner à la liste
            </a>
        </div>

        <div class="prose col-span-3 lg:prose-lg xl:max-w-4xl">
            <div class="border-b pb-6">
                <h1>{title}</h1>
                <div class="prose font-normal lg:text-lg">
                    {author} -
                    <Time format="DD MMMM YYYY" timestamp={date} />
                </div>
            </div>
            <slot></slot>
        </div>
    </div>
</article>
