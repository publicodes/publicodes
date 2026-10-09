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

Graisses : `400` (texte), `600` (accent léger), `700` (accent). Rien d'autre.
Familles : `--publicodes-font` (sans) et `--publicodes-figure` (mono, pour la notation).

## Couleur — 4 couleurs, 2 papiers, 1 filet

| # | Rôle | Jeton | Usage |
|---|---|---|---|
| 1 | Encre | `--publicodes-ink` (#1e1e1e) | le texte, et les filets d'emphase |
| 2 | Encre atténuée | `--publicodes-muted` (#6b6b6b) | unités, adresses, étiquettes, qualificatifs |
| 3 | Bleu | `--publicodes-blue` (#000091) | liens, filets de section, anneau de focus |
| 4 | Rouge | `--publicodes-red` (#b34000) | l'absence : non défini, non applicable, non renseignée |
| — | Papier blanc | `--publicodes-paper-white` (#ffffff) | une feuille dépliée sur deux |
| — | Papier gris | `--publicodes-paper-shade` (#fafafa) | le fond, et l'autre feuille |
| — | Filet | `--publicodes-rule` (#dddddd) | séparateurs et hairlines |

Les deux papiers ne sont pas des tons : du blanc et un gris clair. Une feuille dépliée alterne
entre les deux, ce qui la détache de celle qui la porte sans introduire de couleur.

**Pas de cinquième gris.** Une emphase plus forte se fait avec l'encre, pas avec un gris de
plus. Un gris plus clair se fait avec la taille et la position, pas avec une troisième teinte.

La signification ne repose sur aucune de ces couleurs : elle repose sur la typographie,
l'alignement, l'indentation et la notation. Une palette remplacée par un hôte ne peut donc pas
falsifier la documentation.

## Tenir le compte

```sh
grep -oE 'font-size: [^;]+' blocks.css | sort -u | wc -l   # 6
grep -oE '#[0-9a-fA-F]{3,8}' blocks.css | sort -u | wc -l  # 7, toutes dans :root
grep -oE '#[0-9a-fA-F]{3,8}' style.css  | sort -u | wc -l  # 0
```
