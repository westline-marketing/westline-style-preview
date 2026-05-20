# CLAUDE.md - Vault Operating Manual

This file is the canonical operating manual for any agent working inside this Obsidian vault. Claude Code reads root `CLAUDE.md`; Codex reads root `AGENTS.md`; both must follow this vault manual once they enter `vault/`.

This vault is the project's long-term memory. Code lives in the repo; why the code looks the way it does lives here.

---

## 1. Session start protocol

At the start of every substantive coding or planning session, read these files in order before changing code:

1. `CLAUDE.md` - this operating manual.
2. `AGENTS.md` - Codex bridge and quick rules.
3. `01-project-context.md` - client, goals, constraints, stack, key links.
4. `02-architecture.md` - current technical shape of the system.
5. `04-code-map.md` - entrypoints, routes, services, data, commands, deployment.
6. `03-status.md` - current phase, status, blockers, next actions.
7. `tasks.md` - Now / Next / Later queue.
8. `handoff.md` - latest handoff for the next agent.
9. `LESSONS.md` - corrections and durable patterns learned from prior mistakes.
10. `knowledge/index.md` - compiled durable knowledge map.
11. The most recent file in `sessions/` sorted descending.

Then pull supporting notes on demand:

- `decisions/` for architectural or product choices relevant to the task.
- `research/` for synthesized external research.
- `sources/` for raw captures only when provenance matters.
- `runbooks/` for local dev, deploy, QA, recovery, or repeated operations.
- `agent-outbox/` for reports from parallel agents that have not yet been integrated.
- `bases/` for project dashboards over decisions, sessions, tasks, and other frontmatter-backed notes.
- `canvases/` for architecture, flow, and multi-agent planning maps when a visual graph makes the system easier to understand.

Do not read every note up front. Start with the required files, then search or open only what the request needs.

If any required file is missing, treat that as a vault setup issue and surface it before proceeding.

### Existing repo backfill protocol

When this vault is attached to an existing codebase, first backfill the memory layer before making feature changes:

1. Inspect the repo shape, package manifests, framework config, routes, API handlers, database/schema files, auth, integrations, environment examples, tests, deployment files, and recent git history.
   - Use local git evidence: recent commits, merge commits, tags, branches, release commits, major file movement, and durable choices.
   - Use GitHub evidence when `gh` is installed and authenticated: merged PRs, open PRs, closed PRs, releases, and linked issues that explain project direction.
2. Populate `04-code-map.md` with discovered entrypoints, routes, commands, data, services, env vars, tests, deployment, and fragile areas.
3. Populate `02-architecture.md` with architecture facts proven by code, config, docs, git history, or merged PRs. Do not infer product intent beyond what the repo or existing docs support.
4. Add `runbooks/local-dev.md` and `runbooks/deploy.md` when the commands are discoverable.
5. Update `knowledge/index.md` with durable project knowledge and record unknowns in `tasks.md`.
6. Update `handoff.md` with the backfill outcome and next recommended work.
7. Create decision records only for durable choices that are documented, clearly visible in the codebase, or strongly evidenced by merged PRs/commits.

---

## 2. Where things go

Every note has exactly one home. Route by artifact type, not topic.

- Root singleton notes (`01-project-context.md`, `02-architecture.md`, `03-status.md`, `04-code-map.md`, `tasks.md`, `handoff.md`, `LESSONS.md`) - update in place; never duplicate.
- `knowledge/` - agent-compiled durable wiki notes. `knowledge/index.md` is the map; `knowledge/log.md` is the append-only ingest/query/change log.
- `sources/` - raw captures from docs, web clips, transcripts, PDFs converted to Markdown, and other provenance material. Do not treat raw sources as final knowledge.
- `decisions/` - one file per decision, named `YYYY-MM-DD-<decision-slug>.md` (verb-led, specific — e.g., `YYYY-MM-DD-pick-stripe-over-paddle.md`). A wrong decision gets a new superseding decision.
- `sessions/` - one file per working session, named `YYYY-MM-DD.md` or `YYYY-MM-DD-<n>.md`.
- `research/` - synthesized external information, one topic per file, with sources cited.
- `runbooks/` - repeatable procedures for local dev, deployment, recovery, QA, client handoff, and scheduled tasks.
- `prompts/` - reusable prompt fragments worth keeping.
- `agent-outbox/` - temporary parallel-agent reports. The lead agent integrates useful content elsewhere, then clears or archives the report.
- `bases/` - Obsidian Bases dashboards and views.
- `canvases/` - JSON Canvas maps for architecture, flows, or multi-agent plans. Use only when relationships are easier to review visually than in a note.
- `templates/` - Templater-compatible templates. Agents should not modify templates without an explicit request.
- `attachments/` - images, PDFs, screenshots, and other binary artifacts referenced from notes.

