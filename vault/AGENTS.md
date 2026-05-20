# AGENTS.md - Codex Entry Point

This vault is the project's persistent memory. `CLAUDE.md` is the canonical vault operating manual for all agents; Codex reads this file as the bridge into that manual.

Session start:

1. Read `CLAUDE.md`.
2. Read `01-project-context.md`.
3. Read `02-architecture.md`.
4. Read `04-code-map.md`.
5. Read `03-status.md`.
6. Read `tasks.md`.
7. Read `handoff.md`.
8. Read `LESSONS.md`.
9. Read `knowledge/index.md`.
10. Read the newest note in `sessions/`.

For an existing repo that has just received a vault, complete the backfill protocol in `CLAUDE.md` before large feature work. Populate `04-code-map.md`, `02-architecture.md`, `runbooks/`, `knowledge/index.md`, `tasks.md`, and `handoff.md` from repo evidence.

Rules:

- Use filesystem tools for normal note reads/writes.
- Do not edit `.obsidian/` unless explicitly asked to configure Obsidian.
- No secrets in vault notes.
- Rename or move linked notes only with Obsidian-aware tooling when wikilinks may exist.
- At wrap-up, update the vault state files required by `CLAUDE.md`.
- Use `agent-outbox/` for parallel-agent reports and integrate useful findings before wrap-up.
