# Spécification de la page d'une règle

Content first. Ce document ne décide aucun style. Il dit quelles informations une page de
règle peut montrer, dans quel ordre, quelles interactions existent, et ce que chaque
interaction montre ou cache. Les exemples viennent de deux modèles réels, `ekofest` (bilan
carbone) et `auto-entrepreneur` (revenu), pour que chaque règle d'affichage soit éprouvée sur
plus d'un domaine.

Tout ce qui suit découle d'une seule discipline : **la page ne montre que ce qu'une règle
porte, ou ce qui s'en dérive.** Rien d'autre n'est inventé.

---

## 1. Ce qu'une règle porte

**Déclaré par le compilateur**, toujours sous ces noms, chacun optionnel sauf le mécanisme :

- `title` — le nom lisible, écrit par l'auteur
- `description` — l'explication de la règle, en markdown
- `note` — l'espace de travail de l'auteur : tantôt la source d'un facteur, tantôt une liste
  de choses à faire plus tard
- `public` — la règle fait-elle partie de l'API déclarée du modèle
- `type`, `unit` — de quelle sorte de quantité il s'agit
- `position` — le fichier et la ligne où la règle est écrite ; `id` — l'identifiant du nœud
- l'arbre des mécanismes : 30 sortes, dont 12 de valeur, 10 enchaînées, 15 opérateurs binaires,
  1 unaire, 4 constantes

**Le sac `meta` de l'auteur : rien.** Ses clés et la forme de leurs valeurs sont inconnues à
l'avance ; le compilateur les transporte sans les lire. La bibliothèque ne les lit pas non
plus. Une page ne montre jamais rien qui vienne de `meta`.

**Apporté par l'évaluation**, quand un contexte existe :

- la valeur de chaque nœud qui a tourné, par pile de contexte
- les branches qui ont été prises, celles qui ne l'ont pas été
- les modificateurs qui ont pris effet, ceux qui sont restés sans effet
- les entrées dont le calcul avait besoin, et celles qui manquaient

**Apporté par le modèle entier** :

- les règles qui référencent celle-ci
- les règles qui partagent son espace de noms
- les chemins de l'API déclarée (`public` et ses paramètres transitifs)

---

## 2. L'ordre d'affichage

1. **Le nom et l'adresse.** Le `title`, ou à défaut le dernier segment du nom pointé.
   L'adresse complète en dessous, en petit : c'est une adresse, pas un nom.
2. **La description de l'auteur.** Ce que la règle est, dans ses mots, markdown rendu.
   Absente si l'auteur n'a rien écrit — la page ne s'excuse pas et n'explique pas à sa place.
3. **Le calcul, qui s'ouvre sur son résultat.** La réponse de la page est la ligne de résultat
   de l'équation la plus externe, à l'échelle d'un titre, et elle n'existe nulle part ailleurs.
   Sur cette ligne, le niveau de remplissage : calculée dans un contexte, avec le compte de ce
   qui a été fourni, ou structure seule.
4. **Le contexte du calcul.** Les entrées, une par une, avec leur état.
5. **Où cette valeur sert.** Les règles qui consomment celle-ci.
6. **La provenance.** Le fichier et la ligne.

*Pour l'instant, la page par défaut s'arrête au calcul : les blocs 4, 5 et 6 sont exportés mais
la page ne les compose pas. Le contexte est en réécriture.*

Pourquoi cet ordre : le lecteur arrive avec un nombre à vérifier. Le nom lui dit où il est, la
description de quoi on parle en deux phrases, et le calcul lui rend son nombre à la première
ligne — avant même ses opérandes. Le contexte détaillé vient ensuite, pour celui qui veut
savoir de qui sont ces chiffres ; son résumé, lui, accompagne déjà la réponse.

---

## 3. Le contexte du calcul

**Un seul bloc.** C'est à la fois « ce que le calcul attend », « les paramètres d'entrée » et
« le contexte » : trois noms pour une même chose, qui était montrée trois fois. Il s'appelle
**contexte du calcul**, parce que c'est le terme qui survivra aux piles de contexte.

Chaque entrée y apparaît une fois, avec son nom lisible (`title` ou dernier segment) et un
état parmi trois :

- **fournie** — la valeur, et le fait qu'elle vient du contexte, donc du lecteur
- **par défaut** — la valeur par défaut du modèle, marquée comme telle : rien n'a été saisi,
  et le modèle a tranché à la place du lecteur
