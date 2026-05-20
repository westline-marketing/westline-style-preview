---
type: decision
project: westline-style-selector
date: 2026-04-18
status: accepted
supersedes:
tags: [decision]
---

# Separate server and client entrypoints

## Context

`package.json` exports both `.` and `./client`. `src/index.ts` is labeled server-safe and exports `PrepaintScript` and pure utilities. `src/client.ts` starts with `'use client'` and exports `StyleSelector`, `useStyleSelector`, and `buildPreviewUrl`. The README and GUIDE show this import split for consuming apps.

## Decision

Expose server-safe APIs from `@westline/style-selector` and client-only runtime APIs from `@westline/style-selector/client`.

## Why

Next.js consumers need to mount a prepaint script from server-safe layout code while keeping interactive drawer behavior in a client boundary.

## Alternatives

- Export all components from the root package.
- Ask every consuming app to wrap imports in its own client boundary.
- Ship only a client component and accept first-paint flash.

## Consequences

- Consumers import `PrepaintScript` from the root package.
- Consumers import `StyleSelector` from the `/client` subpath.
- Future exports must preserve the root package's server-safe boundary.
- Tests and docs should continue covering both entrypoints.

## Links

- [[04-code-map#Primary entrypoints]]
- `package.json`
- `src/index.ts`
- `src/client.ts`
- `README.md`
- `GUIDE.md`
