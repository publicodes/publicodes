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
`avec le contexte`, `type`. Jamais paraphrasés.

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

### Ce que portent le nom et l'en-tête

- **`unit`** accompagne la valeur, toujours.
- **`type`** n'apparaît que là où l'unité ne dit rien : une règle de texte, de booléen ou de
  date le montre auprès de son nom ; une règle numérique dont l'unité suffit ne le répète pas.
- **`public`** se marque auprès du nom : c'est la déclaration d'API de l'auteur, et c'est elle
  qui donne à la règle son chemin. Un lecteur n'en a pas besoin ; un intégrateur, si.

**Un modificateur n'est pas une équation : c'est une annotation sur la valeur qu'il change.**
Il s'écrit sur la ligne du résultat, mot-clé du langage d'abord, et marqué pris effet ou sans
effet :

```
valeur
  Distance moyenne aller/retour            100 km
  par défaut 100 km — pris effet, rien n'a été saisi
  plancher 0 km
```

**Une condition s'écrit avec les mots du langage**, `si`, `alors`, `sinon`, et la branche prise
est marquée ; les autres sont cachées par défaut avec leur nombre, et révélées par
l'interaction I3 :

```
variations
  si   l'activité est artisanale              non
  alors                                       0,3 %
  sinon                                       0,1 %        ← prise
  ──────────────────────────────────────────────────
  = taux BIC                                  0,1 %
```

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

### I1 — Suivre une référence

- **Déclencheur** : le nom d'une règle référencée, qui est un lien.
- **Montre** : la page entière de la règle référencée.
- **Cache** : la page courante. La place du lecteur est préservée par l'hôte (historique, ou
  pile de navigation) — c'est son affaire, pas celle de la bibliothèque.
- **Change** : l'URL. C'est la navigation de chemin, disponible seulement pour les règles de
  l'API déclarée ; ailleurs le nom n'est pas un lien.

### I2 — Déplier une référence

- **Déclencheur** : le nom d'une règle référencée.
- **Montre** : le calcul de cette règle dans ce contexte, sous la ligne, dans la même mise en
  page qu'un cran plus loin. Le pli est la fiche : il n'ouvre aucun panneau et ne remplace rien.
- **Un seul contrôle par référence**, quoi qu'il y ait derrière : en avoir deux selon ce que la
  règle porte rendrait leur présence arbitraire aux yeux du lecteur.
- **Ne déplace rien.** Une ligne dépliée garde sa grille, son retrait et sa marge : seuls son
  fond et le poids de son nom changent. Le lecteur suit sa ligne des yeux sans la rattraper.
- **Le papier** mesure le bloc : il part de la colonne de l'opérateur — le `−`, le `+`, le `×`,
  ou le mot du mécanisme, `si`, `alors`, `sinon`, `arrondi` — et va jusqu'au bord droit de la
  ligne, sur la ligne et sur le calcul qu'elle ouvre. À gauche du papier, la couleur du parent.
- **L'explication** a la mise en page du calcul racine : même gouttière, un cran de plus. Une
  fiche ouverte dans une fiche part donc d'un cran de plus encore, et la profondeur se lit au
  bord gauche du papier.
- **Le papier alterne** avec la profondeur, pour qu'un pli dans un pli se voie.
- **Change** : la profondeur du calcul affiché. Repliable par le même contrôle. La profondeur
  n'est pas bornée ; chaque niveau déplié est une équation complète et le lecteur décide seul
  jusqu'où descendre.
- **Sans calcul propre** : la fiche le dit, plutôt que de montrer une équation vide.

### I3 — Rétablir la coupe

- **Déclencheur** : un contrôle sur une équation conditionnelle (`variations`, `applicable si`).
- **Montre** : les branches qui n'ont pas été prises, avec leur valeur ou leur absence.
- **Cache** : rien. Par défaut ces branches sont cachées et leur nombre est indiqué ; c'est le
  lecteur qui décide de vérifier que la règle ne fait rien d'autre.
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