- **non renseignée** — marquée, dans la couleur d'absence ; le calcul l'a atteinte sans la trouver

Une ligne de compte ouvre le bloc : combien de fournies, de valeurs par défaut, de manquantes.

**Ce qu'un `contexte` lie s'écrit comme des lignes du calcul, pas comme une table de plus** :
chaque règle liée a sa ligne, son nom, sa valeur, et s'ouvre d'un clic sur le calcul qui l'a
produite — la flèche vers sa page quand elle en a une, rien quand elle ne porte qu'une
constante. Le langage ne restreint pas ce qui peut être lié — `contexte: { b: b + 10 }` comme
`contexte: { salaire brut: SMIC brut }` — et la valeur liée est évaluée en dehors du contexte
qu'elle ouvre.

**Aucun nom de scénario.** Aucun fichier du modèle ne porte le nom d'un contexte ; si l'hôte en
a un, c'est lui qui le fournit et lui qui le nomme. Sans lui, le bloc se contente des comptes.

Les entrées manquantes viennent en premier : ce sont celles sur lesquelles le lecteur peut
agir.

---

## 4. Le calcul : une opération est une équation

C'est ici que la version prototypée échouait. Une colonne d'opérateurs `+` et `×` devant des
lignes indentées ne dit jamais **quels opérandes appartiennent à quelle opération** : le lecteur
voit `× Distance` puis `× Empreinte` et doit deviner qu'ils se multiplient *entre eux*.

La règle : **chaque mécanisme composeur s'écrit comme une équation.** Ses opérandes, l'opérateur
entre deux opérandes consécutifs, un filet, puis son résultat. Le résultat d'une équation est
l'opérande de celle du dessus. Le mot-clé du mécanisme est **l'intitulé de l'équation**, écrit
une fois au-dessus d'elle — pas un préfixe de ligne.

**La ligne de résultat de l'équation la plus externe est la réponse de la page.** Elle porte la
valeur de la règle à l'échelle d'un titre, son unité, et l'état du contexte. Il n'existe pas de
bloc « résultat » séparé : en avoir un reviendrait à imprimer le même nombre deux fois.

**Une négation dans une somme est une soustraction.** `somme: [a, -b, -c]` s'écrit `a − b − c` :
le signe est l'opérateur de la ligne, le terme garde son nom et sa valeur. Il n'y a rien à
ouvrir sous la négation — `-b` n'est pas un calcul, c'est `b` avec un signe devant.

**Une chaîne de même précédence est une seule équation.** `a + b + c` s'écrit sur trois lignes,
pas une somme dans une somme. Une parenthèse de même précédence s'ouvre aussi, en retournant les
opérateurs qu'elle portait : `a − (b + c)` s'écrit `a − b − c`, et `a − (b − c)` s'écrit
`a − b + c`. Un exposant et une comparaison, eux, ne s'aplatissent pas : leur imbrication est ce
qu'ils disent.

**Ce qui ne s'imprime pas.** L'unité `aucune` du compilateur — un nombre qui n'est pas mesuré
n'a pas d'unité à montrer — et le mot d'un drapeau quand la figure le dit déjà : la ligne d'un
`arrondi` porte `ARRONDI` et sa valeur, jamais `ARRONDI oui 1 aucune`.

### Le vocabulaire clos de la bibliothèque

Tout ce que montre la page est cité du modèle, sauf deux listes fermées. Y ajouter est une
décision de langage, pas de design.

**Les glyphes d'opérateurs.** `+` `−` `×` `÷` `^` `<` `>` `≤` `≥` `=` `≠` `et` `ou`. Le mot-clé
que chacun remplace est celui de l'auteur (`somme`, `produit`, `division`, `supérieur`…), mais
un lecteur qui n'est pas développeur lit le glyphe, et c'est ce qu'un tableur montre.

**Les noms d'états.** `non défini`, `non applicable`, `fournie`, `par défaut`,
`non renseignée`. Les deux premiers sont les noms des symboles de la trace ; les autres ceux du
contexte du calcul.

**Les mots-clés de mécanismes**, affichés tels que le langage les écrit : `somme`, `produit`,
`variations`, `si`, `alors`, `sinon`, `applicable si`, `non applicable si`, `par défaut`,
`plafond`, `plancher`, `arrondi`, `arrondi à l'inférieur`, `arrondi au supérieur`,
`toutes ces conditions`, `une de ces conditions`, `une possibilité`, `moyenne`,
`contexte`, `type`. Jamais paraphrasés.

