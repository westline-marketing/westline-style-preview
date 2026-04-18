# Changelog

All notable changes to `@westline/style-preview` are documented here.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-04-18

### Changed
- Docs: README, GUIDE, and CLAUDE.md updated to reflect public npm distribution (no `NPM_TOKEN` or `.npmrc` required)

## [0.1.0] - 2026-04-18

Initial public release.

### Added
- Core theming engine with CSS custom property overrides on a themed wrapper class
- `StylePreview` client component with draggable edge trigger and drawer UI
- `PrepaintScript` server-safe component to apply saved preview state before hydration
- Auto-derived drawer chrome from preset swatches (`drawerTheme: 'auto'`)
- Built-in drawer themes: `studio`, `techie`, `rustic`
- `?previewDrawer=` dev-mode override for theme preview
- `validatePreset` and `findPreset` utilities
- Full keyboard navigation and `prefers-reduced-motion` support
- Contrast-safe accent foregrounds on CTA buttons
- `NEXT_PUBLIC_ENABLE_STYLE_PREVIEW=true` env gate for Next.js consumers
