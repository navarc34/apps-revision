# Historique des versions

Les versions sont propres à chaque application. Le numéro affiché dans l’app correspond à la métadonnée `app-version` de sa page HTML.

| Application | Entrée | Version |
|---|---|---|
| L’Énéide | `latin/eneide/` | 1.2.2 |
| Lettres d’une Péruvienne | `fr/lettres-peruvienne/` | 1.0.0 |
| Ourika | `fr/ourika/` | 1.0.0 |
| Americanah | `fr/americanah/` | 1.3.0 |

## 21 novembre 2026

- **L’Énéide 1.2.2** — Renvois simplifiés dans les corrigés. Ils indiquent le chant et l’épisode.

- **L’Énéide 1.2.1** — 40 activités sur les chants I à IV, niveaux Débutant et Expert, filtre par chant, éclairages dans les corrigés et libellés validés. Première publication sur `main`.
- **Lettres d’une Péruvienne 1.0.0** — Version de l’app du catalogue de français, avec révision de l’œuvre et préparation de l’entretien. Numéro V1.0 normalisé.
- **Ourika 1.0.0** — Version de révision et de préparation de l’entretien. Numéro V1.0 normalisé.
- **Americanah 1.3.0** — Version de révision et de préparation de l’entretien. Numéro V1.3 normalisé.

## Publier une version

Pour l’app modifiée, incrémenter le numéro `MAJEUR.MINEUR.CORRECTIF` dans la métadonnée, le numéro affiché et les URL de ses ressources locales portant un paramètre `v=`. Ajouter l’entrée datée à cet historique et actualiser la version courante. Utiliser un correctif pour une correction, une version mineure pour un ajout compatible et une version majeure pour une rupture de compatibilité. Publier sur `main` après validation sur `dev-chatgpt`.