```
somme                                    ← l'intitulé de l'équation
    Transport du public            2 612 542 kgCO2e
  + Transport des artistes           180 000 kgCO2e
  ──────────────────────────────────────────────────
  = Transport                      2 792 542 kgCO2e      ← le résultat, une seule fois
```

Une expression de plusieurs opérandes est une équation dont les opérateurs se suivent dans
l'ordre où le modèle les écrit, parce que l'ordre change le résultat :

```
expression
    part                                      0,55
  × nombre de déplacements               200 000
  × distance moyenne aller/retour        100 km          par défaut
  × empreinte par km              0,231 kgCO2e/km
  ÷ remplissage moyen                      1,8
  ──────────────────────────────────────────────────
  = Voiture                          1 411 667 kgCO2e
```

L'unité suit toujours son nombre. Jamais de colonne d'unités : c'est en lisant `km` au-dessus
de `kgCO2e/km` que le lecteur voit l'unité se simplifier.

**Au-delà de quatre opérandes**, l'équation montre les quatre premiers dans l'ordre du modèle,
puis replie le reste derrière un contrôle qui en donne le nombre et la somme : « et 3 autres,
pour 412 000 kgCO2e ». Déplié, le reste apparaît dans le même ordre et avec les mêmes
opérateurs. Quatre est ce qu'un lecteur tient en tête d'un coup ; la somme repliée garde
l'équation exacte sans la rendre longue.

### Où commence un trait de séparation

Un trait commence au bord de la colonne des noms de la ligne à laquelle il
appartient, jamais avant : la colonne qui porte `−`, `arrondi`, `si` ou `alors`
reste libre, à toute profondeur. Les traits de deux niveaux ne sont donc pas
alignés entre eux — chacun l'est avec le texte de sa propre ligne.

Ce qui décide n'est ni le papier ni l'indentation, mais le nom de la ligne : une
ligne ouverte, une ligne de la liste racine et une ligne écrite sur une fiche
obéissent à la même règle, et une règle qui déplie une fiche ne déplace pas son
propre trait.

Le papier n'a pas de bord supérieur : le trait de la ligne ouverte le fait, et il
couvre toute la largeur du papier — c'est pourquoi la première ligne d'une fiche
n'a pas de trait à elle. Son bord inférieur, lui, est à lui et couvre la même
largeur, si bien qu'une fiche est un cadre fermé dont les traits intérieurs
restent en retrait.

### Copier le calcul en texte brut

Copier un calcul garde sa forme : une tabulation par niveau d'indentation, une
tabulation entre le nom et sa valeur, et un retour à la ligne par ligne. Ces
tabulations vivent dans le DOM comme nœuds de texte — une grille ignore les nœuds
faits d'espaces — donc l'écran ne change pas et rien n'est reconstruit au moment
de la copie.

### Une valeur que le modèle ne calcule pas ici

Un chiffre qui n'est pas calculé là où il s'affiche doit se voir sans qu'on ouvre
quoi que ce soit : le lecteur qui cherche l'origine d'un nombre n'a pas à cliquer
pour découvrir qu'il n'y en a pas.

Le fait est porté par le chiffre lui-même, et par lui seul : un paramètre s'écrit
avec un souligné pointillé, et l'infobulle du chiffre dit ce que cela veut dire —
« Paramètre du modèle : cette valeur n'est pas calculée ici. » C'est la même
phrase, mot pour mot, que la fiche affiche quand la règle n'a pas de calcul à
montrer : un fait, une formulation, deux moments. Les deux autres états en changent
la seconde moitié : « valeur par défaut, que vous pouvez remplacer », et « aucune
valeur n'a été fournie ». Le mot `par défaut` devant le chiffre reste : lui qualifie
la valeur, pas la nature de la règle. Rien ne marque la ligne à côté de son nom.

| État | Le chiffre | À côté du chiffre |
|---|---|---|
| *fournie* | encre, souligné pointillé | — |
| *par défaut* | gris, souligné pointillé | le mot `par défaut` |
| *non renseignée* | — | `non défini`, en rouge |

Le **poids** du chiffre ne dit rien de tout cela : il suit celui du nom de la
ligne. Une ligne est en gras exactement quand son explication est ouverte, et son
chiffre avec elle ; fermée, la ligne s'écrit en poids normal. Le gris et le
pointillé disent le reste.

