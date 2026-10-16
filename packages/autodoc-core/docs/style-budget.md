# Le budget de style

Ce document est le registre. Une valeur qui n'y figure pas n'existe pas.

**La règle.** Le budget compte des **rôles**, pas des propriétés : un gris dupliqué n'est pas
une couleur, une taille responsive n'est pas une taille. Ajouter un rôle, c'est ajouter une
ligne ici **et** un jeton dans `blocks.css` : le nombre de lignes est le budget.

## Typographie — 7 tailles, 3 graisses, 2 familles

| # | Rôle | Jeton | Usage |
|---|---|---|---|
| 1 | Titre | `--publicodes-size-title` (34) | le nom de la règle, en tête de page |
| 2 | Réponse | `--publicodes-size-answer` (28) | la valeur de la règle, à la ligne de résultat |
| 3 | Sous-titre | `--publicodes-size-section` (19) | titres de blocs, terme de la ligne de résultat |
| 4 | Corps | `--publicodes-size-body` (16) | la prose de l'auteur, les entrées du contexte |
| 5 | Figure | `--publicodes-size-figure` (15) | valeurs, unités, termes du calcul, liens |
| 6 | Signe | `--publicodes-size-sign` (14) | les opérateurs `+`, `−`, `×`, `÷` de la colonne de gauche |
| 7 | Étiquette | `--publicodes-size-label` (12) | les mots du langage, adresses, en-têtes, qualificatifs, comptes, la note d'une fiche |

Les mots du langage — `si`, `alors`, `sinon`, `arrondi`, `variations`, `contexte` — et les
opérateurs — `+`, `−`, `×` — portent le **même contour** : un filet au coin de 6px comme les
contrôles, une seule encre, une graisse. Ils ne font pas la même taille pour autant : un
opérateur est un signe, il se lit un cran sous la notation qu'il sépare et toujours au-dessus du
mot ; un mot se lit à celle de l'étiquette. La **boîte**, elle, est la même pour les deux —
18px de haut, posée à la mi-hauteur de la ligne — pour qu'un signe et un mot d'une même ligne
se rejoignent au pixel près, quelles que soient leurs tailles. La capitale pleine du premier mot
et les petites des suivantes détachent les mots des figures et de la prose qu'ils côtoient, sans
changer ni taille ni graisse.

Graisses : `400` (texte), `600` (accent léger), `700` (accent). Rien d'autre.
Familles : `--publicodes-font` (sans) et `--publicodes-figure` (mono, pour la notation).

Les mots du langage — et les rares mots que la page met en capitales — s'écrivent en **petites
capitales**, d'une seule taille : `font-variant-caps: all-small-caps`, avec
`text-transform: uppercase` pour qu'une police sans petites capitales retombe sur des
capitales plutôt que sur rien.

## Couleur — 4 couleurs, 1 papier, 1 filet

| # | Rôle | Jeton | Usage |
|---|---|---|---|
| 1 | Encre | `--publicodes-ink` (#171b22) | le texte, et les filets d'emphase |
| 2 | Encre atténuée | `--publicodes-muted` (#636975) | unités, adresses, étiquettes, qualificatifs, le contrôle de repli, son chevron et le cercle qui compte |
| 3 | Bleu | `--publicodes-blue` (#1a48bc) | liens, filets de section, anneau de focus, le contrôle de page |
| 4 | Rouge | `--publicodes-red` (#b63325) | l'absence : non défini, non applicable, non renseignée |
| — | Papier | `--publicodes-paper-white` (#ffffff) | la feuille qu'une ligne ouvre, et le fond de la page |
| — | Filet | `--publicodes-rule` (#dadee6) | séparateurs et hairlines, le contour du contrôle survolé, le pied d'une feuille ouverte ; entre deux lignes de calcul, en pointillé (`--publicodes-rule-dots`, un point d'1px tous les 4px) |

**Une seule teinte porte l'ensemble.** Le bleu est la teinte de référence, 264° : les neutres en
sont la version désaturée (chroma ≤ 0,02) et lui la version saturée (0,19). La clarté ne sert
qu'à les ranger : 0,22 pour l'encre, 0,52 pour l'atténué, 0,90 pour le filet, 1,00 pour le
papier. L'absence est la seule autre teinte (30°), au même chroma à un cheveu près, et à la
clarté qu'il faut pour rester lisible sur blanc — les deux accents se valent donc en intensité,
et ne diffèrent que par ce qu'ils disent.

**Une seule feuille, blanche comme la page.** Rien ne la détache pour l'instant : l'alternance
est une donnée de la vue (`data-paper` sur le bloc), que rien ne peint. Le survol ne remplit rien
non plus : il souligne le nom de la ligne, et le contrôle de repli répond sur son contour. Une
ligne dans cette table suffira à rendre un papier aux feuilles.

**Pas de cinquième gris.** Une emphase plus forte se fait avec l'encre, pas avec un gris de
plus. Un gris plus clair se fait avec la taille et la position, pas avec une troisième teinte.

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
cd packages/autodoc-core
grep -oE 'font-size: [^;]+' src/styles/autodoc.css | sort -u | wc -l   # 7
grep -oE '#[0-9a-fA-F]{3,8}' src/styles/autodoc.css | sort -u | wc -l  # 6, toutes dans :root
# l'hôte n'ajoute aucune teinte : il ne peint qu'avec les jetons
grep -oE '#[0-9a-fA-F]{3,8}' ../../examples/autodoc-playground/src/style.css | wc -l  # 0
```
