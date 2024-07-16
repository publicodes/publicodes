<script lang="ts">
    import { ArrowRight, LibraryBig, Microscope, Play, Rocket } from 'lucide-svelte';

    import AnimatedLogo from '$lib/animated-logo.svelte';
    import PublicodesSchemaSVG from '$lib/assets/publicodes-schema.svg';
    import PublicodesEditor from '$lib/publicodes/editor.svelte';
    import Button from '$lib/ui/button.svelte';
    import Card from '$lib/ui/card.svelte';
    import {
        updateWatchedPackages,
        getSortedPackages,
        type PublicodesPackages
    } from '$lib/package-library/npm';
    import { onMount } from 'svelte';

    const microscope = $derived(Microscope);
    const iconSize = 36;
    const iconStrokeWidth = 1.5;

    let packages: PublicodesPackages = $state([]);

    onMount(async () => {
        // TODO: more efficient way to update the packages with a store?
        packages = await updateWatchedPackages();
    });
</script>

<header class="not-prose w-full overflow-hidden bg-primary-50">
    <div class="w-full items-center justify-center gap-24 sm:flex md:py-48 lg:flex-row">
        <div class="ml-44 flex justify-center self-center max-sm:scale-75 xl:scale-125">
            <AnimatedLogo />
        </div>
        <div class="flex max-w-4xl flex-col gap-6">
            <!-- <h1 class=" py-8 text-5xl font-bold text-blue-50">Publicodes</h1> -->
            <p class="mb-4 text-5xl font-normal text-dark">
                Un <span class="font-regular">langage commun</span> pour les développeur·euses et les
                expert·es
            </p>
            <div class="flex gap-4">
                <a href="/docs/tutoriel">
                    <Button type={'primary'}>Tutoriel</Button>
                </a>
                <a href="/studio">
                    <Button type={'secondary'}><Play />Essayer</Button>
                </a>
            </div>
        </div>
    </div>
</header>

<main class="">
    <section class="mt-36 flex flex-col items-center justify-center gap-8">
        <p class="max-w-5xl text-center text-2xl font-normal">
            Publicodes permet de modéliser des <span class="font-regular"
                >domaines métiers complexes</span
            >, en les décomposant en <span class="font-regular">règles élémentaires simples</span>
            qui soient
            <span class="font-regular">lisibles par tout le monde</span>.
        </p>
        <img
            src={PublicodesSchemaSVG}
            alt="Schéma de fonctionnement de
		Publicodes"
            class="mt-12 w-full max-w-4xl"
        />
    </section>
    <section class="mt-36 flex flex-col gap-8">
        {@render banner(microscope, 'bg-publicodes-orange bg-opacity-10', 'Pour les expert·es', [
            {
                subtitle: 'Low code',
                content:
                    'Entre le no-code et le code, Publicodes est compréhensible par toute personne ayant déjà manipulé un tableau Excel.'
            },
            {
                subtitle: 'Transparent',
                content:
                    "Plus d'erreurs cachées : pour vérifier qu’une règle est correctement implémentées, il suffit de la lire."
            },
            {
                subtitle: 'Un langage commun',
                content:
                    'Développeurs, expert·es : tout le monde parle la même langue. Cela veut dire une communication plus fluide, et moins d’erreurs.'
            }
        ])}
        {@render banner(
            microscope,
            'bg-publicodes-green bg-opacity-10',
            'Pour les développeur·euses',
            [
                {
                    subtitle: 'Clean architecture',
                    content:
                        'Publicodes favorise la maintenabilité et la testabilité en découplant clairement le code métier du code applicatif.'
                },
                {
                    subtitle: 'Facile à prendre en main',
                    content:
                        "Il dispose d'une extension VSCode dédiée (coloration syntaxique, goto def, auto-complétion…) et est basé sur la syntaxe YAML."
                },
                {
                    subtitle: 'Multi-support',
                    content:
                        'Son interpréteur JavaScript lui permet d’être embarqué dans un navigateur et évite des appels réseux inutiles.'
                }
            ]
        )}
        {@render banner(microscope, 'bg-primary-50', 'Pour les administrations', [
            {
                subtitle: 'Rules as code par design',
                content:
                    'Publicodes est un langage particulièrement adapté pour transposer la loi en code.'
            },
            {
                subtitle: 'Facile à prendre en main',
                content:
                    'Vos règles peuvent être facilement publiée et être réutilisées par d’autres acteurs.'
            },
            {
                subtitle: 'Multi-support',
                content:
                    'Tout le monde parle la même langue. Cela veut dire une communication plus fluide, et moins d’erreurs.'
            }
        ])}
    </section>
    <section class="mt-32 flex w-full flex-col items-center gap-16">
        <div class="flex w-full max-w-7xl flex-col gap-10">
            <h2 class="text-4xl font-normal">Du code clair et lisible</h2>
            <div class="flex flex-col gap-4">
                <p class="prose prose-xl font-normal text-black">
                    Essayez de modifiez le <code>salaire brut</code> à
                    <code>3000 €/mois</code> dans l'exemple suivant...
                </p>
                <div class="max-sm:-mx-6">
                    <PublicodesEditor
                        title="Calcul du salaire net"
                        showDocByDefault
                        hideDocButton
                        size="LG"
                        code={`salaire brut: 2500 €/mois

cotisations salariales:
  description: Les cotisations salariales permettent de financer la protection sociale.
  produit:
    - salaire brut
    - taux
  avec:
    taux: 21.7%

salaire net: salaire brut - cotisations salariales`}
                    ></PublicodesEditor>
                </div>
                <p class="max-w-7xl text-xl font-normal text-black">
                    <strong>C'était facile, non ?</strong> Même sans connaissances en informatique, il
                    est possible de comprendre du code écrit avec Publicodes.
                </p>
            </div>
            <a class="w-fit self-center" href="/docs">
                {@render buttonWithRightArrow('Découvrir le langage')}
            </a>
        </div>
    </section>
    <section class="mt-32 flex w-full flex-col items-center gap-16">
        <section class="not-prose flex w-full justify-center bg-primary-50 py-32">
            <div class="flex w-full max-w-7xl flex-col gap-10">
                <div class="flex gap-4">
                    <Rocket size={iconSize} strokeWidth={iconStrokeWidth} />
                    <h2 class="m-0 text-4xl font-normal">Accélérateur d'impact</h2>
                </div>
                <p class="max-w-7xl text-xl font-normal text-black">
                    Publicodes est utilisé pour calculer <strong
                        >plusieurs millions de simulations</strong
                    > chaque mois. Découvrez les produits phares qui utilisent cette technologie.
                </p>
                {@render userCards([
                    // TODO: fetch this informations directly from targetted
                    // website's metadata.
                    {
                        img: 'https://nosgestesclimat.fr/images/misc/metadata.png',
                        title: 'Nos Gestes Climat',
                        description:
                            "Le calculateur d'empreinte climat personnelle de référence, complètement ouvert.",
                        url: 'https://nosgestesclimat.fr'
                    },
                    {
                        img: 'https://mon-entreprise.urssaf.fr/logo-share.png',
                        title: 'Mon-entreprise',
                        description:
                            'Utilise publicodes pour implémenter la législation socio-fiscale dans des simulateurs (paie, cotisations, impôts, droits ouverts)',
                        url: 'https://mon-entreprise.urssaf.fr'
                    },
                    {
                        img: 'https://code.travail.gouv.fr/static/assets/img/social-preview.png',
                        title: 'Code du travail numérique',
                        description:
                            'Développe un simulateur de préavis de retraite intégrant de nombreuses conventions collectives.',
                        url: 'https://code.travail.gouv.fr'
                    }
                ])}
                <!-- TODO: add correct link -->
                <a class="w-fit self-center" href="/docs">
                    {@render buttonWithRightArrow('Découvrir toutes les réalisations')}
                </a>
            </div>
        </section>
    </section>
    <!-- TODO: factorize sections in a snippet? -->
    <section class="flex w-full flex-col items-center gap-16">
        <section class="not-prose flex w-full justify-center py-32">
            <div class="flex w-full max-w-3xl flex-col gap-10 lg:max-w-5xl xl:max-w-7xl">
                <div class="flex gap-4">
                    <LibraryBig size={iconSize} strokeWidth={iconStrokeWidth} />
                    <h2 class="m-0 text-4xl font-normal">Créateur de communs</h2>
                </div>
                <p class="max-w-7xl text-xl font-normal text-black">
                    Déjà <strong>une dizaine de modèles publiés</strong>. Découvrez les dans la
                    bibliothèque de modèles publicodes.
                </p>
                {@render packageItems(packages)}
                <!-- TODO: add correct link -->
                <a class="w-fit self-center" href="/docs">
                    {@render buttonWithRightArrow('Découvrir tous les modèles')}
                </a>
            </div>
        </section>
    </section>
