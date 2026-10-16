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
| 5 | Figure | `--publicodes-size-figure` (15) | valeurs, unités, termes du calcul, liens, les signes de la colonne de gauche |
| 6 | Étiquette | `--publicodes-size-label` (13) | les mots du langage, adresses, en-têtes, qualificatifs, comptes, la note d'une fiche |

Les mots du langage — `si`, `alors`, `sinon`, `arrondi`, `variations`, `contexte` — et les
opérateurs — `+`, `−`, `×` — portent la **même pastille** : le même voile, le même coin de 4px, la
même encre atténuée, et **pas de filet** — c'est le filet qui fait un bouton, et un mot du
langage ne s'ouvre pas. Un seul trait les distingue l'un de l'autre, et il est typographique :
la face, le corps, la graisse. Ils ne font pas la même taille pour autant : un
opérateur est un signe, il se lit un cran sous la notation qu'il sépare et toujours au-dessus du
mot ; un mot se lit un cran sous lui, à celle de l'étiquette. La **boîte**, elle, est la même —
20px de haut, posée à la mi-hauteur de la ligne — pour qu'un signe et un mot d'une même ligne
se rejoignent au pixel près, quelles que soient leurs tailles. Les deux s'écrivent dans la
notation ; ce qui les sépare est le corps — 15 contre 13 — et la graisse — l'accent plein contre
l'accent léger. Rien d'autre : ni couleur, ni casse.

Graisses : `400` (texte), `600` (accent léger), `700` (accent). Rien d'autre.
Familles : `--publicodes-font` (sans) et `--publicodes-figure` (mono, pour la notation).

Les mots du langage gardent la **casse de l'auteur** : `sinon`, `arrondi`, `contexte` s'écrivent
comme le modèle les écrit, jamais transformés. Ce qui les détache d'une figure, c'est la
pastille et la taille.

## Couleur — 5 encres, 1 papier, 1 voile

| # | Rôle | Jeton | Usage |
|---|---|---|---|
| 1 | Encre | `--publicodes-ink` (#171b22) | le texte, et les filets d'emphase |
| 2 | Encre atténuée | `--publicodes-muted` (#636975, sombre #999fa9) | unités, adresses, qualificatifs, le contrôle de repli, son chevron et le cercle qui compte, la place d'un terme qu'on n'écrit pas, et les filets : les séparateurs, les hairlines, le contour du contrôle survolé, le pied d'une feuille ouverte. Entre deux lignes de calcul, le même filet en pointillé — un point d'1px tous les 4px (`--publicodes-rule-dots`) |
| 3 | Encre d'une pastille | `--publicodes-label-ink` (#636975, sombre #bfc4ce) | le texte d'un mot du langage, d'un signe et d'un « par défaut », sur leur voile |
| 4 | Bleu | `--publicodes-blue` (#1a48bc) | liens, filets de section, anneau de focus, le contrôle de page |
| 5 | Rouge | `--publicodes-red` (#b63325) | l'absence : non défini, non applicable, non renseignée |
| — | Papier | `--publicodes-paper` (#ffffff) | la feuille qu'une ligne ouvre, et le fond de la page |
| — | Voile | `--publicodes-tint` (l'encre à 4,5 %) | le fond des pastilles de mots du langage |

**Une seule teinte porte l'ensemble.** Le bleu est la teinte de référence, 264° : les neutres en
sont la version désaturée (chroma ≤ 0,02) et lui la version saturée (0,19). La clarté ne sert
qu'à les ranger : 0,22 pour l'encre, 0,52 pour l'atténué, 0,90 pour le filet, 1,00 pour le
papier. L'absence est la seule autre teinte (30°), au même chroma à un cheveu près, et à la
clarté qu'il faut pour rester lisible sur blanc — les deux accents se valent donc en intensité,
et ne diffèrent que par ce qu'ils disent.

**Le thème suit le système.** Sous `prefers-color-scheme: dark`, les mêmes rôles changent de
clarté et rien d'autre : la teinte reste 264°, l'absence reste la seconde teinte, et les
contrastes restent ceux du clair — l'encre 0,93, l'atténué 0,70, le papier 0,19, le bleu 0,70,
le rouge 0,72. C'est une seconde palette, pas des rôles de plus : le budget est
toujours de quatre couleurs, un papier et un voile. Les filets ne sont pas une couleur de plus :
c'est l'encre atténuée, et le pointillé n'est que ce même filet à l'écart de son point.

**Le voile n'est pas un gris de plus** : c'est l'encre à 4,5 %, qui prend la teinte du papier
qu'elle couvre. Il ne remplit qu'un mot du langage, jamais une ligne.

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
grep -oE 'font-size: [^;]+' src/styles/autodoc.css | sort -u | wc -l   # 6
grep -oE '#[0-9a-fA-F]{3,8}' src/styles/autodoc.css | sort -u | wc -l  # 6, toutes dans :root
# l'hôte n'ajoute aucune teinte : il ne peint qu'avec les jetons
grep -oE '#[0-9a-fA-F]{3,8}' ../../examples/autodoc-playground/src/style.css | wc -l  # 0
```
