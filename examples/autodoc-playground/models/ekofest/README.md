# Le modèle Ekofest

Les 28 fichiers `.publicodes` qui suivent, et `commun/commun.publicodes`, sont
copiés de [`publicodes/publicodes-road-to-v2`](https://github.com/publicodes/publicodes-road-to-v2/tree/main/src/V2/ekofest),
commit `3384115c` (MIT). Ils servent de modèle réel : 306 règles, un import
(`commun`), huit résultats déclarés `public`.

Ne pas les éditer ici : ce sont les sources, elles se resynchronisent depuis le
dépôt d'origine. Les sorties du compilateur (`model.publicodes.{js,json}`) sont
générées par `pnpm build:autodoc-example` et ignorées par git.

La compilation se fait depuis ce dossier, pour que `importer: commun` résolve en
`commun/commun.publicodes` :

```sh
publicodes compile -t json -C . .
```
