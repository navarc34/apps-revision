# Apps de révision — V2 bêta

Applications de révision de français et de latin, hébergées sur GitHub Pages.

## Graffigny
- Production (branche `main`, V1) : https://navarc34.github.io/apps-revision/fr/graffigny/
- Développement (branche `dev-chatgpt`, V2) : [code Graffigny](https://github.com/navarc34/apps-revision/tree/dev-chatgpt/fr/graffigny)
- Pour prévisualiser cette branche, utiliser un serveur HTTP local (VS Code Live Server ou `python -m http.server 8000` depuis la racine). **GitHub Pages publie actuellement `main`, pas `dev-chatgpt`.**

## Architecture V2
```text
shared/
  vendor/react.production.min.js
  vendor/react-dom.production.min.js
  revision-engine.js  # historique, intervalles, sélection quotidienne, statistiques
  ui.js               # quatre exercices et composants React réutilisables
  styles.css          # design commun de la V2
fr/graffigny/
  index.html          # point d'entrée GitHub Pages
  data.js             # 118 items, IDs et tags
  app.js              # navigation, révision du jour, thèmes, tableau de bord
```

## Principes
- Trois niveaux : basique, avancé, expert. Le niveau supérieur reste accessible avec un conseil de progression (pas de verrou).
- Quatre exercices conservés : flashcards, QCM, vrai/faux, citations. **Pas de saisie libre**.
- Une session quotidienne de 12 items : révisions arrivées à échéance en priorité, puis erreurs, questions nouvelles, consolidations.
- Après erreur : revoir à partir de 15 minutes ; après réussite : 1, 3, 7 jours puis allongement graduel jusqu'à 30 jours.
- Historique et échéances enregistrés **localement** par navigateur (pas de compte ni synchronisation multi-appareils).
- Maîtrise estimée par item. Les anciens meilleurs scores V1 sont conservés dans `legacyScores` à la première ouverture, mais **ne sont pas transformés artificiellement en résultats par item**.
- L'identifiant d'un item doit rester stable après publication : ne pas réordonner le tableau de questions existant sans remplacer les IDs générés à partir des positions par des IDs explicites.
- Analytics V1 conservés sans changement de finalité ; RGPD et stratégie de télémétrie à revoir ultérieurement.

## Vérifications effectuées
- Analyse syntaxique JavaScript des six scripts, sans erreur.
- Contrôle des 118 items et de l'unicité des 118 identifiants.
- Validation structurelle des QCM, vrai/faux et citations.
- Simulation du suivi par item et de la sélection d'une session de 12 questions.

**À faire avant une fusion dans main** : vérification visuelle dans les navigateurs cibles, test mobile / clavier, amélioration des flashcards trop longues, suppression de la dépendance Tailwind CDN héritée des écrans V1.

## Publier plus tard
Une fois la V2 validée, fusionner `dev-chatgpt` dans `main`. Aucun déploiement en production n'est effectué par cette branche.
