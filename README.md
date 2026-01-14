# Odd none out

A cozy, category-guessing word puzzle built with React, Vite, and TypeScript.

## Local development

- Install dependencies: `npm install`
- Start dev server: `npm run dev`

## Checks

- Tests: `npm test`
- Build: `npm run build`

## GitHub Pages build

Build with the correct base path for Pages:

```
GITHUB_PAGES=true npm run build
```

Deploy the `dist` folder to your GitHub Pages branch.

## PWA testing

1. Build: `npm run build`
2. Serve `dist` locally: `npm run preview`
3. Open the app, then check DevTools > Application for the manifest and service worker.

## iOS install

1. Open the site in Safari.
2. Tap Share.
3. Choose "Add to Home Screen".
