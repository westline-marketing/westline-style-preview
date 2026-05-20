---
type: decision
project: westline-style-selector
date: 2026-04-18
status: accepted
supersedes:
tags: [decision]
---

# Publish as public npm package

## Context

`package.json`, `README.md`, `GUIDE.md`, `CHANGELOG.md`, root `CLAUDE.md`, and git commits around `v0.1.0` and `v0.1.1` all document the package as a public npm package named `@westline/style-selector`.

## Decision

Distribute the shared style selector engine as a public npm package with `publishConfig.access: public`.

## Why

The package is intended to be installed into multiple Westline client site repos without copying source. Public install keeps local machines, Vercel, Railway, and other CI systems from needing consumer-side `.npmrc` or npm auth.

## Alternatives

- Keep the source private and require `NPM_TOKEN` or `.npmrc` in every consumer.
- Copy source files into each consuming repo.
- Publish a private package.

## Consequences

- Consumers install with `npm install @westline/style-selector`.
- Consumer CI does not need registry authentication for install.
- Publishing still requires npm auth in the release workflow through `NPM_TOKEN` / `NODE_AUTH_TOKEN`.
- Package source and docs are public through the GitHub repo metadata observed during backfill.

## Links

- [[04-code-map#Deployment]]
- [[deploy]]
- `package.json`
- `README.md`
- `GUIDE.md`
- `CHANGELOG.md`
- `.github/workflows/publish.yml`
