# Apps de révision

Applications de révision de français et de latin, hébergées sur GitHub Pages (branche `main`).

- Graffigny (V2) : https://navarc34.github.io/apps-revision/fr/graffigny/

## Architecture V2
```text
shared/
  vendor/react.production.min.js       # React 18 local, aucun CDN
  vendor/react-dom.production.min.js
  revision-engine.js  # mémoire par item, intervalles espacés, session du jour, statistiques
  ui.js               # composants et quatre exercices réutilisables
  styles.css          # design commun + utilitaires, aucune dépendance externe
fr/graffigny/
  index.html          # point d'entrée GitHub Pages (tracking + chargeur)
  data.js             # 118 items, IDs stables et tags
  app.js              # navigation, révision du jour, thèmes, tableau de bord
tests/
  smoke.js            # node tests/smoke.js
```

Le socle `shared/` est commun à la famille des apps « œuvres ». Une nouvelle app = un dossier `data.js` + `app.js` + `index.html` ; les apps latines (vocabulaire, autre logique) ne seront pas forcées dans ce moteur.

## Principes
- Trois niveaux : basique, avancé, expert. Accès libre, avec un conseil de progression (pas de verrou).
- Quatre formats : flashcards, QCM, vrai/faux, citations. Pas de saisie libre.
- Session du jour (12 items) : révisions à échéance en priorité, puis erreurs, notions nouvelles, consolidations.
- Répétition espacée : erreur → revoir dans 15 min ; réussite → 1, 3, 7 jours puis graduel jusqu'à 30 jours.
- Progression enregistrée localement par navigateur (pas de compte, pas de synchronisation).
- Maîtrise estimée par item ; les anciens scores V1 sont conservés (`legacyScores`) sans conversion artificielle.
- Les IDs d'items publiés ne doivent jamais être réordonnés ni renumérotés.
- Télémétrie pseudonymisée (UID par navigateur, appareil) vers Apps Script ; aucune donnée nominative.

## Vérifications
- Syntaxe des six scripts validée (`node --check`).
- 118 items, 118 IDs uniques, structure des QCM / vrai-faux / citations validée.
- Rendu des 12 modules testé, classes CSS couvertes par `shared/styles.css`.
- `node tests/smoke.js` : persistance, échéances et sélection quotidienne.

## Développement
Serveur local : `python -m http.server 8000` depuis la racine, puis ouvrir `http://localhost:8000/fr/graffigny/`.
