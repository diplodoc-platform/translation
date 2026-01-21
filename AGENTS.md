## Common rules and standards

This package is a submodule in the Diplodoc metapackage. When working in metapackage mode, also follow:

- `../../.agents/style-and-testing.md` — code style, import organization, testing, English-only docs/comments/commit messages
- `../../.agents/monorepo.md` — workspace vs standalone dependency management (`--no-workspaces`)
- `../../.agents/dev-infrastructure.md` — infrastructure update recipes and CI conventions

## Project description

`@diplodoc/translation` provides utilities for extracting translatable content from Markdown (and some structured formats) into XLIFF plus a “skeleton”, and composing translated content back.

Primary entry points:

- `extract(...)` / `compose(...)` — high-level API (`src/api/`)
- JSON ref helpers — `linkRefs(...)` / `unlinkRefs(...)` (`src/json/`)
- Directives — `noTranslate` (`src/directives/`)

## Structure

- `src/` — sources
- `lib/` — build output (generated)
- `schemas/` — published schemas
- `esbuild/` — bundling configuration (Node target)
- `scripts/` — small maintenance scripts (cross-platform)

## Development commands

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

## Dependency management (submodule rules)

When adding/updating dependencies inside this submodule, keep standalone mode working:

```bash
npm install --no-workspaces <pkg>
npm install --no-workspaces --package-lock-only
```

## Testing

- Framework: **Vitest**
- Tests live next to implementation as `*.spec.ts`
- Snapshots are stored in `__snapshots__/`

Run tests:

```bash
npm test
```
