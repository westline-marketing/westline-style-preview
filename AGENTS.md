<!-- BEGIN WM OBSIDIAN BOOTSTRAP -->
## Obsidian bootstrap for westline-style-selector

This project uses vault/ as persistent memory for Codex, Claude Code, and other coding agents.

Session start:
- Read vault/AGENTS.md for Codex-specific entry instructions.
- Read vault/CLAUDE.md for the canonical vault operating manual + YAML schema.
- Read vault/01-project-context.md for orientation.
- Read vault/02-architecture.md and vault/04-code-map.md for system shape.
- Read vault/03-status.md for current state.
- Read newest file in vault/sessions/.
- Read vault/handoff.md.
- Check vault/tasks.md.
- Read vault/LESSONS.md and vault/knowledge/index.md before non-trivial work.
- For existing repos with thin memory, complete the backfill protocol in vault/CLAUDE.md before major feature work.

Rules:
- Read/write notes with filesystem tools.
- Rename/move linked notes via obsidian move ... to="..." or obsidian rename ... name="..." so Obsidian can preserve wikilinks.
- Never edit vault/.obsidian/ directly.
- No secrets in vault notes; use .env.
- Parallel agents write reports to vault/agent-outbox/; the lead integrates useful findings.
- At wrap-up, update the vault state files required by vault/CLAUDE.md.
<!-- END WM OBSIDIAN BOOTSTRAP -->
