---
type: tasks
project: westline-style-selector
tags: [tasks]
---

# Tasks

## Now

- [x] Create and backfill the Westline Obsidian memory vault.
- [x] Run vault migration and doctor after backfill.

## Next

- [ ] Human review: confirm package owner/release steward and downstream consumer repos.
- [ ] Human action if needed: quit Obsidian and register this vault in Obsidian, since the standard create script refused to run while Obsidian was open.
- [ ] Commit `vault/`, root `AGENTS.md`, root `CLAUDE.md` bootstrap update, and `.gitignore` update when ready.

## Later

- [ ] Consider adding an explicit release checklist to `README.md` or `GUIDE.md` if maintainers want release steps in repo docs instead of only in memory.
- [ ] Verify npm registry state before the next release to confirm whether `0.1.4` is still latest.
- [ ] Inventory consuming client repos that depend on `@westline/style-selector`.

## Open questions

- Who owns npm releases for this package?
- Are any consuming repos still using legacy `storageKey` migration?
- Should GitHub Releases be created for version tags, or are tags plus changelog sufficient?
