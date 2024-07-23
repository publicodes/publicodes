<script lang="ts">
    import Time from 'svelte-time';
    import Tags from './tags.svelte';

    export let url = '';
    export let title = '';
    export let description = '';
    export let date = '';
    export let tags = '';
    // export let icon = '';
</script>

<li
    class="not-prose relative flex flex-col justify-between gap-6 overflow-hidden rounded-sm border border-primary-300
	bg-white p-5 hover:border-primary-400"
>
    <div class="flex flex-col gap-3">
        <a
            href={url}
            class="after:contents-[''] text-xl text-primary-400 after:absolute
		after:bottom-0 after:left-0 after:right-0 after:top-0 hover:text-primary-600"
        >
            <p class="text-xl font-light md:text-2xl">
                <!-- {icon} -->
                {title}
            </p>
        </a>
        <p class="prose font-light leading-snug">
            {description}
        </p>
    </div>
    <div class="flex flex-col gap-3 text-sm font-light">
        <Time class="text-slate-600" format="DD MMMM YYYY" timestamp={date} />
        <Tags {tags} />
    </div>
</li>
