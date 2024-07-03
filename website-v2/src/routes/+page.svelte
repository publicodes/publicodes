<script>
    import AnimatedLogo from '$lib/animated-logo.svelte';
    import AdministrationSVG from '$lib/assets/administration.svg';
    import CodeTypingSVG from '$lib/assets/code-typing.svg';
    import SpreadsheetsSVG from '$lib/assets/spreadsheets.svg';
    import PublicodesEditor from '$lib/publicodes/editor.svelte';
    import Button from '$lib/ui/button.svelte';
    import Card from '$lib/ui/card.svelte';
</script>

<header class="not-prose overflow-hidden bg-gradient-to-r from-primary-700 to-slate-400 py-4">
    <div class="mx-auto gap-12 p-6 lg:container sm:flex md:p-10 lg:flex-row-reverse">
        <div class="flex justify-center self-center max-sm:scale-75 xl:flex-1 xl:scale-125">
            <AnimatedLogo />
        </div>
        <div class="flex-1">
            <h1 class=" py-8 text-5xl font-bold text-blue-50">Publicodes</h1>
            <p class="mb-4 text-2xl text-blue-50">
                Un langage commun pour les développeurs et les experts
            </p>
            <!-- Large button style whith strong blue background  -->
            <div class="mt-8 flex gap-4">
                <a href="/docs">
                    <Button>Documentation</Button>
                </a>
            </div>
        </div>
    </div>
</header>

<main class="container prose-xl mx-auto p-8 prose-strong:text-primary-700">
    <section>
        <p class="my-6 border-l-4 border-primary-700 pl-4 text-2xl leading-relaxed lg:mb-10">
            Publicodes permet de modéliser des <strong>domaines métiers complexes</strong>, en les
            décomposant en <strong>règles élémentaires simples</strong> qui soient
            <strong>lisibles par tout le monde</strong>.
        </p>
    </section>
    <section>
        <div class="grid justify-center gap-12 lg:grid-cols-2 2xl:grid-cols-3">
            <Card>
                <img slot="img" src={SpreadsheetsSVG} alt="Illustration d'un tableur Excel" />

                <h2 slot="title">Pour les experts</h2>

                <ol slot="content">
                    <li>
                        <strong>Low code</strong> ⋅ Entre le no-code et le code, Publicodes est compréhensible
                        par toute personne ayant déjà manipulé un tableau Excel.
                    </li>
                    <li>
                        <strong>Transparent</strong> ⋅ Plus d'erreurs cachées : pour vérifier qu’une
                        règle est correctement implémentées, il suffit de la lire.
                    </li>
                    <li>
                        <strong>Un langage commun</strong> ⋅ Développeurs, experts : tout le monde parle
                        la même langue. Cela veut dire une communication plus fluide, et moins d’erreurs.
                    </li>
                </ol>
            </Card>
            <Card>
                <img
                    slot="img"
                    src={CodeTypingSVG}
                    alt="Illustration d'un ordinateur de développement informatique"
                />

                <h2 slot="title">Pour les développeurs</h2>

                <ol slot="content">
                    <li>
                        <strong>Clean architecture</strong> ⋅ Publicodes favorise la maintenabilité et
                        la testabilité en découplant clairement le code métier du code applicatif.
                    </li>
                    <li>
                        <strong>Facile à prendre en main</strong> ⋅ Il dispose d'une
                        <a
                            href="https://marketplace.visualstudio.com/items?itemName=EmileRolley.publicodes-language-server"
                            target="_blank">extension VSCode</a
                        >
                        dédiée (coloration syntaxique, goto def, auto-complétion…) et est basé sur la
                        syntaxe YAML.
                    </li>
                    <li>
                        <strong>Multi-support</strong> ⋅ Son interpréteur JavaScript lui permet d’être
                        embarqué dans dans un navigateur et évite des appels réseaux inutiles.
                    </li>
                </ol>
            </Card>
            <Card>
                <img
                    slot="img"
                    src={AdministrationSVG}
                    alt="Illustration d'une administration"
                    class="object-contain"
                />

                <h2 slot="title">Pour les administrations</h2>

                <ol slot="content">
                    <li>
                        <strong> Rule as code par design</strong> ⋅ Publicodes est un langage particulièrement
                        adapté pour transposer la loi en code.
                    </li>
                    <li>
                        <strong>Accerateur d'open-data</strong> ⋅ Vos règles peuvent être facilement
                        publiée et être réutilisées par d’autres acteurs.
                    </li>
                    <li>
                        <strong>Explicabilité</strong> ⋅ L’explications auto-générée des résultats de
                        calculs permet de vous conformer à l’obligation de transparence des algorithmes
                        publics.
                    </li>
                </ol>
            </Card>
        </div>
    </section>
    <section class=" mt-12">
        <h2>Du code clair et lisible.</h2>
        <p>
            Essayez de modifiez le <strong>salaire brut</strong> à
            <strong>3000 €/mois</strong> dans l'exemple suivant...
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
        <p>
            <strong>C'était facile, non ?</strong> Même sans connaissances en informatique, il est possible
            de comprendre du code écrit avec Publicodes.
        </p>
        <a href="/docs"><Button>Découvrir le langage</Button></a>
    </section>
    <section>
        <h2>Accélérateur d'impact.</h2>
        <p>
            Publicodes est utilisé pour calculer <strong>plusieurs millions de simulations</strong> chaque
            mois. Découvrez les produits phares qui utilisent cette technologie.
        </p>
    </section>
</main>
