<script lang="ts">
    import { dayjs } from 'svelte-time/dayjs.js';
    import Time from 'svelte-time/Time.svelte';

    export let url = '';
    export let title = '';
    export let description = '';
    export let date = '';
    export let tags = '';
</script>

<li class="py-4">
    <div class="mx-auto max-w-7xl py-4">
        <div>
            <div class="text-base font-semibold uppercase">{tags}</div>
            <a href={url} class="mt-3 text-xl font-bold tracking-tight hover:cursor-pointer">
                {title}
            </a>
            <div class="flex space-x-1 text-sm text-gray-500">
                <Time format="DD MMMM YYYY" timestamp={dayjs(date).locale('fr')}>{date}</Time>
            </div>
            <p class="mt-3 text-base text-gray-500">
                {description}
            </p>
        </div>
    </div>
</li>
