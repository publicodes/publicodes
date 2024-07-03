---
sidebar_position: 2
title: Ajouter des tests unitaires
---

Un des avantages des algorithmes publi.codes est qu'ils permettent d'isoler la logique métier du reste de votre application, ce qui les rend testables facilement.

Dans l'exemple suivant on va tester unitairement avec [`jest`](https://jestjs.io/fr) un algorithme publi.codes.

## Implémentation

Ajoutez `jest` dans vos devDependencies

L'algorithme :

```yaml
taille:
    question: Quelle est votre taille (en cm) ?
    unité: cm

poids:
    question: Quel est votre poids (en kg) ?
    unité: kg

# Convertit la taille en mètres
taille mètres:
    valeur: taille
    unité: m

# Calcul l'IMC à partir de la taille en mètres
imc:
    valeur: poids / ((taille mètres) * (taille mètres))
    unité: kg / m²

# Affiche le résultat
résultat:
    applicable si: imc
    texte: |
        Votre IMC est de {{ imc }}
        Interprétation: {{ résultat . interpretation }}

# Interprétations de l'IMC
résultat . interpretation:
    variations:
        - si: imc >= 40
          alors: "'obésité morbide ou massive'"
        - si: imc >= 35
          alors: "'obésité sévère'"
        - si: imc >= 30
          alors: "'obésité modérée'"
        - si: imc >= 25
          alors: "'surpoids'"
        - si: imc >= 18.5
          alors: "'poids normal'"
        - si: imc >= 16.5
          alors: "'maigreur'"
        - sinon: "'dénutrition'"
```

Les tests, à placer dans un fichier `*.test.ts` près de votre algorithme :

```ts
import rules from './modele.json';
import Engine from 'publicodes';

test('doit renvoyer le bon IMC pour T=170,P=80)', () => {
    const engine = new Engine(rules);
    engine.setSituation({
        poids: '80kg',
        taille: '170cm'
    });
    const evaluated = engine.evaluate('imc');
    // teste la valeur brute
    expect(evaluated.nodeValue).toEqual(27.68166089965398);
    // teste la valeur formatée
    expect(formatValue(evaluated)).toEqual('27,68\u00A0kg / m²');
});

test('doit renvoyer la bonne interpretation pour T=150,P=90)', () => {
    const engine = new Engine(rules);
    engine.setSituation({
        poids: '90kg',
        taille: '150cm'
    });
    const evaluated = engine.evaluate('résultat');
    expect(evaluated.nodeValue.trim()).toEqual(
        // le caractère `\u00A0` est un espace insecable inséré par publi.codes lors du formatage d'unité
        `Votre IMC est de 40\u00A0kg / m²\nInterprétation: obésité morbide ou massive`
    );
});
```

Lancez `yarn jest` et intégrez ces tests [dans votre intégration-continue](https://github.com/publicodes/publicodes/blob/3161e4017970a77f8a793fc0bb614643b28b758e/.github/workflows/test.yaml#L12) pour détecter d'éventuelles régressions.

Tip: Utilisez [`test.each`](https://jestjs.io/fr/docs/api#testeachtablename-fn-timeout) pour créer des tableaux de tests.
