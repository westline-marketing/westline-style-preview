# vault-skeleton

This folder is the **canonical Obsidian vault skeleton** for Westline Marketing client projects. It is *not* a real project vault — it's the template that gets copied into every new project by `wm-create-vault.sh`.

## What lives here

- `CLAUDE.md` — canonical vault operating manual for Claude Code, Codex, Cursor, and other agents.
- `AGENTS.md` — Codex entry point that bridges into `CLAUDE.md`.
- `01-project-context.md`, `02-architecture.md`, `03-status.md`, `04-code-map.md` — singleton project state and technical map files.
- `tasks.md`, `handoff.md`, `LESSONS.md` — rolling state, handoff, and self-improvement files.
- `knowledge/` — durable compiled project knowledge (`index.md` and `log.md` are required).
- `sources/` — raw captures and provenance material before synthesis.
- `decisions/`, `sessions/`, `research/`, `runbooks/`, `prompts/`, `agent-outbox/`, `bases/`, `canvases/`, `templates/`, `attachments/` — standard agent memory folders.
- `bases/decisions.base`, `bases/sessions.base`, `bases/tasks.base` — starter Obsidian Bases for local project dashboards.
- `templates/project-brief.md`, `templates/implementation-plan.md`, `templates/qa-checklist.md`, `templates/release-notes.md` — optional docs for projects that need more ceremony.

## Do not edit directly

This skeleton is consumed by tooling. Editing it ad-hoc causes drift between projects spun up before vs. after a change.

To update the skeleton, follow the **agent skeleton update process**:
1. Open a session with the agent and describe the change.
2. The agent updates the skeleton, bumps any version markers, and notes the change.
3. New projects pick up the change automatically; existing projects are migrated explicitly when needed (never silently).

## One-time setup

After this folder is first created on a new machine, it must be opened once in Obsidian so that the **Templater** and **Obsidian Git** plugins can be trusted and configured. Global Obsidian agent skills for Claude Code and Codex are installed separately with `wm-install-obsidian-agent-skills.sh`.
