---
type: decision
project: westline-style-selector
date: 2026-04-18
status: accepted
supersedes:
tags: [decision]
---

# Use instanceId for preview storage

## Context

`README.md`, `GUIDE.md`, root `CLAUDE.md`, `PROMPT-TEMPLATE.md`, `src/core/namespace.ts`, `src/core/persistence.ts`, `src/core/prepaint.ts`, and tests all identify `instanceId` as the primary namespace for preview state. `storageKey` remains for legacy migration.

## Decision

New integrations should set a stable `instanceId`; `storageKey` should be used only when migrating from an older preview implementation.

## Why

A stable instance namespace prevents collisions across multiple preview instances and lets the runtime and prepaint script share one identity. Keeping `storageKey` as a legacy input allows existing sessions to migrate without losing saved preset state.

## Alternatives

- Keep `storageKey` as the primary integration field.
- Use one global storage key for every consumer.
- Avoid persisted preset state entirely.

## Consequences

- Active preset persists in `sessionStorage` under `instanceId ?? storageKey ?? wm-preview`.
- Trigger position persists in `localStorage` using the same namespace plus `-tab-y`.
- When both `instanceId` and a different `storageKey` are present, the package migrates the legacy stored preset.
- New docs and prompts should keep saying `instanceId`, not `storageKey`, for new sites.

## Links

- [[04-code-map#Data model]]
- `src/core/namespace.ts`
- `src/core/persistence.ts`
- `src/core/prepaint.ts`
- `README.md`
- `GUIDE.md`
