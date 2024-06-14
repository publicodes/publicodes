<script lang="ts">
    export let url = '';
    export let title = '';
    export let description = '';
    export let tags = '';
</script>

<li class="py-4">
    <div class="mx-auto max-w-7xl py-4">
        <div>
            <h2 class="text-base font-semibold uppercase">{tags}</h2>
            <a href={url} class="mt-3 text-2xl font-bold tracking-tight hover:cursor-pointer">
                {title}
            </a>
            <p class="mt-3 text-base text-gray-500">
                {description}
            </p>
        </div>
    </div>
</li>
