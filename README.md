# Pokemon Type Training

Application SvelteKit pour s'entraîner aux matchups de types Pokémon (single et dual), avec pages de révision et quiz interactif.

## Démo

- Site public : [https://benlefr.github.io/pokemon-type-training/](https://benlefr.github.io/pokemon-type-training/)
- Quiz : [https://benlefr.github.io/pokemon-type-training/quiz/](https://benlefr.github.io/pokemon-type-training/quiz/)
- Double Battle : [https://benlefr.github.io/pokemon-type-training/double-battle/](https://benlefr.github.io/pokemon-type-training/double-battle/)
- Révision : [https://benlefr.github.io/pokemon-type-training/revision/](https://benlefr.github.io/pokemon-type-training/revision/)

## Stack

- SvelteKit
- Vite
- Tailwind CSS
- TypeScript

## Installation

```bash
npm install
```

## Lancement local

```bash
npm run dev
```

Accessible ensuite sur `http://localhost:5173`.

Pour exposer sur le réseau local :

```bash
npm run dev:host
```

## Build production

```bash
npm run build
npm run preview
```

## Scripts utiles

- `npm run check` : vérification TypeScript/Svelte
- `npm run data` : régénération des données JSON

## Déploiement

Le projet est déployé automatiquement sur GitHub Pages via GitHub Actions (`.github/workflows/deploy-pages.yml`) à chaque push sur `main`.
