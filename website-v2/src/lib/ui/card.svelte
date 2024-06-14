<script>
</script>

<article class="prose mt-36 flex flex-col rounded-lg bg-primary-50 p-8 pt-0">
    <div class="not-prose img-container -mt-40 flex justify-center">
        <slot name="img"></slot>
    </div>
    <div class="not-prose -mt-2 mb-4 text-center text-2xl font-bold text-primary-950">
        <slot name="title"></slot>
    </div>
    <div class="flex-1">
        <slot name="content"></slot>
    </div>
    <div class="text-center">
        <slot name="link"></slot>
    </div>
</article>

<style>
    .img-container :global(img) {
        @apply h-72 max-w-96;
    }
</style>
