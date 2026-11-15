# apps-revision

Référentiel des applis de révision hébergées sur GitHub Pages : **https://navarc34.github.io/apps-revision/**

## Structure

Chaque app vit dans un sous-dossier, par matière et par œuvre/compétence :

| Chemin | App | Statut |
|---|---|---|
| `fr/graffigny/` | Lettres d'une Péruvienne (1ʳᵉ ST2S3) — 3 niveaux (basique / avancé / expert) × 4 exercices | V1 en ligne |
| `latin/voc/` | (à venir) vocabulaire latin | |
| `latin/spe/` | (à venir) spécialité LLCA latin | |
| `latin/option/` | (à venir) option latin | |

## Conventions

- Une app = un `index.html` autonome (React 18 UMD + Tailwind, JSX précompilé), aucun build requis.
- GitHub Pages : *Deploy from a branch* — branche `main`, dossier `/ (root)`.
- Suivi d'audience anonyme via le script Apps Script partagé (voir constante `TRACK_URL` dans chaque app).
- Aucune donnée personnelle d'élève dans ce dépôt public.