If a note feels like it could go in two places, it likely belongs in `decisions/` if it records a choice, `knowledge/` if it is durable project knowledge, or `research/` if it synthesizes external information.

---

## 3. Canonical schemas

Every Markdown note has YAML frontmatter. Use exactly the schema for the note type. Do not invent top-level keys without updating this file first.

### `01-project-context.md`

```yaml
---
type: project-context
project: westline-style-selector
client: 
status: planning | active | blocked | shipped | archived
created: 2026-05-20
tags: [project, westline]
---
```

### `02-architecture.md`

```yaml
---
type: architecture
project: westline-style-selector
status: draft | accepted | superseded
tags: [architecture]
---
```

### `03-status.md`

```yaml
---
type: status
project: westline-style-selector
phase: spinup
status: planning | active | blocked | shipped | archived
updated: 2026-05-20
tags: [status]
---
```

### `04-code-map.md`

```yaml
---
type: code-map
project: westline-style-selector
updated: 2026-05-20
tags: [code-map]
---
```

### `LESSONS.md`

```yaml
---
type: lessons
project: westline-style-selector
updated: 2026-05-20
tags: [lessons]
---
```

### `knowledge/index.md`

```yaml
---
type: knowledge-index
project: westline-style-selector
updated: 2026-05-20
tags: [knowledge]
---
```

### `knowledge/log.md`

```yaml
---
type: knowledge-log
project: westline-style-selector
updated: 2026-05-20
tags: [knowledge, log]
---
```

### `knowledge/<topic-slug>.md`

```yaml
---
type: knowledge
project: westline-style-selector
status: draft | verified | stale | superseded
last_checked: 2026-05-20
source_count: 0
confidence: low | medium | high
tags: [knowledge]
---
```

### `sources/<source-slug>.md`

```yaml
---
type: source
project: westline-style-selector
source: <url-or-citation>
captured: 2026-05-20
processed: false
tags: [source]
---
```

### `decisions/YYYY-MM-DD-<decision-slug>.md`

```yaml
---
type: decision
project: westline-style-selector
date: 2026-05-20
status: accepted | rejected | superseded
supersedes: <optional decision filename>
tags: [decision]
---
```

### `sessions/YYYY-MM-DD.md`

```yaml
---
type: session
project: westline-style-selector
date: 2026-05-20
agent: claude-code | codex | cursor | other
tags: [session]
---
```

### `research/<topic-slug>.md`

```yaml
---
type: research
project: westline-style-selector
source: <url-or-citation>
date: 2026-05-20
tags: [research]
---
```

### `handoff.md`

```yaml
---
type: handoff
project: westline-style-selector
updated: 2026-05-20
tags: [handoff]
---
```

### `tasks.md`

```yaml
---
type: tasks
project: westline-style-selector
tags: [tasks]
---
```

The `westline-style-selector` (project slug), ``, `2026-05-20`, and `spinup` placeholders are filled by `wm-create-vault.sh` or `wm-migrate-vault-schema.sh`. If you see one in a real project note, flag it as a setup bug. The `<decision-slug>` placeholder is **agent-filled** at decision-file creation time — it should be a verb-led kebab-case slug (`pick-stripe-over-paddle`, `migrate-to-drizzle`, etc.) and is not auto-stamped.

