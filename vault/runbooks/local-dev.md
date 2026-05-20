---
type: runbook
project: westline-style-selector
updated: 2026-05-11
tags: [runbook, local-dev]
---

# Local dev

## Prerequisites

- Node/npm environment compatible with the package lockfile.
- React is a peer dependency for consumers; this repo has React dev dependencies for tests.

## Setup

```bash
npm ci
```

Use `npm install` when intentionally changing dependencies.

## Core checks

```bash
npm run typecheck
npm test
npm run build
npm run release:check
```

Backfill verification on 2026-05-11:

- `npm test` passed `13` test files and `281` tests.
- `npm run typecheck` exited successfully.

## Demo server

```bash
node demo/serve.js
```

The demo script generates `demo/dist/*.html` and serves one preset per port:

- `http://localhost:3001` - Current Design
- `http://localhost:3002` - Cool Steel
- `http://localhost:3003` - Warm Earth
- `http://localhost:3004` - Forest Moss

## Test package in a consuming repo

```bash
npm run build
npm pack
```

Install the generated `westline-style-selector-<version>.tgz` from the consuming repo, then switch the consumer back to the published package when finished.

## Memory checks

```bash
WM_PROJECTS_DIR="$PWD" ~/bin/wm-vault-doctor.sh
```
