# Le budget de style

Ce document est le registre. Une valeur qui n'y figure pas n'existe pas.

**La règle.** Le budget compte des **rôles**, pas des propriétés : un gris dupliqué n'est pas
une couleur, une taille responsive n'est pas une taille. Ajouter un rôle, c'est ajouter une
ligne ici **et** un jeton dans `blocks.css` : le nombre de lignes est le budget.

## Typographie — 6 tailles, 3 graisses, 2 familles

| # | Rôle | Jeton | Usage |
|---|---|---|---|
| 1 | Titre | `--publicodes-size-title` (34) | le nom de la règle, en tête de page |
| 2 | Réponse | `--publicodes-size-answer` (28) | la valeur de la règle, à la ligne de résultat |
| 3 | Sous-titre | `--publicodes-size-section` (19) | titres de blocs, terme de la ligne de résultat |
| 4 | Corps | `--publicodes-size-body` (16) | la prose de l'auteur, les entrées du contexte |
| 5 | Figure | `--publicodes-size-figure` (15) | valeurs, unités, termes du calcul, modificateurs, liens |
| 6 | Étiquette | `--publicodes-size-label` (13) | opérateurs, mots-clés, adresses, en-têtes, qualificatifs |

Les mots du langage — `si`, `alors`, `sinon`, `arrondi`, `variations`, `le plus petit de` — sont
des étiquettes : petites capitales, et un filet au coin de 6px comme les contrôles. La capitale
pleine du premier mot et les petites des suivantes les détachent des figures et de la prose
qu'ils côtoient, sans changer ni taille ni graisse. L'opérateur, lui, reste nu : `×` n'est pas
un mot.

Graisses : `400` (texte), `600` (accent léger), `700` (accent). Rien d'autre.
Familles : `--publicodes-font` (sans) et `--publicodes-figure` (mono, pour la notation).

Les étiquettes — les mots du langage, et les rares mots que la page met en capitales — sont
des **petites capitales**, d'une seule taille : `font-variant-caps: all-small-caps`, avec
`text-transform: uppercase` pour qu'une police sans petites capitales retombe sur des
capitales plutôt que sur rien.

## Couleur — 4 couleurs, 2 papiers, 1 filet, 1 voile

| # | Rôle | Jeton | Usage |
|---|---|---|---|
| 1 | Encre | `--publicodes-ink` (#1e1e1e) | le texte, et les filets d'emphase |
| 2 | Encre atténuée | `--publicodes-muted` (#6b6b6b) | unités, adresses, étiquettes, qualificatifs, le contrôle de repli et sa pastille |
| 3 | Bleu | `--publicodes-blue` (#000091) | liens, filets de section, anneau de focus, le contrôle de page |
| 4 | Rouge | `--publicodes-red` (#b34000) | l'absence : non défini, non applicable, non renseignée |
| — | Papier blanc | `--publicodes-paper-white` (#ffffff) | une feuille dépliée sur deux, le fond du contrôle sous le pointeur, le chiffre de la pastille |
| — | Papier gris | `--publicodes-paper-shade` (#fafafa) | le fond, et l'autre feuille |
| — | Filet | `--publicodes-rule` (#dddddd) | séparateurs et hairlines, le contour du contrôle survolé |
| — | Voile | `--publicodes-tint` (l'encre à 4,5 %) | le survol d'une ligne qui ouvre |

Les deux papiers ne sont pas des tons : du blanc et un gris clair. Une feuille dépliée alterne
entre les deux, ce qui la détache de celle qui la porte sans introduire de couleur. Hors d'une
feuille, le blanc sert de fond au contrôle survolé et de chiffre à sa pastille — la couleur de
la surface qu'une pastille pleine évide.

**Pas de cinquième gris.** Une emphase plus forte se fait avec l'encre, pas avec un gris de
plus. Un gris plus clair se fait avec la taille et la position, pas avec une troisième teinte.
Le voile n'y échappe pas : ce n'est pas un gris, c'est l'encre à 4,5 %, qui prend la teinte du
papier qu'elle couvre.

La signification ne repose sur aucune de ces couleurs : elle repose sur la typographie,
l'alignement, l'indentation et la notation. Une palette remplacée par un hôte ne peut donc pas
falsifier la documentation.

## Mesure — 2 largeurs

| Rôle | Jeton | Usage |
|---|---|---|
| Page | `--publicodes-width` (48rem) | le calcul, qui est un tableau : une largeur stable |
| Prose | `--publicodes-measure` (68ch) | la prose de l'auteur : 65 à 75 caractères, pas plus |

Le calcul ne se mesure pas en caractères : sa largeur ne doit pas changer avec la police de
l'hôte. La prose, elle, se mesure en caractères, et pas autrement.

## Tenir le compte

```sh
grep -oE 'font-size: [^;]+' blocks.css | sort -u | wc -l   # 6
grep -oE '#[0-9a-fA-F]{3,8}' blocks.css | sort -u | wc -l  # 7, toutes dans :root
grep -oE '#[0-9a-fA-F]{3,8}' style.css  | sort -u | wc -l  # 0
```
