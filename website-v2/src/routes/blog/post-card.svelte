<script lang="ts">
    import 'dayjs/locale/fr';
    import Time, { dayjs } from 'svelte-time';

    export let url = '';
    export let title = '';
    export let description = '';
    export let date = '';
    export let tags = '';
    export let icon = '';
</script>

<div class="flex flex-col overflow-hidden rounded-lg border border-gray-200 shadow-lg">
    <div class="flex flex-1 flex-col justify-between bg-white px-6 py-12">
        <div class="flex-1">
            <a href={url} class="mt-2 block">
                <p class="text-2xl font-semibold hover:cursor-pointer">
                    {icon}
                    {title}
                </p>
                <p class="mt-3 text-base text-gray-500">
                    {description}
                </p>
            </a>
        </div>
        <div class="mt-4 flex flex-col justify-center">
            <div class="flex space-x-1 text-sm text-gray-500">
                <Time format="DD MMMM YYYY" timestamp={dayjs(date).locale('fr')}>{date}</Time>
            </div>
        </div>
        <p class="mt-2 text-sm uppercase text-secondary-800">{tags}</p>
    </div>
</div>
