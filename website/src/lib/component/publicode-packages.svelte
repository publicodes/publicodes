<script lang="ts">
    import type { PublicodesPackageWithMetadata } from '$lib/model/package-with-metadata';
    import Time from 'svelte-time/Time.svelte';

    const { packages }: { packages: PublicodesPackageWithMetadata[] } = $props();
</script>

<ul
    class=" grid grid-flow-row grid-cols-1 justify-center gap-3 md:grid-cols-2
 xl:grid-cols-3 xl:gap-4"
>
    {#each packages as { name, version, modified, description, maintener }}
        <li
            class="relative flex rounded-sm
				border border-primary-400
				hover:border-primary-400 hover:bg-primary-400 hover:bg-opacity-5
				"
        >
            <div class="prose m-3 flex flex-1 flex-col gap-1">
                <!-- TODO: this should redirect to the package's page -->
                <strong>
                    <a
                        href={`https://www.npmjs.com/package/${name}`}
                        class="after:contents-[''] font-medium
			text-primary-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:top-0 hover:text-primary-600"
                        target="_blank"
                    >
                        {name}
                    </a>

                    <code class="ml-1 text-xs">{version}</code>
                </strong>
                <div class="flex-1">
                    {#if description}
                        <p class="mt-0">{description}</p>
                    {/if}
                </div>
                <span class=" text-sm font-light text-slate-500">
                    Publié <Time class="" relative timestamp={modified} />
                    par {maintener}
                </span>
            </div>
        </li>
    {/each}
</ul>