</main>

<!-- FIXME: Find a way to use the icon as a component -->
{#snippet banner(icon, background, title, items)}
    <section class={'not-prose flex w-full justify-center py-16 ' + background}>
        <div class="flex max-w-7xl flex-col gap-10">
            <div class="flex items-center gap-4">
                <h2 class="m-0 text-4xl font-normal">{title}</h2>
            </div>
            <div class="flex gap-4">
                {#each items as { subtitle, content }}
                    <div class="flex flex-1 flex-col gap-2">
                        <h3 class="text-xl italic">{subtitle}</h3>
                        <p class="text-lg font-normal leading-snug">{content}</p>
                    </div>
                {/each}
            </div>
        </div>
    </section>
{/snippet}

{#snippet userCards(items)}
    <ul class="flex justify-center gap-8">
        {#each items as { img, title, description, url }}
            <Card {img} {title} {description} {url} />
        {/each}
    </ul>
{/snippet}

{#snippet packageItems(items)}
    <ul class="grid max-w-3xl grid-cols-2 gap-8 lg:max-w-5xl xl:max-w-7xl xl:grid-cols-3">
        {#each items as { name, version, lastUpdate, description }}
            <li
                class="relative flex max-h-24 min-w-96 flex-col gap-1 rounded-sm
				border border-primary-300 p-2
				hover:border-primary-400 hover:bg-primary-400
				hover:bg-opacity-5"
            >
                <!-- TODO: this should redirect to the package's page -->
                <a
                    href={`https://www.npmjs.com/package/${name}`}
                    class="after:contents-[''] flex flex-col gap-2 font-regular
			text-primary-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:top-0 hover:text-primary-600"
                    target="_blank"
                >
                    {name}
                </a>
                <span class="flex items-center gap-2 font-normal">
                    <span>{version}</span>
                    <span class="text-sm italic">{lastUpdate}</span>
                </span>
                <p class="text-md max-h-12 truncate font-normal">{description}</p>
            </li>
        {/each}
    </ul>
{/snippet}

{#snippet buttonWithRightArrow(text)}
    <Button type="secondary">
        <span class="flex items-center gap-2">
            {text}
            <ArrowRight size={26} strokeWidth={1.75} />
        </span>
    </Button>
{/snippet}