Le souligné pointillé marque le paramètre, pas son état : il est tracé à l'encre,
pour rester lisible sous un chiffre gris. Le mot qui précède le chiffre est un mot
et non une valeur : il ne prend jamais les marques du chiffre.

Une règle déclarée paramètre de l'API mais qui **calcule** sa valeur ne porte ni
pointillé ni infobulle : c'est le fait — « cette valeur vient du contexte » — que
l'on montre, pas la catégorie.

### Ce que portent le nom et l'en-tête

- **`unit`** accompagne la valeur, toujours.
- **`type`** n'apparaît que là où l'unité ne dit rien : une règle de texte, de booléen ou de
  date le montre auprès de son nom ; une règle numérique dont l'unité suffit ne le répète pas.
- **`public`** ne se marque pas : la vue le porte (`isPublic`) et l'hôte en fait ce qu'il veut — c'est
  la déclaration d'API de l'auteur, et elle donne à la règle son chemin dans l'index. Le lecteur,
  lui, n'en a pas besoin.

**Un modificateur n'est pas une équation : c'est une annotation sur la valeur qu'il change.**
Il s'écrit sur la ligne du résultat, mot-clé du langage d'abord, et marqué pris effet ou sans
effet. **La dernière ligne du mécanisme de valeur porte un filet plein**, là où toutes les autres
portent un pointillé : au-dessus d'elle, ce qui compose la valeur ; en dessous, ce que la chaîne
y ajoute — un `par défaut`, un `plancher`, un `contexte`.

```
valeur
  Distance moyenne aller/retour            100 km
  ────────────────────────────────────────   ← le filet plein
  par défaut 100 km — pris effet, rien n'a été saisi
  plancher 0 km
```

**`contexte` ne change pas la valeur : il dit sous quel contexte elle a été calculée.** Son mot
ouvre l'en-tête du tableau qu'il annonce — `contexte`, `valeur du paramètre`, sur une ligne —
et ce tableau est imprimé sans qu'on ait à le déplier : ce qui décide de ce que la règle vaut ne se
cache pas. Ses lignes sont les règles liées, chacune avec sa valeur, comme n'importe quelle ligne
du calcul — et sans état : la valeur vient du modèle, pas du lecteur, donc elle ne porte pas la
marque d'un paramètre. C'est le seul mécanisme enchaîné dont l'explication ne soit pas un calcul.

**Un mécanisme sans opérateur se nomme.** Une somme s'écrit avec ses `+`, un produit avec ses
`×` ; `variations`, `toutes ces conditions`, `une de ces conditions`, `le plus petit de` et `le
plus grand de` n'ont pas d'opérateur à eux, et une ligne repliée porte donc leur nom. Sans
lui, le lecteur n'a qu'un chiffre sans l'opération qui l'a produit. Ce nom s'écrit comme tous
les mots du langage : la pastille de l'étiquette, la notation, et la casse de l'auteur.

**L'opérateur porte le même contour.** `+`, `−` et `×` sont des signes, pas des mots : ils
partagent le contour de l'étiquette — un filet, une seule encre — mais pas sa taille. Un signe
se lit à la taille de la notation, un mot à celle de l'étiquette.

**Une condition s'écrit avec les mots du langage**, `si`, `alors`, `sinon`, et la branche prise
est marquée ; les autres sont cachées par défaut avec leur nombre, et révélées par le pli de
la fiche (I3) :

```
variations
  si   l'activité est artisanale              non
  alors                                       0,3 %
  sinon                                       0,1 %        ← prise
  ──────────────────────────────────────────────────
  = taux BIC                                  0,1 %
```

Quand c'est une condition qui est retenue, elle vient avec sa conséquence, et les autres
restent cachées. Quand c'est le `sinon`, la fiche s'ouvre sur **toutes** ses branches : un
`sinon` seul afficherait un taux que rien n'explique, alors que ce sont les conditions écartées
qui le justifient. Le pli reste là pour les refermer.

**Une énumération liste son domaine** et marque le membre retenu :

```
une possibilité
  végétalien
  végétarien
  mixte végé viande                          ← retenu, par défaut
  viande uniquement
  = Régime alimentaire des artistes          mixte végé viande
```

**Une règle qui ne s'applique pas le dit**, et ce n'est ni zéro ni une absence :

