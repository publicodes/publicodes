<script>
</script>

<article class="bg-primary-50 prose mt-36 flex flex-col rounded-lg p-8 pt-0">
    <div class="not-prose img-container -mt-40 flex justify-center">
        <slot name="img"></slot>
    </div>
    <div class="not-prose text-primary-950 -mt-2 mb-4 text-center text-2xl font-bold">
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
