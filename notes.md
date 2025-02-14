## Première étape : mesurer

- Faire tourner le bench entre 2 versions de publicodes
- Historiser les résultats de perf entre les versions
- Paramétrer (via CLI à terme ?) pour cibler les versions à comparer (possible car déploiement continu du package)
- Gérer 2 imports dans le même repo ? Via un import dynamique ?
- Pour avoir un truc stable, identifier un runner unique

2 choses:

- Une fonction pour comparer les perfs entre 2 versions
- Une manière d'ajouter la comparaison entre 2 versions dans la CI (+ "perflog" ?)
