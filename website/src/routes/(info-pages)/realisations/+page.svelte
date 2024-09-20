<script lang="ts">
    import { produits, type Produit } from '$data/produits';
    import { publicodesPackages } from '$data/publicodes-packages';
    import Heading from '$lib/component/heading.svelte';

    import Card from '$lib/ui/card.svelte';
    import Tooltip from '$lib/ui/tooltip.svelte';
    import { ExternalLink, Package, Rocket } from 'lucide-svelte';

    const displayedProduit = (produits.filter(({ img }) => !!img) as (Produit & { img: string })[])
        .map((produit) => ({
            ...produit,
            pkg: publicodesPackages.filter(
                ({ maintainer, users }) =>
                    maintainer === produit.slug || users?.includes(produit.slug)
            )
        }))
        .sort((a, b) => b.pkg.length - a.pkg.length);
</script>

<div class="prose pb-10 lg:max-w-screen-md">
    <Heading level="h1" icon={Rocket}>Propulsé par Publicodes</Heading>
    <p class="text-xl">Découvrez les produits qui utilisent publicodes au quotidien.</p>
</div>

<div role="list" class="grid grid-cols-1 gap-8 pb-16 sm:grid-cols-2 lg:grid-cols-3">
    {#each displayedProduit as { img, name, description, url, pkg }}
        <Card {img} {url} role="listitem">
            {#snippet title()}
                <h2>{name}</h2>
            {/snippet}
            <p class="flex-1">{description}</p>
            {#if pkg.length > 0}
                <div class="z-10 text-right">
                    <Tooltip>
                        {#snippet text()}
                            <h3 class="prose">Modèle{pkg.length > 1 ? 's' : ''} Publicodes :</h3>
                            <ul>
                                {#each pkg as { npm }}
                                    <li class="prose prose-sm">
                                        <a
                                            href={`https://www.npmjs.com/package/${npm}`}
                                            target="_blank"
                                            rel="noopener"
                                        >
                                            {npm}
                                            <ExternalLink class="inline" size={12}></ExternalLink>
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        {/snippet}
                        <span class="mb-1 inline-flex items-center gap-1 text-sm text-slate-500">
                            <Package size={16} strokeWidth={1} />
                            {pkg.length}
                        </span>
                    </Tooltip>
                </div>
            {/if}
        </Card>
    {/each}
</div>
<div class="prose max-w-full py-10">
    <p>
        Si vous souhaitez <strong>ajouter votre produit à cette liste</strong>, vous pouvez
        <a href="https://github.com/publicodes/publicodes/tree/master/website/src/data/produits.ts"
            >proposer une contribution.</a
        >
    </p>
</div>
