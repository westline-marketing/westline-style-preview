---
type: runbook
project: westline-style-selector
updated: 2026-05-11
tags: [runbook, deploy]
---

# Deploy

This repo deploys by publishing `@westline/style-selector` to npm. It is not a hosted web application.

## Evidence-backed release path

The GitHub Actions workflow at `.github/workflows/publish.yml` runs on pushed tags matching `v*`.

Workflow steps:

```bash
npm ci
npm test
npm run build
npm publish --access public --provenance
```

The workflow uses Node 20 and maps the GitHub secret `NPM_TOKEN` to `NODE_AUTH_TOKEN` for npm publish.

## Pre-tag checklist

```bash
npm run typecheck
npm test
npm run build
npm run release:check
```

Also update `package.json` version and `CHANGELOG.md` before tagging a release.

## Tag publish

```bash
git tag v<version>
git push origin v<version>
```

Current local tags at backfill time: `v0.1.0`, `v0.1.1`, `v0.1.2`, `v0.1.3`, `v0.1.4`.

## Known release facts

- Package name: `@westline/style-selector`.
- Current local version: `0.1.4`.
- `publishConfig.access` is `public`.
- Package install is public and does not require consumer `.npmrc` or auth.
- GitHub Releases were not present during the 2026-05-11 backfill.

## Unknowns

- Release owner/steward is not documented.
- npm registry latest version was not verified during backfill.