```
applicable si   nombre artistes en avion > 0          non
  = Transport des artistes — avion            non applicable
```

**L'imbrication est une équation dans une équation.** Déplier une référence depuis sa fiche
(I2) insère son équation sous sa ligne d'opérande. Rien n'est montré d'une règle référencée tant
qu'elle n'est pas dépliée : sa ligne porte son nom et sa valeur, c'est tout.

### Les quatre absences

Une règle peut ne pas avoir de valeur pour quatre raisons différentes, qui ne se ressemblent
pas et ne s'affichent pas pareil. Aucune ne ressemble à zéro.

- **non défini** — le contexte ne fournit rien et rien ne calcule une valeur. C'est l'état
  normal d'un paramètre auquel personne n'a répondu.
- **non applicable** — la règle ne s'applique pas dans ce contexte, ce qui est une réponse.
  Une condition `applicable si` fausse y mène.
- **sans calcul propre** — la règle n'a pas de mécanisme de valeur : le compilateur ne sait pas
  encore la calculer, ou elle n'existe que comme entrée. La page montre alors le nom, l'unité et
  la description de l'auteur, et rien qui ressemble à un résultat.
- **non renseignée** — vue depuis le contexte du calcul : l'entrée manque, et c'est sur elle que
  le lecteur peut agir.

Ce qu'une ligne ne peut pas écrire, elle le tait dans sa forme en ligne : un opérande sans
forme écrite — un mécanisme, dont le nom n'est pas une écriture — y laisse un `…`. `BIC ×` se
lirait comme une troncature ; `BIC × …` dit qu'il y a un terme de plus, écrit sous la ligne.

La ligne de résultat d'une équation porte l'état qui convient, en toutes lettres. Jamais un
filet vide, jamais un tiret : une absence nommée est une information, une case vide est un bug
que le lecteur doit deviner.

```
somme
    produit : chiffre d'affaires . BIC × taux BIC          10 €/an
  + produit : chiffre d'affaires . service BNC × taux BNC   0 €/an
  ─────────────────────────────────────────────────────────────────
  = CFP                                                    10 €/an

  produit : chiffre d'affaires . BIC × taux BIC        ← déplié par le lecteur
      chiffre d'affaires . BIC                10 000 €/an
    × taux BIC                                     0,1 %
    ──────────────────────────────────────────────────────
    =                                             10 €/an
```

Et le même calcul dans l'autre domaine, pour vérifier que la règle tient :

```
expression
    chiffre d'affaires                        10 000 €/an
  − cotisations et contributions                  10 €/an
  ─────────────────────────────────────────────────────────
  = Revenu net                               9 990 €/an
```

---

## 5. Les interactions

Trois. Chacune est décrite par ce qu'elle montre, ce qu'elle cache, et ce qu'elle change.

### I1 — Aller à une règle

- **Déclencheur** : un nom dans l'index de la page, dans la liste des règles qui consomment
  celle-ci, ou le petit contrôle qui suit le nom d'une règle qui a une page — que sa fiche soit
  ouverte ou non : il mène ailleurs, il n'ouvre rien. Une ligne fermée, sinon, ne navigue jamais :
  son nom déplie (I2).
- **Montre** : la page entière de la règle visée.
- **Cache** : la page courante. La place du lecteur est préservée par l'hôte (historique, ou
  pile de navigation) — c'est son affaire, pas celle de la bibliothèque.
- **Change** : l'URL quand l'hôte en donne une, sinon l'état de sa navigation. Le lien est
  bleu ; rien d'autre sur la page ne l'est.

### I2 — Déplier une référence

- **Déclencheur** : la ligne entière. Le nom, la valeur, la colonne de l'opérateur et la marge
  répondent au même clic. Le nom reste un bouton, pour que le clavier ait son contrôle, mais il
  s'écrit comme du texte : ni lien, ni souligné, rien qui le désigne.
- **L'affordance est le survol, et le survol seulement** : sous le pointeur, le nom de la ligne
  se souligne, et seulement si la ligne ouvre quelque chose. Rien ne change de fond, rien ne
  s'éclaire. Au repos, aucune marque ne décore la ligne. Un lecteur au doigt n'a donc aucun
  indice tant que la fiche est fermée ; c'est le prix de la ligne nue, et le contrôle de repli
  prend le relais dès qu'une fiche est ouverte.