---

## 4. Naming conventions

- Filenames: kebab-case except canonical root files (`AGENTS.md`, `CLAUDE.md`, `LESSONS.md`).
- Dated filenames: `decisions/YYYY-MM-DD-<decision-slug>.md` (verb-led slug, e.g., `pick-stripe-over-paddle`); `sessions/YYYY-MM-DD.md` (or `YYYY-MM-DD-<n>.md` for multiple sessions in a day).
- Wikilinks: prefer `[[02-architecture]]` over relative Markdown links for vault notes.
- Links to sections: `[[04-code-map#Commands]]`.
- Tags: lowercase, hyphenated, in frontmatter `tags:`.
- Headings: sentence case.
- Decision slugs: verb-led and specific, e.g. `pick-stripe-over-paddle`.

---

## 5. Decision records

Every file in `decisions/` follows this body structure:

```markdown
## Context

## Decision

## Why

## Alternatives

## Consequences

## Links
- [[related-decision]]
- [[knowledge/relevant-topic]]
- External: <url>
```

A decision without a `Why` section is not a decision record. Always include it.

---

## 6. Knowledge workflow

Use a source to synthesis workflow:

1. Put raw captures in `sources/` only when the source itself needs to be preserved.
2. Distill durable project knowledge into `knowledge/<topic>.md`.
3. Update `knowledge/index.md` so agents can find the note later.
4. Append an entry to `knowledge/log.md` describing what was added, changed, verified, or marked stale.
5. If the knowledge changes project direction, add or supersede a decision record.

Do not dump web pages, logs, or transcripts into `knowledge/`. That folder is for compiled understanding.

---

## 7. Agent behavior rules

These are non-negotiable:

1. Read the session-start files before substantive work.
2. Use filesystem tools for normal note reads/writes.
3. Rename or move linked notes with `obsidian move ... to="..."` or `obsidian rename ... name="..."` so Obsidian can update internal links when that setting is enabled.
4. Never edit `.obsidian/` directly unless the user specifically asks for vault configuration work.
5. No secrets in vault notes. Reference 1Password, `.env`, or the project secret store by name only.
6. One writer per note per session. Parallel agents write to separate files under `agent-outbox/`; the lead agent integrates.
7. Singletons stay singleton. Do not create `03-status-v2.md`, `new-handoff.md`, or similar.
8. No silent rewrites of decisions. Supersede them with a new decision.
9. If the user corrects the agent on a reusable pattern, update `LESSONS.md`.
10. If the agent learns durable repo structure, commands, or deployment facts, update `04-code-map.md`.
11. If external research becomes durable project knowledge, update `knowledge/`, not just `sessions/`.
12. If a task spans three or more concrete steps, write or update a session plan in `tasks.md` before coding.
13. For existing repos, complete the backfill protocol before large feature work.
14. Use the optional templates in `templates/` for project briefs, implementation plans, QA checklists, and release notes when the project warrants them.

---

## 8. Wrap-up protocol

At the end of every substantive session, before returning control:

1. Write or append a session log in `sessions/2026-05-20.md`.
2. Update `03-status.md` when phase, status, blockers, completed work, or next actions changed.
3. Update `handoff.md` with outcome, files touched, decisions, warnings, and recommended next action.
4. Update `tasks.md` so Now / Next / Later reflects reality.
5. Update `04-code-map.md` if entrypoints, commands, env vars, routes, data model, or deployment changed.
6. Update `LESSONS.md` if the user corrected a repeatable mistake.
7. Update `knowledge/index.md` and `knowledge/log.md` if durable knowledge was added or revised.
8. Integrate useful `agent-outbox/` reports or leave a clear note explaining why they are still pending.
9. Run `obsidian unresolved` when the Obsidian CLI is available. Fix new broken wikilinks or note the residual issue in the session log.

A session that skips wrap-up forces the next agent to rediscover state. Treat wrap-up as part of the task, not optional documentation.