- **Un seul contrôle par référence**, quoi qu'il y ait derrière : en avoir deux selon ce que la
  règle porte rendrait leur présence arbitraire aux yeux du lecteur.
- **Montre** : le calcul de cette règle dans ce contexte, sous la ligne, dans la même mise en
  page qu'un cran plus loin. Le pli est la fiche : il n'ouvre aucun panneau et ne remplace rien.
- **Ne déplace rien.** Une ligne dépliée garde sa grille, son retrait et sa marge : seuls le
  poids de son nom et le filet qui ferme sa feuille changent. Le lecteur suit sa ligne des yeux
  sans la rattraper, et il ne la perd pas non plus : la ligne est le même nœud avant et après le
  pli, donc le focus reste où il était.
- **Le papier** mesure le bloc : il part de la colonne de l'opérateur — le `−`, le `+`, le `×`,
  ou le mot du mécanisme, `si`, `alors`, `sinon`, `arrondi` — et va jusqu'au bord droit de la
  ligne, sur la ligne et sur le calcul qu'elle ouvre. À gauche du papier, la couleur du parent.
- **L'explication** a la mise en page du calcul racine, posée dans la feuille qu'elle ouvre :
  à partir du bord de cette feuille — là où s'arrête le trait de la ligne du dessus — et d'un
  retrait de feuille encore, pour que le contenu d'une fiche ne chevauche jamais son propre
  cadre. Une fiche ouverte dans une fiche part donc d'un cran de plus encore, et la profondeur
  se lit au bord gauche du papier.
- **Le papier alterne** avec la profondeur, pour qu'un pli dans un pli se voie.
- **Le même geste pour un mécanisme** : le terme écrit d'une expression, ou la valeur d'une
  ligne dont le terme est la valeur, déplie ses opérandes comme un nom déplie sa règle. Une
  seule apparence pour un contrôle, qu'il ouvre une règle ou un mécanisme — et aucun contrôle
  là où il n'y a rien à déplier : un chiffre qui n'a que lui-même s'écrit comme du texte.
- **Une fiche qui n'imprime qu'une seule ligne ne pose aucune question** : l'ouvrir ouvre
  aussi cette ligne, et de même tant que chaque fiche n'imprime qu'une ligne, jusqu'à une
  fiche qui en imprime deux. La chaîne suit les lignes qui ont des lignes à imprimer : une
  fiche vide reste à la demande du lecteur, et le dit en une phrase plutôt que de s'ouvrir sur
  rien. Elle s'arrête là où il y a un choix à faire, et chaque ligne qu'elle a ouverte reste
  repliable pour elle-même : l'ouverture est un état du lecteur, pas une déduction de la vue.
  **La règle vaut aussi pour la page** : un calcul racine qui n'imprime qu'une ligne arrive
  ouvert, cette ligne et sa chaîne comprises.
- **Change** : la profondeur du calcul affiché. Repliable par le même contrôle. La profondeur
  n'est pas bornée ; chaque niveau déplié est une équation complète et le lecteur décide seul
  jusqu'où descendre, la ligne unique d'une fiche exceptée.
- **Sans calcul propre** : la fiche le dit, plutôt que de montrer une équation vide. Une fiche
  vidée de ses termes par le lecteur se termine de même sur « Aucun terme à montrer. »

### I3 — Rétablir la coupe

- **Déclencheur** : le contrôle de repli, sur la ligne dont l'équation cache des termes — la
  ligne du résultat pour le calcul de la règle, celle de la référence ou du mécanisme quand
  c'est sa fiche qui cache.
- **Forme** : un double chevron, vers le bas pour révéler, vers le haut pour replier, et un
  nombre encerclé qui donne le compte des termes cachés — un contour, jamais un fond plein. Le
  libellé — « Afficher 2 termes sans effet » — vit dans l'infobulle et dans le nom accessible,
  jamais sur la ligne.
- **Place** : à l'extrémité droite de sa ligne, au-delà du bord de celle-ci, dans la marge
  vide : le calcul ne lui cède aucune place, et aucune ligne de plus ne sépare rien. Sur un
  écran étroit, il prend une ligne à lui, aligné à droite.
- **Montre** : les termes qui n'ont pas joué — les branches non prises, les modificateurs sans
  effet — à leur place et dans l'ordre du modèle. Les branches d'une condition s'y trouvent,
  avec le pli de sa propre fiche.
- **Cache** : rien. Par défaut ces termes sont cachés et leur nombre est indiqué — sauf les
  conditions d'un `sinon` retenu, que la fiche ouvre avec elle (voir « une condition s'écrit
  avec les mots du langage »). C'est le lecteur qui décide de vérifier que la règle ne fait rien
  d'autre.
- **Change** : la longueur de l'équation, pas sa valeur.

### Ce qui n'est pas une interaction

Fournir ou modifier un contexte depuis la page. L'API ne l'interdit pas ; la fonctionnalité
n'existe pas. Les entrées manquantes sont montrées, pas saisissables.

---

## 6. Les deux niveaux de remplissage

**Avec un contexte** : les valeurs sont calculées, le contexte du calcul liste ce qui a été
fourni, et les équations portent leurs résultats.

**Sans contexte** : la même page, mêmes blocs, mêmes équations — sans valeurs. Le contexte du
calcul liste les entrées sans état fourni ; les équations montrent leur structure et leurs
opérateurs. La ligne de résultat d'une équation sans valeur montre l'état d'absence de la règle
— `non défini`, `non applicable` — et jamais un filet vide ni un tiret. Aucune seconde mise en
page, aucune version dégradée : c'est la même, moins remplie.

Rien n'y est marqué : sans évaluation, aucune ligne n'a rien fait ni rien subi, donc aucune
n'est éteinte, et rien n'est retenu en repli. Et une ligne qui n'aurait rien à dire d'elle-même
s'ouvre d'emblée — celle qui porte le nom de son mécanisme, celle qui référence une règle dont
la valeur est un choix. Sans valeur à montrer, leur feuille *est* leur explication.

---

## 7. Ce qui n'est jamais montré

- Une clé du sac `meta`, quelle qu'elle soit.
- Un nom pointé dans la colonne de lecture : l'adresse vit sous le titre et dans la provenance.
- Une valeur deux fois. La valeur d'une règle apparaît une seule fois, à la ligne de résultat de
  son équation la plus externe — qui est aussi la réponse de la page ; un opérande porte la
  sienne parce qu'il est une partie, pas une répétition.
- Une phrase que la bibliothèque aurait écrite pour expliquer le calcul. Les intitulés de bloc
  et les états (`fournie`, `par défaut`, `non renseignée`, `non applicable`) sont un vocabulaire
  fermé ; tout le reste est cité du modèle.
- Le calcul d'une autre règle que celle de la page, sauf déplié par le lecteur (I2).
- Un nom de scénario, sauf fourni par l'hôte.

---

## 8. Ce que le prototypage a appris, et qui est devenu règle

- **Les titres du modèle battent toute paraphrase.** Quatre noms affichés sur onze étaient
  faux avant vérification, dont un factuellement : une règle qui compte les organisateurs et
  les bénévoles s'appelle « Nombre d'organisateurs et bénévoles », et la paraphrase avait
  perdu les organisateurs.
- **`par défaut` (61 fois) et `plancher` (39 fois) sont les mécanismes les plus fréquents
  d'ekofest**, loin devant `variations` (26) et `somme` (26). Un modificateur n'est pas un cas
  limite : c'est le cas courant.
- **La forme dominante change selon le domaine.** Le revenu est une somme de sommes ; le carbone
  est une quantité multipliée par un facteur dont l'unité se simplifie. Une notation pensée sur
  l'un des deux rate l'autre.
- **`note` fait deux métiers** — source d'un chiffre et liste de travaux — dans le même modèle.
  Le montrer dans le flux, c'est imprimer la liste de travaux du mainteneur devant le lecteur.
- **Une ouverture insérée dans le flux casse une expression en ligne.** `(part × déplacements ×
  distance × empreinte) ÷ remplissage` ne survit pas à un panneau qui pousse ses termes. D'où
  la superposition.
- **Un lecteur ne peut pas vérifier un chiffre sans savoir de qui il est.** La page montrait
  2 792 542 kgCO2e sans jamais dire dans quel contexte : c'était le défaut le plus grave relevé
  à la critique, et il venait d'avoir supprimé le bloc contexte comme duplication. La duplication
  était réelle ; l'affirmation, elle, était nécessaire.
- **Le détecteur mécanique ne voit rien de tout cela.** Il rend `[]` sur une page qui montre un
  champ de recherche inerte, trois boutons identiques sans nom accessible et un titre de niveau 2
  avant le titre de niveau 1. Sur ce projet, un scan propre n'est pas une preuve de qualité.
